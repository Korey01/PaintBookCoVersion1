import base64
import io
import json
import numpy as np
from flask import Flask, request, jsonify
from PIL import Image
import torch
from transformers import SegformerImageProcessor, SegformerForSemanticSegmentation

app = Flask(__name__)

# ADE20K class indices relevant to painting
WALL_CLASSES = {0}  # wall
EXCLUDED_CLASSES = {
    3,   # floor
    5,   # ceiling
    8,   # windowpane
    14,  # door
    18,  # curtain
    19,  # chair
    10,  # table
    20,  # sofa
    22,  # painting/picture
    24,  # lamp
    31,  # cabinet
    35,  # shelf
    57,  # rug/carpet
    15,  # bed
    36,  # cushion
    44,  # television
}

# Load model once at startup
print("Loading SegFormer B5 ADE20K model...")
processor = SegformerImageProcessor.from_pretrained(
    "nvidia/segformer-b5-finetuned-ade-640-640"
)
model = SegformerForSemanticSegmentation.from_pretrained(
    "nvidia/segformer-b5-finetuned-ade-640-640"
)
model.eval()
print("Model loaded successfully")

def mask_to_base64(mask_array: np.ndarray) -> str:
    """Convert boolean numpy mask to base64 PNG"""
    mask_uint8 = (mask_array * 255).astype(np.uint8)
    img = Image.fromarray(mask_uint8, mode='L')
    buffer = io.BytesIO()
    img.save(buffer, format='PNG')
    buffer.seek(0)
    return base64.b64encode(buffer.read()).decode('utf-8')

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "model": "segformer-b5-ade-640-640"})

@app.route('/segment', methods=['POST'])
def segment():
    try:
        data = request.get_json()
        if not data or 'image_base64' not in data:
            return jsonify({"error": "image_base64 required"}), 400

        # Decode image
        image_bytes = base64.b64decode(data['image_base64'])
        image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        original_size = image.size  # (width, height)

        # Run SegFormer inference
        inputs = processor(images=image, return_tensors="pt")
        with torch.no_grad():
            outputs = model(**inputs)

        # Get predicted segmentation map
        logits = outputs.logits  # shape: (1, num_classes, H/4, W/4)

        # Upsample to original image size
        upsampled = torch.nn.functional.interpolate(
            logits,
            size=(original_size[1], original_size[0]),  # (height, width)
            mode='bilinear',
            align_corners=False
        )
        predicted_map = upsampled.argmax(dim=1).squeeze().numpy()  # (H, W)

        # Create wall mask (where predicted class is wall)
        wall_mask = np.isin(predicted_map, list(WALL_CLASSES))

        # Create exclusion mask (floor, ceiling, windows, furniture etc)
        exclusion_mask = np.isin(predicted_map, list(EXCLUDED_CLASSES))

        # Calculate coverage stats
        total_pixels = predicted_map.size
        wall_pixels = wall_mask.sum()
        wall_coverage = float(wall_pixels / total_pixels * 100)

        print(f"Wall coverage: {wall_coverage:.1f}%, Image size: {original_size}")

        if wall_coverage < 0.5:
            return jsonify({
                "error": "segmentation_unavailable",
                "detail": f"No walls detected (wall coverage: {wall_coverage:.1f}%)"
            })

        response = {
            "wall_mask": f"data:image/png;base64,{mask_to_base64(wall_mask)}",
            "exclusion_mask": f"data:image/png;base64,{mask_to_base64(exclusion_mask)}",
            "wall_coverage_percent": round(wall_coverage, 1),
            "image_size": list(original_size),
        }

        return jsonify(response)

    except Exception as e:
        print(f"Segment error: {e}")
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=8080)
