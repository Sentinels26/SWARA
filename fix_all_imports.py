import os
import glob
import re

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    changed = False
    
    # 1. Ensure Link and useNavigate are imported from react-router-dom
    if 'react-router-dom' in content:
        rr_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'react-router-dom'", content)
        if rr_match:
            imports = [i.strip() for i in rr_match.group(1).split(',')]
            needed = []
            if 'Link' not in imports: needed.append('Link')
            if 'useNavigate' not in imports: needed.append('useNavigate')
            if needed:
                imports.extend(needed)
                new_rr = f"import {{ {', '.join(imports)} }} from 'react-router-dom'"
                content = content[:rr_match.start()] + new_rr + content[rr_match.end():]
                changed = True
    else:
        content = "import { Link, useNavigate } from 'react-router-dom';\n" + content
        changed = True

    # 2. Ensure LogoutButton is imported
    if 'LogoutButton' not in content and '../../components/LogoutButton' not in content:
        content = "import { LogoutButton } from '../../components/LogoutButton';\n" + content
        changed = True

    # 3. Ensure useState is imported
    if 'useState' not in content:
        react_match = re.search(r"import\s+\{([^}]+)\}\s+from\s+'react'", content)
        if react_match:
            if 'useState' not in react_match.group(1):
                content = content.replace(react_match.group(0), f"import {{ {react_match.group(1)}, useState }} from 'react'")
                changed = True
        else:
            content = "import { useState } from 'react';\n" + content
            changed = True

    if changed:
        with open(filepath, 'w') as f:
            f.write(content)

pages_dir = '/Users/macbookair/Documents/swara1/frontend/src/pages/professional'
for filepath in glob.glob(os.path.join(pages_dir, '*.tsx')):
    fix_imports(filepath)
    
for filepath in glob.glob(os.path.join(pages_dir, 'case', '*.tsx')):
    fix_imports(filepath)
