import html2canvas from "html2canvas";
import jsPDF from "jspdf";

/**
 * Exports a DOM element to A4 PDF.
 * element: DOM node
 * filename: string
 */
export async function exportToPdf(element, filename = "certificate.pdf") {
  if (!element) return;
  // scale 2 for better quality
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");

  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

  pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
  pdf.save(filename);
}

/** Optional: export to PNG */
export async function exportToImage(element, filename = "certificate.png") {
  if (!element) return;
  const canvas = await html2canvas(element, { scale: 2, useCORS: true });
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
}
