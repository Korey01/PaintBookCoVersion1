FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Pre-download model weights at build time (avoids cold start delay)
RUN python -c "
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation
print('Downloading SegFormer B5 ADE20K...')
SegformerImageProcessor.from_pretrained('nvidia/segformer-b5-finetuned-ade-640-640')
SegformerForSemanticSegmentation.from_pretrained('nvidia/segformer-b5-finetuned-ade-640-640')
print('Model downloaded successfully')
"

COPY app.py .

EXPOSE 8080

CMD ["python", "app.py"]
