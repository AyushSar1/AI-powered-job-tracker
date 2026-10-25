import requests
import json
import os

#not in use for now
OLLAMA_URL = os.getenv(
    "OLLAMA_URL",
    "http://localhost:11434/api/generate"
)


def generate_chat_response(prompt):
    response = requests.post(
        OLLAMA_URL,
        json={
            "model": "mistral",
            "prompt": prompt,
            "stream": True
        },
        stream=True
    )

    response.raise_for_status()

    for line in response.iter_lines():

        if not line:
            continue

        data = json.loads(line)

        if data.get("response"):
            yield data["response"]

        if data.get("done"):
            break