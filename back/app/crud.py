from sqlalchemy.orm import Session
from .models import AnalysisResult
from .schemas import AnalysisResultCreate

def create_analysis_result(db: Session, result: AnalysisResultCreate):
    db_result = AnalysisResult(**result.dict())
    db.add(db_result)
    db.commit()
    db.refresh(db_result)
    return db_result

def get_analysis_results(db: Session, skip: int = 0, limit: int = 100):
    return db.query(AnalysisResult).order_by(AnalysisResult.created_at.desc()).offset(skip).limit(limit).all()

def get_analysis_result(db: Session, result_id: int):
    return db.query(AnalysisResult).filter(AnalysisResult.id == result_id).first()