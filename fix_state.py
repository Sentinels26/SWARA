import os
import glob
import re

def fix_state(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    changed = False

    # Check if isSidebarCollapsed is missing
    if 'isSidebarCollapsed' in content and 'setIsSidebarCollapsed' not in content:
        # We have the variable but not the state hook!
        # Let's find a good place to inject it. Usually right after `export default function ... {`
        func_match = re.search(r'export default function \w+\([^)]*\)\s*\{', content)
        if func_match:
            insert_pos = func_match.end()
            content = content[:insert_pos] + "\n  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);" + content[insert_pos:]
            changed = True
            print(f"Fixed state in {filepath}")

    if changed:
        with open(filepath, 'w') as f:
            f.write(content)

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    fix_state(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    fix_state(filepath)
