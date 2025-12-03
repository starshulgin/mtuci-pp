import cv2
import numpy as np
from ultralytics import YOLO
import base64
import time
import os
from datetime import datetime

class PeopleCounter:
    def __init__(self):
        self.model = YOLO('yolov8n.pt')
    
    def process_image(self, image_path: str):
        """Обработка изображения и подсчет людей"""
        start_time = time.time()
        
        # Выполняем детекцию
        results = self.model(image_path)
        
        # Фильтруем только людей (class_id = 0)
        people_count = 0
        confidences = []
        
        for result in results:
            boxes = result.boxes
            for box in boxes:
                if int(box.cls) == 0:  # Класс 'person'
                    people_count += 1
                    confidences.append(float(box.conf))
        
        # Рисуем bounding boxes
        annotated_frame = results[0].plot()
        
        # Сохраняем обработанное изображение
        output_dir = "static/results"
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        output_path = f"{output_dir}/result_{timestamp}.jpg"
        cv2.imwrite(output_path, annotated_frame)
        
        processing_time = time.time() - start_time
        avg_confidence = np.mean(confidences) if confidences else 0.0
        
        return {
            "people_count": people_count,
            "confidence": avg_confidence,
            "processing_time": processing_time,
            "image_path": output_path
        }
    
    def process_video_first_frame(self, video_path: str):
        """Обработка первого кадра видео"""
        cap = cv2.VideoCapture(video_path)
        success, frame = cap.read()
        cap.release()
        
        if not success:
            raise ValueError("Не удалось прочитать видео")
        
        # Сохраняем первый кадр как изображение
        temp_image_path = f"temp_frame_{int(time.time())}.jpg"
        cv2.imwrite(temp_image_path, frame)
        
        # Обрабатываем как изображение
        result = self.process_image(temp_image_path)
        
        # Удаляем временный файл
        os.remove(temp_image_path)
        
        return result