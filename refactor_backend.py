import re

with open('backend/main.py', 'r') as f:
    content = f.read()

# 1. Routing refactor
# Change @app.get("/api/...") to @api_router.get("/...")
# Change @app.get("/cases/...") to @api_router.get("/cases/...")
# Add api_router = APIRouter(prefix="/api") at the top

# First, import APIRouter
if "from fastapi import APIRouter" not in content:
    content = content.replace("from fastapi import FastAPI", "from fastapi import FastAPI, APIRouter")

# Then define the router after app = FastAPI(...)
if "api_router = APIRouter(prefix=\"/api\")" not in content:
    content = content.replace(
        "app = FastAPI(title=\"SWARA API - Secure Foundation\")",
        "app = FastAPI(title=\"SWARA API - Secure Foundation\")\napi_router = APIRouter(prefix=\"/api\")"
    )

# Replace all @app.get, @app.post, @app.put, @app.patch, @app.delete with @api_router.* 
# EXCEPT for @app.get("/") and @app.get("/health")
def replace_route(match):
    decorator = match.group(1) # e.g. @app.post
    path = match.group(2) # e.g. "/api/auth/register" or "/cases/"
    rest = match.group(3)
    
    if path in ["/", "/health"]:
        return match.group(0) # don't change
        
    new_decorator = decorator.replace("@app.", "@api_router.")
    new_path = path
    if new_path.startswith("/api/"):
        new_path = new_path[4:] # remove /api, keep the rest e.g. /auth/register
    return f'{new_decorator}("{new_path}"{rest}'

content = re.sub(r'(@app\.(?:get|post|put|patch|delete))\("([^"]+)"(.*)', replace_route, content)

# Finally include the router at the bottom
if "app.include_router(api_router)" not in content:
    content += "\napp.include_router(api_router)\n"

# 2. Check-in background AI analysis refactor
# Replace process_ai_analysis definition
old_process = """def process_ai_analysis(case_id: int, checkin_id: int, checkin_data: dict, baseline_data: dict, recent_checkins: list, priority: str, why: str):
    db = SessionLocal()
    try:"""
new_process = """def process_ai_analysis(case_id: int, checkin_id: int, checkin_data: dict, baseline_data: dict, recent_checkins: list, priority: str, why: str, db: Session):
    try:"""
content = content.replace(old_process, new_process)

# Remove finally block
finally_block = """        db.commit()
    finally:
        db.close()"""
new_finally_block = """        db.commit()
    except Exception as e:
        import logging
        logging.getLogger(__name__).error(f"Failed to save AI analysis: {e}")"""
content = content.replace(finally_block, new_finally_block)

# Update endpoint create_checkin
# From:
# def create_checkin(checkin: schemas.CheckInCreate, background_tasks: BackgroundTasks, token_data: dict = Depends(auth.get_current_user_token), db: Session = Depends(get_db)):
# ...
# background_tasks.add_task(process_ai_analysis, case.id, db_checkin.id, checkin_data, baseline_data, recent_checkins, priority, why)
content = content.replace("def create_checkin(checkin: schemas.CheckInCreate, background_tasks: BackgroundTasks,", "def create_checkin(checkin: schemas.CheckInCreate,")
content = content.replace("background_tasks.add_task(process_ai_analysis, case.id, db_checkin.id, checkin_data, baseline_data, recent_checkins, priority, why)", "process_ai_analysis(case.id, db_checkin.id, checkin_data, baseline_data, recent_checkins, priority, why, db)")

with open('backend/main.py', 'w') as f:
    f.write(content)

print("Backend main.py refactored successfully.")
