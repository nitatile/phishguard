from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime


# ---------- Users ----------
class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    department: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class UserOut(BaseModel):
    id: int
    name: str
    email: str
    role: str
    department: Optional[str] = None

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: UserOut


# ---------- Email scanning ----------
class EmailScanRequest(BaseModel):
    raw_email: str


class FlagOut(BaseModel):
    flag_type: str
    detail_text: str
    points_assigned: int

    class Config:
        from_attributes = True


class ScanResultOut(BaseModel):
    id: int
    subject: str
    sender_email: str
    sender_display_name: str
    risk_score: int
    risk_level: str
    flags: List[FlagOut]
    created_at: datetime

    class Config:
        from_attributes = True


# ---------- Training ----------
class ScenarioOut(BaseModel):
    id: int
    title: str
    email_subject: str
    email_body: str
    sender_display: str

    class Config:
        from_attributes = True


class QuizAnswer(BaseModel):
    scenario_id: int
    user_answer: str  # "phishing" or "safe"


class QuizResult(BaseModel):
    correct: bool
    explanation: str
