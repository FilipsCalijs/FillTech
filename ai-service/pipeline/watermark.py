import io
import logging
import os

import numpy as np
import torch
from PIL import Image
from scipy.ndimage import binary_dilation

logger = logging.getLogger(__name__)

MODELS_DIR = os.environ.get("MODELS_DIR", "./models")
SAM2_WEIGHTS_URL = (
    "https://dl.fbaipublicfiles.com/segment_anything_2/092824/sam2.1_hiera_small.pt"
)

WATERMARK_PROMPT = "watermark . text overlay . logo . copyright . signature"
BOX_THRESHOLD = 0.25
TEXT_THRESHOLD = 0.20
MASK_DILATION = 10


def _get_device():
    if torch.cuda.is_available():
        return "cuda"
    # MPS (Apple Silicon) — некоторые операции не поддерживаются, используем cpu
    return "cpu"


class WatermarkPipeline:
    def __init__(self):
        self.device = _get_device()
        logger.info(f"Device: {self.device}")
        self._load_gdino()
        self._load_sam2()
        self._load_lama()

    def _load_gdino(self):
        from transformers import AutoModelForZeroShotObjectDetection, AutoProcessor

        model_id = "IDEA-Research/grounding-dino-base"
        logger.info("Loading GroundingDINO from HuggingFace...")
        self.gdino_processor = AutoProcessor.from_pretrained(model_id)
        self.gdino_model = AutoModelForZeroShotObjectDetection.from_pretrained(model_id).to(self.device)
        self.gdino_model.eval()
        logger.info("GroundingDINO ready")

    def _load_sam2(self):
        import urllib.request
        from sam2.build_sam import build_sam2
        from sam2.sam2_image_predictor import SAM2ImagePredictor

        weights_path = os.path.join(MODELS_DIR, "sam2.1_hiera_small.pt")
        if not os.path.exists(weights_path):
            os.makedirs(MODELS_DIR, exist_ok=True)
            logger.info("Downloading SAM2 weights (~185MB)...")
            urllib.request.urlretrieve(SAM2_WEIGHTS_URL, weights_path)
            logger.info("SAM2 weights downloaded")

        model = build_sam2("configs/sam2.1/sam2.1_hiera_s.yaml", weights_path, device=self.device)
        self.sam2 = SAM2ImagePredictor(model)
        logger.info("SAM2 ready")

    def _load_lama(self):
        from simple_lama_inpainting import SimpleLama
        self.lama = SimpleLama()
        logger.info("LaMa ready")

    def process(self, image_bytes: bytes) -> bytes:
        image = Image.open(io.BytesIO(image_bytes)).convert("RGB")
        image_np = np.array(image)

        # 1. GroundingDINO — обнаружение ватермарок
        boxes = self._detect_watermarks(image)
        if not len(boxes):
            logger.info("No watermarks detected — returning original")
            return image_bytes

        logger.info(f"Detected {len(boxes)} watermark region(s)")

        # 2. SAM2 — точные маски по bbox
        masks = self._generate_masks(image_np, boxes)
        if not len(masks):
            return image_bytes

        # 3. Объединить маски и расширить края
        combined = np.zeros(image_np.shape[:2], dtype=bool)
        for mask in masks:
            combined |= mask.astype(bool)
        combined = binary_dilation(combined, iterations=MASK_DILATION)

        mask_image = Image.fromarray((combined * 255).astype(np.uint8))

        # 4. LaMa — инпейнтинг
        result = self.lama(image, mask_image)

        out = io.BytesIO()
        result.save(out, format="PNG")
        return out.getvalue()

    def _detect_watermarks(self, image: Image.Image) -> np.ndarray:
        inputs = self.gdino_processor(
            images=image,
            text=WATERMARK_PROMPT,
            return_tensors="pt"
        ).to(self.device)

        with torch.no_grad():
            outputs = self.gdino_model(**inputs)

        results = self.gdino_processor.post_process_grounded_object_detection(
            outputs,
            inputs.input_ids,
            box_threshold=BOX_THRESHOLD,
            text_threshold=TEXT_THRESHOLD,
            target_sizes=[image.size[::-1]],
        )[0]

        boxes = results["boxes"].cpu().numpy()
        scores = results["scores"].cpu().numpy()
        return boxes[scores > BOX_THRESHOLD]

    def _generate_masks(self, image_np: np.ndarray, boxes: np.ndarray) -> list:
        with torch.inference_mode():
            self.sam2.set_image(image_np)
            masks, _, _ = self.sam2.predict(
                box=boxes,
                multimask_output=False,
            )

        # masks shape: (N, 1, H, W) или (N, H, W)
        if masks.ndim == 4:
            return [masks[i, 0] for i in range(len(masks))]
        return [masks[i] for i in range(len(masks))]
