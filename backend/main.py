from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from database import engine, Base
import models  # noqa: F401 — must be imported so tables register with Base
from routers import auth_routes, email_routes, training_routes

# Creates tables in MySQL if they don't already exist.
# (For schema CHANGES later, you'd normally use a migration tool
# like Alembic — not needed for a first build.)
Base.metadata.create_all(bind=engine)

app = FastAPI(title="PhishGuard API")

# Allows your React dev server (localhost:5173) to call this API.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_routes.router)
app.include_router(email_routes.router)
app.include_router(training_routes.router)


@app.get("/")
def read_root():
    return {"message": "PhishGuard API is running"}
