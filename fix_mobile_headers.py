import os
import re

pages_dir = "/Users/macbookair/Documents/swara1/frontend/src/pages/survivor"
pages = ["Dashboard.tsx", "CheckIn.tsx", "Chat.tsx", "Journey.tsx", "Support.tsx", "Profile.tsx"]

for page in pages:
    page_path = os.path.join(pages_dir, page)
    if not os.path.exists(page_path): continue
    
    with open(page_path, "r") as f:
        content = f.read()

    # Make sure all headers are fixed, not absolute or sticky
    content = re.sub(
        r'<header className="md:hidden (?:absolute|sticky|flex|fixed)[^"]*?"',
        lambda m: m.group(0).replace("absolute", "fixed").replace("sticky", "fixed"),
        content
    )

    # If it lacks fixed, add it (e.g. Chat.tsx was just flex)
    if '<header className="md:hidden flex' in content:
        content = content.replace(
            '<header className="md:hidden flex',
            '<header className="md:hidden fixed top-0 left-0 w-full flex'
        )

    # Replace padding p-4 with safe area padding
    # First, let's normalize by replacing any existing safe area padding just in case
    content = content.replace("px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]", "p-4")
    
    # Now replace p-4 with the correct safe area padding
    content = content.replace(
        '<header className="md:hidden fixed top-0 left-0 w-full flex items-center justify-between p-4',
        '<header className="md:hidden fixed top-0 left-0 w-full flex items-center justify-between px-4 pb-4 pt-[max(1rem,env(safe-area-inset-top))]'
    )

    # Fix main content padding to account for the taller header
    # Find <main className="... pt-[XXpx] md:pt-10 ..." and replace it.
    # In Dashboard: pt-[84px] md:pt-10
    content = re.sub(r'pt-\[\d+px\] md:pt-\d+', 'pt-[calc(76px+env(safe-area-inset-top))] md:pt-10', content)
    
    # If a page (like Chat) doesn't have pt-[XXpx], we need to check if it's p-0 md:p-6.
    # For Chat.tsx, it's 100dvh, so the header being fixed on top of it means main needs padding top.
    if page == "Chat.tsx":
        content = content.replace('p-0 md:p-6 lg:p-8', 'pt-[calc(76px+env(safe-area-inset-top))] p-0 md:p-6 lg:p-8')
    elif "pt-[calc" not in content and "p-5 md:p-10" in content:
        # Journey, Support, etc might have p-5 md:p-10 but not pt-[]
        content = content.replace('p-5 md:p-10', 'p-5 pt-[calc(76px+env(safe-area-inset-top))] md:p-10')

    with open(page_path, "w") as f:
        f.write(content)

print("Fixed mobile headers safe area and scroll behavior.")
