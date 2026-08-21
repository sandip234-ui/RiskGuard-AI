from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from api.risk import router as risk_router


app = FastAPI(
    title="RiskGuard-AI",
    description="AI-powered fraud risk management system",
    version="1.0.0"
)

# ── CORS ─────────────────────────────────────────────────────
# Allow the Vite dev server (any localhost port) to call the API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://localhost:5174",
        "http://localhost:5175",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
        "http://127.0.0.1:5175",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(risk_router)


@app.get("/")
def root():
    return {
        "project": "RiskGuard-AI",
        "status": "running"
    }


@app.get("/health")
def health():
    """Lightweight health-check endpoint used by the frontend status indicator."""
    return {"status": "ok"}