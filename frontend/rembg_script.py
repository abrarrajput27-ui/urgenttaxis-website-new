from rembg import remove
from PIL import Image

input_path = "C:/Users/91859/Desktop/urgent-taxis-website/Hero section/Hero.png"
output_path = "public/cta-hero.png"

input_image = Image.open(input_path)
output_image = remove(input_image)
output_image.save(output_path)
print("Done")
