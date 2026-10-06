from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    email = Column(String(150), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    role = Column(String(20), default="employee")  # "employee" or "admin"
    department = Column(String(50), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submitted_emails = relationship("SubmittedEmail", back_populates="submitter")
    quiz_attempts = relationship("QuizAttempt", back_populates="user")


class SubmittedEmail(Base):
    __tablename__ = "submitted_emails"

    id = Column(Integer, primary_key=True, index=True)
    submitted_by = Column(Integer, ForeignKey("users.id"))
    subject = Column(String(255))
    sender_email = Column(String(255))
    sender_display_name = Column(String(255))
    reply_to = Column(String(255), nullable=True)
    raw_headers = Column(Text)
    body_text = Column(Text)
    risk_score = Column(Integer, default=0)
    risk_level = Column(String(20))  # low / medium / high
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    submitter = relationship("User", back_populates="submitted_emails")
    flags = relationship("DetectionFlag", back_populates="email", cascade="all, delete-orphan")


class DetectionFlag(Base):
    __tablename__ = "detection_flags"

    id = Column(Integer, primary_key=True, index=True)
    email_id = Column(Integer, ForeignKey("submitted_emails.id"))
    flag_type = Column(String(50))
    detail_text = Column(Text)
    points_assigned = Column(Integer)

    email = relationship("SubmittedEmail", back_populates="flags")


class TrainingScenario(Base):
    __tablename__ = "training_scenarios"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255))
    email_subject = Column(String(255))
    email_body = Column(Text)
    sender_display = Column(String(255))
    is_phishing = Column(Boolean, default=True)
    explanation_text = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())


class QuizAttempt(Base):
    __tablename__ = "quiz_attempts"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    scenario_id = Column(Integer, ForeignKey("training_scenarios.id"))
    user_answer = Column(String(20))  # "phishing" or "safe"
    correct = Column(Boolean)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quiz_attempts")
