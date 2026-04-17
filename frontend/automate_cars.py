import os
import torch
from diffusers import StableDiffusionPipeline
from PIL import Image

# 1. AI Model Load karein (RTX 3060 ka use karke)
model_id = "runwayml/stable-diffusion-v1-5"
pipe = StableDiffusionPipeline.from_pretrained(model_id, torch_dtype=torch.float16)
pipe = pipe.to("cuda") # RTX 3060 active!

# 2. Folder Paths (Adjusted to run from inside the frontend folder)
input_dir = "public/assets/models/"
output_dir = "public/assets/ai_generated_images/"

if not os.path.exists(output_dir):
    os.makedirs(output_dir)

# 3. Automation Loop
for filename in os.listdir(input_dir):
    if filename.endswith(".jpg") or filename.endswith(".png"):
        car_name = filename.split('.')[0].replace('_', ' ')
        output_path = os.path.join(output_dir, f"3d_{filename}")

        if os.path.exists(output_path):
            continue # Pehle se bani image skip karein

        print(f"Generating 3D model for: {car_name}")
        
        # Upgraded prompt for Black Background & Grounding
        prompt = f"A highly realistic, centered, premium 3D studio render of a {car_name} car. Resting firmly on a dark studio floor. Solid pitch black background, soft dramatic studio lighting. 8k, photorealistic, pristine automotive photography."
        negative_prompt = "outdoor, road, street, buildings, landscape, nature, window, background elements, hovering, floating, messy, deformed wheels, distorted, garbled text, bad anatomy, ugly, multiple cars"
        
        # Generator settings for higher quality
        image = pipe(
            prompt=prompt,
            negative_prompt=negative_prompt,
            num_inference_steps=35,
            guidance_scale=8.0
        ).images[0]
        image.save(output_path)

print("Done! Saari 300 gadiyan generate ho gayi hain.")
