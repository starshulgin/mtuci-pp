from fastapi import FastAPI, File, UploadFile, HTTPException, Depends
from fastapi.staticfiles import StaticFiles
from fastapi.responses import HTMLResponse
from sqlalchemy.orm import Session
import os
import shutil
from typing import List

from .db import SessionLocal, engine
from . import models
from . import schemas
from . import crud
from .ml_model import PeopleCounter

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="People Counter API", version="1.0.0")

app.mount("/static", StaticFiles(directory="static"), name="static")

people_counter = PeopleCounter()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/", response_class=HTMLResponse)
async def read_root():
    with open("static/index.html", "r") as f:
        return HTMLResponse(content=f.read())

@app.post("/analyze/", response_model=schemas.AnalysisResponse)
async def analyze_file(
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    try:
        # Сохраняем загруженный файл
        file_path = f"uploads/{file.filename}"
        os.makedirs("uploads", exist_ok=True)
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        
        # Определяем тип файла и обрабатываем
        is_video = file.filename.lower().endswith(('.mp4', '.avi', '.mov', '.mkv'))
        
        if is_video:
            result_data = people_counter.process_video_first_frame(file_path)
            file_type = "video"
        else:
            result_data = people_counter.process_image(file_path)
            file_type = "image"
        
        # Сохраняем в БД
        db_result = schemas.AnalysisResultCreate(
            filename=file.filename,
            file_type=file_type,
            people_count=result_data["people_count"],
            confidence=result_data["confidence"]
        )
        
        created_result = crud.create_analysis_result(db, db_result)
        
        # Формируем URL для обработанного изображения
        image_url = f"/static/results/{os.path.basename(result_data['image_path'])}"
        
        return schemas.AnalysisResponse(
            success=True,
            people_count=result_data["people_count"],
            processing_time=result_data["processing_time"],
            result_id=created_result.id,
            image_url=image_url
        )
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Ошибка обработки: {str(e)}")
    finally:
        # Удаляем временный файл
        if os.path.exists(file_path):
            os.remove(file_path)

@app.get("/results/", response_model=List[schemas.AnalysisResult])
async def get_results(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud.get_analysis_results(db, skip=skip, limit=limit)

@app.get("/results/{result_id}", response_model=schemas.AnalysisResult)
async def get_result(result_id: int, db: Session = Depends(get_db)):
    result = crud.get_analysis_result(db, result_id)
    if result is None:
        raise HTTPException(status_code=404, detail="Результат не найден")
    return result

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)