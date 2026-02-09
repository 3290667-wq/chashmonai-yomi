import os
from google import genai
from google.genai import types

# Initialize client with API key
client = genai.Client(api_key=os.environ.get("GOOGLE_API_KEY"))

# Image prompts for Chashmonaim app
prompts = [
    {
        "name": "hero-banner.png",
        "prompt": "Orthodox Jewish Haredi soldiers in IDF olive green uniforms studying Torah together during a break, sitting on ancient stone rocks, with dramatic Israeli desert mountains and valleys in the background, golden hour warm sunlight casting long shadows, cinematic photography style, epic landscape, warm golden and olive tones, professional photography, inspiring military brotherhood moment"
    },
    {
        "name": "login-bg.png",
        "prompt": "Dramatic aerial view of the Israeli Judean desert mountains at sunset, golden hour lighting with warm orange and gold colors, ancient fortress ruins on a cliff Masada style, misty valleys below, epic cinematic landscape photography, dark moody atmosphere with golden highlights, professional photography"
    },
    {
        "name": "dashboard-bg.png",
        "prompt": "Orthodox Jewish Haredi soldiers in IDF uniforms praying together at dawn on a hilltop overlooking the Israeli desert, wearing tefillin and tallit, dramatic sunrise with golden rays breaking through clouds, spiritual military moment, warm colors, cinematic photography, epic landscape"
    },
    {
        "name": "main-bg.png",
        "prompt": "Wide panoramic view of Israeli mountain landscape at dusk, layers of mountains fading into the distance, military observation post silhouette, dramatic sky with warm golden and purple tones, cinematic epic photography, dark moody atmosphere"
    }
]

output_dir = r"C:\chashmonai-yomi\public"

for item in prompts:
    print(f"Generating: {item['name']}...")
    try:
        response = client.models.generate_images(
            model="imagen-4.0-generate-001",
            prompt=item["prompt"],
            config=types.GenerateImagesConfig(
                number_of_images=1,
                aspect_ratio="16:9",
                output_mime_type="image/png"
            )
        )

        # Save generated image
        if response.generated_images:
            image_path = os.path.join(output_dir, item["name"])
            with open(image_path, "wb") as f:
                f.write(response.generated_images[0].image.image_bytes)
            print(f"  Saved: {image_path}")
        else:
            print(f"  No image generated for {item['name']}")
    except Exception as e:
        print(f"  Error generating {item['name']}: {e}")

print("\nDone generating images!")
