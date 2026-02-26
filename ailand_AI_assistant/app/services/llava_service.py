import requests
import json
from typing import Optional

class LlavaService:
    OLLAMA_URL = "http://localhost:11434/api/generate"
    MODEL = "llava:7b"

    @staticmethod
    def analyze_image(prompt: str, image_base64: str) -> Optional[str]:
        """
        Sends an image and prompt to the local Ollama Llava model.
        """
        payload = {
            "model": LlavaService.MODEL,
            "prompt": prompt,
            "images": [image_base64],
            "stream": False
        }

        try:
            response = requests.post(LlavaService.OLLAMA_URL, json=payload)
            response.raise_for_status()
            result = response.json()
            return result.get("response", "No response content")
        except requests.exceptions.RequestException as e:
            print(f"Error calling Ollama Llava: {e}")
            return None
