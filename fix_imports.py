import re

def fix_imports(filepath):
    with open(filepath, 'r') as f:
        content = f.read()

    # ensure LogoutButton is imported
    if 'LogoutButton' not in content[:1000]:
        content = content.replace("import api from '../../api';", "import api from '../../api';\nimport { LogoutButton } from '../../components/LogoutButton';")

    # ensure Activity is in lucide-react imports
    lucide_match = re.search(r"import \{([^}]+)\} from 'lucide-react'", content)
    if lucide_match:
        imports = [i.strip() for i in lucide_match.group(1).split(',')]
        for required in ['Activity', 'ShieldAlert', 'Menu', 'X', 'User']:
            if required not in imports:
                imports.append(required)
        
        new_lucide = f"import {{ {', '.join(imports)} }} from 'lucide-react'"
        content = content[:lucide_match.start()] + new_lucide + content[lucide_match.end():]
        
    with open(filepath, 'w') as f:
        f.write(content)

fix_imports('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Home.tsx')
fix_imports('/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Cases.tsx')
