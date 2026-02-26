
import * as pdfjsLib from 'pdfjs-dist';
import mammoth from 'mammoth';

// Initialize PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://esm.sh/pdfjs-dist@4.10.38/build/pdf.worker.mjs`;

export const fileService = {
  extractText: async (file: File): Promise<string> => {
    const fileType = file.name.split('.').pop()?.toLowerCase();

    if (fileType === 'pdf') {
      return await fileService.extractFromPdf(file);
    } else if (fileType === 'docx' || fileType === 'doc') {
      return await fileService.extractFromDocx(file);
    } else if (fileType === 'txt') {
      return await file.text();
    } else {
      throw new Error('Unsupported file format. Please upload PDF, DOCX, or TXT.');
    }
  },

  extractFromPdf: async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    let fullText = '';

    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str)
        .join(' ');
      fullText += pageText + '\n';
    }

    return fullText.trim();
  },

  extractFromDocx: async (file: File): Promise<string> => {
    const arrayBuffer = await file.arrayBuffer();
    const result = await mammoth.extractRawText({ arrayBuffer });
    return result.value.trim();
  }
};
