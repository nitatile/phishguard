from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List

from database import get_db
import models, schemas, auth
from email_parser import parse_raw_email
from detection import run_detection

router = APIRouter(prefix="/emails", tags=["emails"])


@router.post("/scan", response_model=schemas.ScanResultOut)
def scan_email(
    payload: schemas.EmailScanRequest,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    parsed = parse_raw_email(payload.raw_email)
    result = run_detection(parsed)

    email_record = models.SubmittedEmail(
        submitted_by=current_user.id,
        subject=parsed["subject"],
        sender_email=parsed["from_address"],
        sender_display_name=parsed["from_name"],
        reply_to=parsed["reply_to_address"],
        raw_headers=str(parsed["raw_headers"]),
        body_text=parsed["body"],
        risk_score=result["risk_score"],
        risk_level=result["risk_level"],
    )
    db.add(email_record)
    db.commit()
    db.refresh(email_record)

    for flag in result["flags"]:
        db.add(models.DetectionFlag(email_id=email_record.id, **flag))
    db.commit()
    db.refresh(email_record)

    return email_record


@router.get("/my-submissions", response_model=List[schemas.ScanResultOut])
def my_submissions(
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    return (
        db.query(models.SubmittedEmail)
        .filter(models.SubmittedEmail.submitted_by == current_user.id)
        .order_by(models.SubmittedEmail.created_at.desc())
        .all()
    )


@router.get("/all", response_model=List[schemas.ScanResultOut])
def all_submissions(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.require_admin),
):
    return db.query(models.SubmittedEmail).order_by(models.SubmittedEmail.created_at.desc()).all()


@router.get("/stats")
def dashboard_stats(
    db: Session = Depends(get_db),
    _admin: models.User = Depends(auth.require_admin),
):
    total = db.query(models.SubmittedEmail).count()
    high_risk = db.query(models.SubmittedEmail).filter(models.SubmittedEmail.risk_level == "high").count()
    avg_score = db.query(func.avg(models.SubmittedEmail.risk_score)).scalar() or 0

    return {
        "total_scanned": total,
        "high_risk_count": high_risk,
        "average_score": round(avg_score, 1),
    }
