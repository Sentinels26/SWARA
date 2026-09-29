import os
import glob
import re
import uuid

def fix_inputs(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # Find <input ...> and add id/name if missing
    def replace_input(match):
        full_match = match.group(0)
        if ' id=' not in full_match and ' name=' not in full_match:
            uid = "input_" + str(uuid.uuid4())[:8]
            return full_match.replace('<input ', f'<input id="{uid}" name="{uid}" ')
        return full_match
    
    # Find <select ...> and add id/name if missing
    def replace_select(match):
        full_match = match.group(0)
        if ' id=' not in full_match and ' name=' not in full_match:
            uid = "select_" + str(uuid.uuid4())[:8]
            return full_match.replace('<select ', f'<select id="{uid}" name="{uid}" ')
        return full_match

    content = re.sub(r'<input\s+[^>]*>', replace_input, content)
    content = re.sub(r'<select\s+[^>]*>', replace_select, content)
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Fixed inputs in {filepath}")

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages'
for filepath in glob.glob(os.path.join(pages_dir, '**', '*.tsx'), recursive=True):
    fix_inputs(filepath)
