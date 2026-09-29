import os
import glob

def revert_sizing(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    changed_content = content.replace('gap-4 px-4 py-3.5', 'gap-3 px-3 py-2 text-sm')
    changed_content = changed_content.replace('rounded-2xl', 'rounded-lg')
    
    if content != changed_content:
        with open(filepath, 'w') as f:
            f.write(changed_content)
        print(f"Reverted sizing in {filepath}")

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    revert_sizing(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    revert_sizing(filepath)
