import os
from google import genai
from google.genai import types

# Initialize client with API key
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

def generate_image(prompt, filename):
    print(f"Generating: {filename}...")
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
            with open(filename, "wb") as f:
                f.write(image_data)
            print(f"Saved: {filename}")
            return True
        elif part.text is not None:
            print(f"Text response: {part.text}")
    return False

# Image 1: Luxurious shield emblem
generate_image(
    """Create a luxurious golden shield emblem, military style but warm and prestigious.
    The shield should have elegant gold and dark brown colors, with ornate decorative borders.
    Style: Premium, royal, warm family feeling. Clean modern design.
    No text. Just the decorative shield shape with subtle star of david pattern.
    White/transparent background. High quality app icon style.""",
    "public/shield-emblem.png"
)

# Image 2: Hero banner background - warm sunset over mountains
generate_image(
    """Beautiful warm sunset panorama over rolling hills and mountains.
    Golden hour lighting with warm orange, gold and soft purple tones.
    Peaceful, inspiring, prestigious feeling.
    Suitable as a website hero banner background.
    Soft gradient sky. High quality, 16:9 aspect ratio landscape.""",
    "public/hero-banner.png"
)

# Image 3: Decorative pattern for cards
generate_image(
    """Subtle elegant geometric pattern with Star of David motifs.
    Very light gold and cream colors on white background.
    Luxurious, premium feel like high-end stationery.
    Seamless tileable pattern. Opacity around 10-15%.
    Minimalist, sophisticated design.""",
    "public/pattern-bg.png"
)

print("All images generated!")
