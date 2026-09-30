import os
import re

frontend_dir = "frontend/src"

pattern = re.compile(r"(api\.(?:get|post|put|patch|delete))\(['\"]/(?!api/)([^'\"]+)['\"]")

def replace_in_file(filepath):
    with open(filepath, 'r') as f:
        content = f.read()
    
    new_content = pattern.sub(r"\1('/api/\2'", content)
    
    # Also handle backticks: api.get(`/cases/`) -> api.get(`/api/cases/`)
    pattern_backtick = re.compile(r"(api\.(?:get|post|put|patch|delete))\([`]/(?!api/)([^`]+)[`]\)")
    new_content = pattern_backtick.sub(r"\1(`/api/\2`)", new_content)
    
    if content != new_content:
        with open(filepath, 'w') as f:
            f.write(new_content)
        print(f"Updated {filepath}")

for root, _, files in os.walk(frontend_dir):
    for file in files:
        if file.endswith(('.ts', '.tsx')):
            replace_in_file(os.path.join(root, file))

print("Frontend refactored successfully.")
