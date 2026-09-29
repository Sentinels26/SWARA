from PIL import Image, ImageChops

def crop_to_content(image_path, output_path):
    img = Image.open(image_path).convert("RGBA")
    
    # Get bounding box of non-transparent/non-white pixels
    # Since it's a logo with some transparency, we'll try to find the actual content.
    bg = Image.new(img.mode, img.size, (255, 255, 255, 0)) # assuming transparent bg
    diff = ImageChops.difference(img, bg)
    diff = ImageChops.add(diff, diff, 2.0, -100)
    bbox = diff.getbbox()
    
    if bbox:
        # Crop to the content
        img = img.crop(bbox)
        
        # Make it square
        width, height = img.size
        max_dim = max(width, height)
        
        # Create a new transparent square image
        new_img = Image.new("RGBA", (max_dim, max_dim), (255, 255, 255, 0))
        
        # Paste the cropped image in the center
        new_img.paste(img, ((max_dim - width) // 2, (max_dim - height) // 2))
        
        new_img.save(output_path)
        print("Cropped successfully to", output_path)
    else:
        print("Could not determine bounding box.")

crop_to_content("/Users/macbookair/Documents/swara1/frontend/public/favicon.png", "/Users/macbookair/Documents/swara1/frontend/public/favicon.png")
