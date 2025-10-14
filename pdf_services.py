"""
PDF Processing Microservices for SlideRx
Run these alongside N8N to handle PDF operations
"""

from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List, Dict
import PyPDF2
import io
from reportlab.lib.pagesizes import letter, landscape
from reportlab.pdfgen import canvas
from reportlab.lib.units import inch
import json

app = FastAPI(title="SlideRx PDF Services")

# ============================================
# PDF EXTRACTION SERVICE
# ============================================

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    """
    Extract text from PDF file
    Returns: JSON with text content and metadata
    """
    try:
        contents = await file.read()
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(contents))
        
        slides = []
        for page_num, page in enumerate(pdf_reader.pages, 1):
            text = page.extract_text()
            slides.append({
                "number": page_num,
                "text": text.strip()
            })
        
        return {
            "success": True,
            "pageCount": len(pdf_reader.pages),
            "slides": slides,
            "fullText": "\n\n".join([s["text"] for s in slides])
        }
    
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"PDF extraction failed: {str(e)}")


# ============================================
# PDF GENERATION SERVICE
# ============================================

class Slide(BaseModel):
    title: str
    visual: str
    sentence: str

class SlideRequest(BaseModel):
    slide1: Slide
    slide2: Slide
    slide3: Slide
    projectId: str

@app.post("/generate-pdf")
async def generate_pdf(request: SlideRequest):
    """
    Generate 3-slide PDF from structured data
    Returns: PDF file
    """
    try:
        # Create PDF in memory
        buffer = io.BytesIO()
        c = canvas.Canvas(buffer, pagesize=landscape(letter))
        width, height = landscape(letter)
        
        slides_data = [request.slide1, request.slide2, request.slide3]
        
        for slide_num, slide in enumerate(slides_data, 1):
            if slide_num > 1:
                c.showPage()  # New page for slides 2 and 3
            
            # Title
            c.setFont("Helvetica-Bold", 28)
            c.drawString(50, height - 80, slide.title)
            
            # Visual description label
            c.setFont("Helvetica", 12)
            c.setFillColorRGB(0.4, 0.4, 0.4)
            c.drawString(50, height - 180, "VISUAL:")
            
            # Visual description box
            c.setStrokeColorRGB(0.8, 0.8, 0.8)
            c.rect(50, height - 400, width - 100, 200, stroke=1, fill=0)
            
            # Visual description text (wrapped)
            c.setFillColorRGB(0, 0, 0)
            c.setFont("Helvetica", 14)
            text_object = c.beginText(70, height - 220)
            text_object.setTextOrigin(70, height - 220)
            
            # Simple text wrapping
            visual_lines = []
            words = slide.visual.split()
            current_line = []
            for word in words:
                current_line.append(word)
                if len(" ".join(current_line)) > 80:
                    visual_lines.append(" ".join(current_line[:-1]))
                    current_line = [word]
            if current_line:
                visual_lines.append(" ".join(current_line))
            
            for line in visual_lines[:8]:  # Max 8 lines
                text_object.textLine(line)
            
            c.drawText(text_object)
            
            # Main sentence (centered)
            c.setFont("Helvetica-Bold", 20)
            c.setFillColorRGB(0.15, 0.39, 0.92)  # Blue color (#2563EB)
            
            # Center the text
            sentence_width = c.stringWidth(slide.sentence, "Helvetica-Bold", 20)
            x_centered = (width - sentence_width) / 2
            c.drawString(x_centered, height - 450, slide.sentence)
            
            # Slide number
            c.setFont("Helvetica", 10)
            c.setFillColorRGB(0.6, 0.6, 0.6)
            c.drawRightString(width - 50, 50, f"Slide {slide_num} of 3")
        
        # Save PDF
        c.save()
        buffer.seek(0)
        
        # Return as streaming response
        return StreamingResponse(
            buffer,
            media_type="application/pdf",
            headers={
                "Content-Disposition": f'attachment; filename="SlideRx_{request.projectId}_Condensed.pdf"'
            }
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"PDF generation failed: {str(e)}")


# ============================================
# HEALTH CHECK
# ============================================

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "SlideRx PDF Services",
        "endpoints": {
            "extract": "/extract-text",
            "generate": "/generate-pdf"
        }
    }


# ============================================
# RUN INSTRUCTIONS
# ============================================

"""
Installation:
pip install fastapi uvicorn PyPDF2 reportlab python-multipart

Run:
uvicorn pdf_services:app --host 0.0.0.0 --port 8000 --reload

Test Extract:
curl -X POST "http://localhost:8000/extract-text" \
  -H "accept: application/json" \
  -H "Content-Type: multipart/form-data" \
  -F "file=@test.pdf"

Test Generate:
curl -X POST "http://localhost:8000/generate-pdf" \
  -H "Content-Type: application/json" \
  -d '{
    "projectId": "test-123",
    "slide1": {
      "title": "THE PROBLEM",
      "visual": "Bar chart showing cost increase",
      "sentence": "We are losing money fast."
    },
    "slide2": {
      "title": "THE SOLUTION",
      "visual": "Workflow diagram before and after",
      "sentence": "Automation saves us time."
    },
    "slide3": {
      "title": "THE ASK",
      "visual": "ROI timeline chart",
      "sentence": "We need two million dollars."
    }
  }' --output test-output.pdf
"""
