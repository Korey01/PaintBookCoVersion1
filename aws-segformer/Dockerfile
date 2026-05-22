FROM --platform=linux/amd64 python:3.11-slim

WORKDIR /app

RUN apt-get update && apt-get install -y gcc g++ curl && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

RUN python -c "from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation; SegformerImageProcessor.from_pretrained('nvidia/segformer-b5-finetuned-ade-640-640'); SegformerForSemanticSegmentation.from_pretrained('nvidia/segformer-b5-finetuned-ade-640-640'); print('Model ready')"

COPY app.py .

EXPOSE 8080

CMD ["python", "app.py"]
