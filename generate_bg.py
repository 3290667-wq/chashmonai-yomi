import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

prompt = """Create a cinematic full-page background image.
Scene: A single Orthodox Jewish soldier seen from behind, wearing IDF military uniform and wrapped in a white tallit (prayer shawl), standing on a hilltop.
Location: Golan Heights, Israel - dramatic mountainous landscape stretching into the distance.
Time: Golden hour, warm sunrise/sunset light.
Composition: Soldier positioned in lower third of image, vast Golan Heights mountains and valleys filling the frame.
Mood: Spiritual, powerful, contemplative, connection to the land.
Style: Cinematic photography, epic landscape, documentary feel.
Colors: Warm golden light, olive green uniform, white tallit, earth tones of mountains, blue sky.
Quality: Ultra high resolution, cinematic, professional landscape photography.
The soldier should be a silhouette or semi-silhouette against the dramatic landscape.
No text."""

print("Generating main-bg.png...")
try:
    response = client.models.generate_content(
        model="gemini-2.0-flash-exp-image-generation",
        contents=[prompt],
        config=types.GenerateContentConfig(
            response_modalities=["TEXT", "IMAGE"]
        )
    )

    for part in response.candidates[0].content.parts:
        if part.inline_data is not None:
            image_data = part.inline_data.data
            with open("public/main-bg.png", "wb") as f:
                f.write(image_data)
            print("Saved to public/main-bg.png")
        elif part.text is not None:
            print(part.text)
except Exception as e:
    print(f"Error: {e}")

print("Done!")
