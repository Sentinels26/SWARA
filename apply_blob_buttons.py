import os
import re

css_file = "/Users/macbookair/Documents/swara1/frontend/src/index.css"

blob_css = """
/* ==========================================================================
   8. BLOB BUTTON SYSTEM
   ========================================================================== */
.swara-btn-blob {
  position: relative;
  background: transparent;
  color: white;
  border-radius: 9999px;
  padding: 0.75rem 1.5rem;
  font-weight: 600;
  transition: transform var(--transition-fast), color var(--transition-fast), box-shadow var(--transition-fast);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  overflow: hidden;
  z-index: 1;
  border: none;
  box-shadow: var(--swara-shadow-soft);
}

.swara-btn-blob::before {
  content: "";
  position: absolute;
  inset: 0;
  background: var(--swara-teal);
  z-index: -2;
  border-radius: inherit;
  transition: background var(--transition-normal);
}

.swara-btn-blob.blob-blue::before {
  background: var(--swara-blue);
}

.swara-btn-blob::after {
  content: "";
  position: absolute;
  top: -50%; left: -50%;
  width: 200%; height: 200%;
  background: linear-gradient(135deg, var(--swara-aqua), #0d9488);
  z-index: -1;
  border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%;
  animation: blobRotate 4s infinite linear;
  opacity: 0;
  transition: opacity var(--transition-normal);
}

.swara-btn-blob.blob-blue::after {
  background: linear-gradient(135deg, #2563eb, #4f46e5);
}

.swara-btn-blob:hover {
  transform: translateY(-2px);
  box-shadow: var(--swara-shadow-hover);
}

.swara-btn-blob:hover::after {
  opacity: 1;
}

.swara-btn-blob:active {
  transform: translateY(1px) scale(0.98);
}

@keyframes blobRotate {
  0% { transform: rotate(0deg); border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
  33% { border-radius: 60% 40% 40% 60% / 60% 40% 60% 40%; }
  66% { border-radius: 40% 60% 60% 40% / 40% 60% 40% 60%; }
  100% { transform: rotate(360deg); border-radius: 40% 60% 60% 40% / 40% 40% 60% 60%; }
}
"""

with open(css_file, "a") as f:
    f.write(blob_css)

# Update Welcome.tsx
welcome_path = "/Users/macbookair/Documents/swara1/frontend/src/pages/welcome/Welcome.tsx"
with open(welcome_path, "r") as f:
    welcome_content = f.read()

# Replace swara-btn-primary with swara-btn-blob
welcome_content = welcome_content.replace('className="swara-btn-primary w-full text-sm"', 'className="swara-btn-blob w-full text-sm"')
welcome_content = welcome_content.replace('className="swara-btn-primary w-full text-sm bg-gradient-to-r from-blue-500 to-indigo-600 shadow-blue-500/20"', 'className="swara-btn-blob blob-blue w-full text-sm"')

with open(welcome_path, "w") as f:
    f.write(welcome_content)

# Update Survivor Dashboard
dash_path = "/Users/macbookair/Documents/swara1/frontend/src/pages/survivor/Dashboard.tsx"
if os.path.exists(dash_path):
    with open(dash_path, "r") as f:
        dash_content = f.read()
    
    dash_content = re.sub(
        r'className="bg-\[#2c757c\] hover:bg-\[#235e63\] text-white rounded-full px-6 py-2\.5 shadow-md font-medium"',
        r'className="swara-btn-blob px-6 py-2.5"',
        dash_content
    )
    with open(dash_path, "w") as f:
        f.write(dash_content)

print("Blob buttons applied to CSS and Welcome/Dashboard.")
