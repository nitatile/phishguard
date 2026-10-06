from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models, schemas, auth

router = APIRouter(prefix="/training", tags=["training"])


@router.get("/scenarios", response_model=List[schemas.ScenarioOut])
def list_scenarios(db: Session = Depends(get_db), _user: models.User = Depends(auth.get_current_user)):
    return db.query(models.TrainingScenario).all()


@router.post("/answer", response_model=schemas.QuizResult)
def submit_answer(
    answer: schemas.QuizAnswer,
    db: Session = Depends(get_db),
    current_user: models.User = Depends(auth.get_current_user),
):
    scenario = db.query(models.TrainingScenario).filter(models.TrainingScenario.id == answer.scenario_id).first()
    if not scenario:
        raise HTTPException(status_code=404, detail="Scenario not found")

    correct_answer = "phishing" if scenario.is_phishing else "safe"
    is_correct = answer.user_answer == correct_answer

    attempt = models.QuizAttempt(
        user_id=current_user.id,
        scenario_id=scenario.id,
        user_answer=answer.user_answer,
        correct=is_correct,
    )
    db.add(attempt)
    db.commit()

    return {"correct": is_correct, "explanation": scenario.explanation_text}
