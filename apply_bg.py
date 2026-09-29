import os
import glob

def process_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # We want to find the <div className="min-h-screen ..."> and add style
    # if it doesn't already have one.
    import re
    # We look for <div className="min-h-screen [^"]*"
    
    def replacer(match):
        full_match = match.group(0)
        # If it already has style, we don't want to mess it up easily, but let's assume it doesn't have style
        if 'style={{' in full_match:
            return full_match # skip
        
        # Add the style attribute
        return full_match + ' style={{ backgroundImage: "url(\'/bgall.png\')", backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}'
    
    # We match <div className="min-h-screen ... ">
    new_content = re.sub(r'<div className="min-h-screen[^>]*"', replacer, content)

    if new_content != content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

# Find all tsx files in pages
for root, dirs, files in os.walk('frontend/src/pages'):
    for file in files:
        if file.endswith('.tsx'):
            process_file(os.path.join(root, file))

