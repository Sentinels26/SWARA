import os

files_to_fix = [
    "backend/test_flow.py",
    "backend/verify_all.py"
]

for filepath in files_to_fix:
    if not os.path.exists(filepath):
        continue
    with open(filepath, 'r') as f:
        content = f.read()
    
    content = content.replace(f'{{BASE_URL}}/', f'{{BASE_URL}}/api/')
    content = content.replace(f'{{BASE_URL}}/api/api/', f'{{BASE_URL}}/api/')
    
    with open(filepath, 'w') as f:
        f.write(content)
    print(f"Updated {filepath}")

print("Tests refactored successfully.")
