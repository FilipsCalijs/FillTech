# CPU by default (local dev on Mac).
# For GPU server: --build-arg PYTORCH_INDEX_URL=https://download.pytorch.org/whl/cu121
ARG PYTORCH_INDEX_URL=https://download.pytorch.org/whl/cpu

FROM python:3.11-slim

ARG PYTORCH_INDEX_URL

RUN apt-get update && apt-get install -y --no-install-recommends \
    git gcc g++ libgl1 libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# PyTorch — cached as its own layer (changes rarely)
RUN pip install --no-cache-dir torch torchvision --index-url ${PYTORCH_INDEX_URL}

# GroundingDINO — needs compilation
RUN pip install --no-cache-dir \
    "git+https://github.com/IDEA-Research/GroundingDINO.git"

# SAM2
RUN pip install --no-cache-dir \
    "git+https://github.com/facebookresearch/sam2.git"

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
