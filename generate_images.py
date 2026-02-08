import os
from google import genai
from google.genai import types

# Initialize client with API key
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

images_to_generate = [
    {
        "name": "hero-banner.png",
        "prompt": """Create a stunning wide hero banner for a Jewish Torah learning app.
Style: Modern glassmorphism with golden glowing orbs, abstract geometric shapes.
Colors: Gold (#C9A227), deep brown (#2C1810), cream (#FFFDF8).
Features: Floating golden particles, premium luxury feel, subtle menorah silhouette.
Background: Dark brown gradient with golden light rays emanating from center.
Abstract golden shield shape in the center, glowing softly.
Aspect ratio: 16:9, wide banner format.
No text, just beautiful abstract design elements."""
    },
    {
        "name": "login-bg.png",
        "prompt": """Create an elegant full-page background for a login screen.
Style: Dark luxurious with golden accents, glassmorphism aesthetic.
Colors: Deep brown (#2C1810), gold (#C9A227), soft cream (#FFFDF8).
Features: Aurora-like golden light waves, floating particles, abstract geometric patterns.
Mood: Premium, spiritual, welcoming.
Include subtle Jewish motifs like abstract star patterns.
Very dark background with golden glow effects.
No text, abstract only."""
    },
    {
        "name": "pattern-overlay.png",
        "prompt": """Create a seamless tileable pattern overlay.
Style: Subtle geometric pattern inspired by Jewish art.
Colors: Gold (#C9A227) lines on transparent/dark background.
Features: Interlocking hexagons or star of david patterns, very subtle and elegant.
Opacity should be low - this is meant to be an overlay.
Clean geometric lines, luxury feel.
Seamless tile pattern."""
    }
]

for img in images_to_generate:
    print(f"\nGenerating {img['name']}...")
    try:
        response = client.models.generate_content(
            model="gemini-2.0-flash-exp-image-generation",
            contents=[img["prompt"]],
            config=types.GenerateContentConfig(
                response_modalities=["TEXT", "IMAGE"]
            )
        )

        for part in response.candidates[0].content.parts:
            if part.inline_data is not None:
                image_data = part.inline_data.data
                with open(f"public/{img['name']}", "wb") as f:
                    f.write(image_data)
                print(f"Saved to public/{img['name']}")
            elif part.text is not None:
                print(part.text)
    except Exception as e:
        print(f"Error generating {img['name']}: {e}")

print("\nDone!")
