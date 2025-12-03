from pydantic import BaseModel
from datetime import datetime
from typing import Optional

class AnalysisResultBase(BaseModel):
    filename: str
    file_type: str
    people_count: int
    confidence: float

class AnalysisResultCreate(AnalysisResultBase):
    pass

class AnalysisResult(AnalysisResultBase):
    id: int
    created_at: datetime
    processing_time: float
    image_path: Optional[str] = None
    
    class Config:
        from_attributes = True

class AnalysisResponse(BaseModel):
    success: bool
    people_count: int
    processing_time: float
    result_id: int
    image_url: Optional[str] = None