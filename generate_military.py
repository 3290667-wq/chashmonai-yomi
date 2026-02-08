import os
from google import genai
from google.genai import types

client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

images_to_generate = [
    {
        "name": "hero-banner.png",
        "prompt": """Create a cinematic wide banner image of Orthodox Jewish soldiers (with kippot/yarmulkes) standing heroically on a mountain peak at golden hour sunset.
Style: Military tactical, epic cinematic photography, dramatic lighting.
Scene: Soldiers in IDF military uniforms looking over a breathtaking Israeli desert landscape with mountains and valleys.
Mood: Inspiring, heroic, powerful, spiritual.
Colors: Golden sunset light, deep shadows, warm tones, military olive green accents.
Composition: Wide 16:9 panoramic shot, soldiers silhouetted against dramatic sky.
Quality: Ultra realistic, cinematic, professional military photography style.
No text."""
    },
    {
        "name": "login-bg.png",
        "prompt": """Create a dramatic portrait-oriented background of an Orthodox Jewish soldier (with kippa) praying at sunrise on a hilltop.
Style: Cinematic military photography, spiritual moment, tactical aesthetic.
Scene: Single soldier in IDF combat uniform, wrapped in tallit (prayer shawl), facing the rising sun over Israeli mountains.
Mood: Spiritual, powerful, peaceful yet strong, contemplative.
Colors: Deep blue dawn sky transitioning to golden sunrise, silhouette effect.
Lighting: Dramatic backlighting from sunrise, rim lighting on soldier.
Quality: Ultra realistic, emotional, cinematic photography.
No text."""
    },
    {
        "name": "pattern-overlay.png",
        "prompt": """Create a seamless tileable military tactical pattern overlay.
Style: Modern tactical/military camouflage inspired geometric pattern.
Elements: Subtle hexagonal grid, tactical crosshairs, military insignia shapes.
Colors: Dark olive green (#3d4a3a), gold (#C9A227) accent lines, very subtle.
Opacity: Design for low opacity overlay use.
Feel: Professional military, tactical, modern IDF aesthetic.
Seamless tile pattern that can repeat."""
    },
    {
        "name": "dashboard-bg.png",
        "prompt": """Create a wide cinematic image of Orthodox Jewish soldiers studying Torah together in a military base.
Style: Warm documentary photography, military setting, spiritual learning.
Scene: Group of soldiers with kippot gathered around a table with books, military equipment visible in background.
Setting: IDF base, sandbags, military tents, Israeli flag.
Mood: Brotherhood, learning, dedication, unity.
Lighting: Warm golden hour light streaming in, creating a spiritual atmosphere.
Colors: Military olive, warm gold tones, earth colors.
Quality: Cinematic, emotional, documentary style.
No text."""
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
