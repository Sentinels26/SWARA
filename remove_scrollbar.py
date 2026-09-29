import os
import glob
import re

def remove_scrollbar(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Remove overflow-y-auto from aside className
    changed_content = content.replace("h-screen overflow-y-auto hidden", "h-screen hidden")
    
    # Also if nav has overflow-x-hidden, wait, in Survivor it was overflow-y-auto.
    # The user specifically said "replicate the ui only make the sizing as previous one"
    # Survivor menu nav: <nav className="flex-1 py-4 px-6 flex flex-col gap-1 overflow-y-auto relative z-10">
    # Let's change the nav overflow as well just to be safe, but removing it from aside is the main thing.
    
    # Hide the scrollbar globally or just on the nav.
    # Let's just remove the overflow-y-auto from aside.
    
    if content != changed_content:
        with open(filepath, 'w') as f:
            f.write(changed_content)
        print(f"Removed aside scrollbar in {filepath}")

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    remove_scrollbar(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    remove_scrollbar(filepath)
