from flask import Flask, send_file, request

import torch
from torch import autocast
from diffusers import StableDiffusionPipeline
from io import BytesIO
from flask_cors import CORS


app = Flask(__name__)
CORS(app)


model_id = "CompVis/stable-diffusion-v1-4"
device = "cuda"


pipe = StableDiffusionPipeline.from_pretrained(
    model_id,
    torch_dtype=torch.float16,
    revision="fp16",
    use_auth_token=True,
)

pipe = pipe.to(device)


def serve_pil_image(pil_img):
    img_io = BytesIO()
    pil_img.save(img_io, "JPEG", quality=70)
    img_io.seek(0)
    return send_file(img_io, mimetype="image/jpeg")


@app.route("/")
def hello_world():
    return "<p>Hello, World!</p>"


@app.route("/generate-image")
def generate_image():
    prompt = request.args.get(
        "prompt",
        default="a photo of an astronaut riding a horse on mars",
        type=str,
    )
    steps = request.args.get("steps", default=15, type=int)
    seed = request.args.get("seed", default=1024, type=int)

    generator = torch.Generator("cuda").manual_seed(seed)
    with autocast(device):
        image = pipe(
            prompt,
            guidance_scale=7.5,
            num_inference_steps=steps,
            generator=generator,
        ).images[0]

    return serve_pil_image(image)


if __name__ == "__main__":
    app.run(
        host="0.0.0.0",
        port=5000,
        debug=True,
    )
