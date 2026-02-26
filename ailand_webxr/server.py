import asyncio
import base64
import json
import cv2
import numpy as np
from ultralytics import YOLO
import websockets

model = YOLO("yolov8n.pt")
MIN_PERCENT = 30

async def handler(websocket):
    async for message in websocket:
        data = json.loads(message)

        img_bytes = base64.b64decode(data["image"])
        img_array = np.frombuffer(img_bytes, np.uint8)
        frame = cv2.imdecode(img_array, cv2.IMREAD_COLOR)

        results = model(frame, verbose=False)

        detections = []
        for r in results:
            if r.boxes is None:
                continue
            for box in r.boxes:
                percent = int(float(box.conf) * 100)
                if percent < MIN_PERCENT:
                    continue

                label = model.names[int(box.cls)]
                detections.append({
                    "class": f"{label} {percent}%",
                    "bbox": [float(x) for x in box.xyxy[0]]
                })

        await websocket.send(json.dumps(detections))

async def main():
    async with websockets.serve(handler, "0.0.0.0", 8765, max_size=10_000_000):
        await asyncio.Future()

asyncio.run(main())
