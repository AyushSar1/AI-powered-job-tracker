import pdfplumber
import re

def extract_text_from_pdf(pdf_path):
    text = ""
    
    with pdfplumber.open(pdf_path) as pdf:
        for page in pdf.pages:
            
            page_text = page.extract_text()
            
            if page_text:
                text += page_text + "\n"
                
    text = re.sub(r"\s+", " ", text)            
    return text.strip()