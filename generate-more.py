import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

def generate_image(prompt, filename):
    print(f"Generating: {filename}...")
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=[prompt],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"]
            )
        )

        if response.candidates and response.candidates[0].content:
            for part in response.candidates[0].content.parts:
                if part.inline_data is not None:
                    image_data = part.inline_data.data
                    with open(filename, "wb") as f:
                        f.write(image_data)
                    print(f"Saved: {filename}")
                    return True
                elif part.text is not None:
                    print(f"Text: {part.text[:100]}...")
    except Exception as e:
        print(f"Error: {e}")
    return False

# Image 3: Button gradient background
generate_image(
    """A smooth gradient button background, going from rich gold on top to deep bronze at bottom.
    Elegant, shiny, metallic look.
    Simple rectangular shape. High quality. Size 400x100 pixels style.""",
    "public/button-gold.png"
)

# Image 4: Card decoration
generate_image(
    """Elegant corner decoration ornament in gold color.
    Classic baroque style flourish.
    For decorating card corners on a website.
    Transparent background, just the golden ornament.
    High quality, decorative.""",
    "public/corner-ornament.png"
)

# Image 5: Mobile app splash background
generate_image(
    """Beautiful warm gradient background for mobile app.
    Cream to soft gold to light brown gradient.
    Subtle light rays from top.
    Elegant, premium, welcoming feel.
    Vertical orientation for mobile screens.""",
    "public/splash-bg.png"
)

print("Done!")
