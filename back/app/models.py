from sqlalchemy import Column, Integer, String, DateTime, Float, Boolean, Text, ForeignKey
from .db import Base
from sqlalchemy.orm import relationship
from datetime import datetime, timezone

class Location(Base):
    __tablename__ = "locations"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    description = Column(Text)
    max_capacity = Column(Integer, nullable=False)
    location_code = Column(String(50), unique=True, index=True)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    sessions = relationship("AnalysisSession", back_populates="location")
    analysis_results = relationship("AnalysisResult", back_populates="location")

class AnalysisSession(Base):
    __tablename__ = "analysis_sessions"
    
    id = Column(Integer, primary_key=True, index=True)
    location_id = Column(Integer, ForeignKey("locations.id", ondelete="CASCADE"), nullable=False)
    session_name = Column(String(150))
    start_time = Column(DateTime, nullable=False)
    end_time = Column(DateTime)
    total_analyses = Column(Integer, default=0)
    avg_people_count = Column(Float)
    peak_people_count = Column(Integer)
    created_at = Column(DateTime, default=lambda: datetime.now(timezone.utc))
    
    location = relationship("Location", back_populates="sessions")
    analysis_results = relationship("AnalysisResult", back_populates="session")

class AnalysisResult(Base):
    __tablename__ = "analysis_results"
    
    id = Column(Integer, primary_key=True, index=True)
    session_id = Column(Integer, ForeignKey("analysis_sessions.id", ondelete="CASCADE"), nullable=False)
    location_id = Column(Integer, ForeignKey("locations.id"), nullable=False)
    filename = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)
    people_count = Column(Integer, nullable=False)
    confidence = Column(Float)
    is_overcrowded = Column(Boolean, default=False)
    timestamp = Column(DateTime, nullable=False, default=lambda: datetime.now(timezone.utc))
    processing_time = Column(Float)
    image_path = Column(String(500))
    
    session = relationship("AnalysisSession", back_populates="analysis_results")
    location = relationship("Location", back_populates="analysis_results")