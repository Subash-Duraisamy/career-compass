import PDFParser from "pdf2json";

export const extractText = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No file uploaded" });
    }

    const pdfParser = new PDFParser();

    pdfParser.on("pdfParser_dataError", (errData) => {
      console.error(errData.parserError);
      return res.status(500).json({ error: "PDF parsing failed" });
    });

    pdfParser.on("pdfParser_dataReady", (pdfData) => {
      // Extract text from all pages
      let finalText = "";
      pdfData.Pages.forEach((page) => {
        page.Texts.forEach((textObj) => {
          textObj.R.forEach((r) => {
            // finalText += decodeURIComponent(r.T) + " ";
            let text = r.T;

// FIX malformed UTF strings
try {
  text = decodeURIComponent(escape(text));
} catch (e) {
  // fallback: remove invalid characters
  text = text.replace(/[^\x00-\x7F]/g, "");
}

finalText += text + " ";

          });
        });
        finalText += "\n";
      });

      res.json({ text: finalText });
    });

    // Load PDF from buffer
    pdfParser.parseBuffer(req.file.buffer);
  } catch (err) {
    console.error("PDF Error:", err);
    res.status(500).json({ error: "Failed to extract PDF text" });
  }
};
