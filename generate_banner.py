import os
from google import genai
from google.genai import types

# Initialize client with API key
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

PROMPT = """Create a stunning hero banner for a Jewish Torah learning app.
Style: Modern glassmorphism with golden glowing orbs, abstract geometric shapes.
Colors: Gold (#C9A227), deep brown (#2C1810), cream (#FFFDF8).
Features: Floating golden particles, premium luxury feel, subtle menorah and shield motifs.
Background: Dark brown gradient with golden light rays and glowing orbs.
Aspect ratio: 16:9, wide banner format.
No text, just beautiful abstract design elements."""

# Generate image
response = client.models.generate_content(
    model="gemini-2.0-flash-exp",
    contents=[PROMPT],
    config=types.GenerateContentConfig(
        response_modalities=["TEXT", "IMAGE"]
    )
)

# Save generated image
for part in response.candidates[0].content.parts:
    if part.inline_data is not None:
        image_data = part.inline_data.data
        with open("public/hero-banner-new.png", "wb") as f:
            f.write(image_data)
        print("Image saved to public/hero-banner-new.png")
    elif part.text is not None:
        print(part.text)
