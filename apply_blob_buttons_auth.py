import os
import re

auth_files = [
    "/Users/macbookair/Documents/swara1/frontend/src/pages/auth/SurvivorAuth.tsx",
    "/Users/macbookair/Documents/swara1/frontend/src/pages/auth/ProfessionalAuth.tsx"
]

for auth_file in auth_files:
    if os.path.exists(auth_file):
        with open(auth_file, "r") as f:
            content = f.read()
        
        # Replace normal buttons with blob buttons
        if "ProfessionalAuth.tsx" in auth_file:
            content = re.sub(
                r'className="w-full bg-[#3b82f6] hover:bg-blue-600[^"]*"',
                r'className="w-full swara-btn-blob blob-blue"',
                content
            )
        else:
            content = re.sub(
                r'className="w-full bg-[#2c757c] hover:bg-[#235e63][^"]*"',
                r'className="w-full swara-btn-blob"',
                content
            )
            
        with open(auth_file, "w") as f:
            f.write(content)

prof_home = "/Users/macbookair/Documents/swara1/frontend/src/pages/professional/Home.tsx"
if os.path.exists(prof_home):
    with open(prof_home, "r") as f:
        content = f.read()
    
    content = re.sub(
        r'className="w-full bg-[#3b82f6] hover:bg-blue-600[^"]*"',
        r'className="w-full swara-btn-blob blob-blue"',
        content
    )
    # Also update any Link buttons
    content = re.sub(
        r'className="w-full flex items-center justify-center gap-2 bg-[#f0fdf4] hover:bg-green-100 text-green-700 font-semibold py-3 px-4 rounded-xl transition-colors"',
        r'className="w-full flex items-center justify-center gap-2 swara-btn-blob py-3 px-4"',
        content
    )

    with open(prof_home, "w") as f:
        f.write(content)

print("Auth and prof screens updated.")
