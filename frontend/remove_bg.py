import sys
try:
    from PIL import Image, ImageDraw
except ImportError:
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "Pillow"])
    from PIL import Image, ImageDraw

def remove_white_bg(input_path, output_path):
    img = Image.open(input_path).convert("RGBA")
    
    # Do a flood fill from the 4 corners to find background pixels
    # We will create a mask of the background.
    
    # Add a 1px white border around the image to make sure all background regions touch each other
    w, h = img.size
    bordered = Image.new("RGBA", (w+2, h+2), (255, 255, 255, 255))
    bordered.paste(img, (1, 1))
    
    ImageDraw.floodfill(bordered, (0, 0), (255, 255, 255, 0), thresh=20)
    
    # Crop it back
    result = bordered.crop((1, 1, w+1, h+1))
    
    result.save(output_path, "PNG")

remove_white_bg("public/cta-hero.png", "public/cta-hero.png")
print("Done")
