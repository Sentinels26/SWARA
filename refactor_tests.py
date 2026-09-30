import os
import re

files_to_fix = [
    "backend/test_flow.py",
    "backend/verify_all.py"
]

pattern = re.compile(r"(requests\.(?:get|post|put|patch|delete))\([^\"']+[\"']\{BASE_URL\}/(?!api/)([^\"']+)[\"']")

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = pattern.sub(r"\1(f\"{BASE_URL}/api/\2\"", content)
    
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

print("Tests refactored successfully.")
