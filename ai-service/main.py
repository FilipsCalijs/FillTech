import logging
import os
from contextlib import asynccontextmanager

import httpx
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# DEV_MODE=1 — запускается без моделей для проверки связи Node → Python
DEV_MODE = os.environ.get("DEV_MODE", "0") == "1"

pipeline = None


@asynccontextmanager
async def lifespan(app: FastAPI):
    global pipeline
    if DEV_MODE:
        logger.info("DEV_MODE — модели не загружаются")
    else:
        from pipeline.watermark import WatermarkPipeline
        logger.info("Loading AI models...")
        pipeline = WatermarkPipeline()
        logger.info("Models loaded — ready.")
    yield


app = FastAPI(lifespan=lifespan)


class ProcessRequest(BaseModel):
    generationId: str
    inputUrl: str


@app.get("/health")
def health():
    return {"status": "ok", "dev_mode": DEV_MODE, "models_loaded": pipeline is not None}


@app.post("/process/watermark")
async def process_watermark(req: ProcessRequest):
    if DEV_MODE or pipeline is None:
        # Заглушка — возвращает оригинал без обработки
        logger.info(f"[DEV] stub response for generation {req.generationId}")
        return {"resultUrl": req.inputUrl}

    async with httpx.AsyncClient(timeout=30) as client:
        resp = await client.get(req.inputUrl)
        if resp.status_code != 200:
            raise HTTPException(500, f"Failed to download image: {resp.status_code}")
        image_bytes = resp.content

    try:
        result_bytes = pipeline.process(image_bytes)
    except Exception as e:
        logger.exception("Pipeline error")
        raise HTTPException(500, str(e))

    from utils.r2 import upload_to_r2
    result_url = upload_to_r2(result_bytes, "image/png", req.generationId)
    return {"resultUrl": result_url}
