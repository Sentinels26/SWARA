# SWARA - Safe to Share Checklist

Before you zip, share, or upload this project repository to GitHub or another person, you must complete this checklist to ensure your privacy and security.

- [ ] **.env files removed** (Ensure no `.env`, `.env.local`, etc. are in the shared folder. Keep `.env.example`).
- [ ] **Real API keys removed** (Verify no Gemini or Google keys are written in your code).
- [ ] **Database credentials removed** (No real PostgreSQL URLs hardcoded).
- [ ] **JWT secrets removed** (Ensure your real production JWT secret isn't saved in a text file here).
- [ ] **Real database excluded** (Ensure `backend/swara.db`, `-shm`, `-wal`, and backups are deleted from the shared copy).
- [ ] **Real user data excluded** (Because the database is excluded, user data is safe).
- [ ] **Real safety data excluded** (Because the database is excluded, safety plans are safe).
- [ ] **Private logs removed** (No `.log` files containing error traces are included).
- [ ] **Cloud Credentials absent** (No AWS, Vercel, or Neon configuration files with hardcoded tokens).
- [ ] **SSH keys absent** (No system keys accidentally copied into the directory).
- [ ] **No dangerous scripts** (Codebase audited; no arbitrary execution found).
- [ ] **No unexpected filesystem access** (Codebase audited; local filesystem is safe).
- [ ] **Dependencies audited** (`npm audit` passed with 0 vulnerabilities).
- [ ] **Git history checked** (No Git repository initialized, meaning no hidden history leaks).
- [ ] **Synthetic demo data only** (The codebase relies on the user to create their own database).
- [ ] **Final secret scan completed** (Automated scan passed).
- [ ] **Localhost still works** (No core functionality was deleted during the audit).
