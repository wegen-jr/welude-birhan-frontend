import { useRef, useState } from "react";
import PropTypes from "prop-types";
import { QRCodeSVG } from "qrcode.react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { Download, Printer, Loader2, Sparkles } from "lucide-react";
import defaultLogo from "../../assets/logo.png";

/**
 * Modern, breathable, and flexible Student ID Card component.
 * Adheres strictly to the Zero Mock Data policy by mapping directly to live API student data.
 */
export default function StudentIDCard({
  student,
  logoSrc = defaultLogo,
  showActions = true,
  className = "",
}) {
  const cardRef = useRef(null);
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState("");

  const studentName = student?.fullname || student?.name || "";
  const studentId = student?.studentId || student?.id || "";
  const gradeLevel = student?.gradeLevel || "";
  const section = student?.section || "";

  // Download PDF using html2canvas and jsPDF
  const handleDownloadPdf = async () => {
    if (!cardRef.current) return;

    try {
      setIsExporting(true);
      setExportError("");

      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3, // High DPI for crisp vector-like text & QR
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      // Standard portrait ID card dimensions (85mm width, proportional height)
      const pdfWidth = 85;
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      const safeId = String(studentId || "Student").replace(/[^a-z0-9_-]/gi, "_");
      pdf.save(`StudentID_${safeId}.pdf`);
    } catch (err) {
      console.error("Failed to export Student ID Card PDF:", err);
      setExportError("Failed to generate PDF. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  // Direct print handler
  const handlePrint = async () => {
    if (!cardRef.current) return;

    try {
      setIsExporting(true);
      setExportError("");

      const element = cardRef.current;
      const canvas = await html2canvas(element, {
        scale: 3,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
      });

      const imgData = canvas.toDataURL("image/png");

      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        throw new Error("Popup blocked. Please allow popups to print the ID card.");
      }

      printWindow.document.write(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>Student ID - ${studentName || studentId}</title>
            <style>
              @page {
                size: 85mm 135mm;
                margin: 0;
              }
              body {
                margin: 0;
                padding: 0;
                display: flex;
                align-items: center;
                justify-content: center;
                min-height: 100vh;
                background-color: #ffffff;
              }
              img {
                max-width: 85mm;
                height: auto;
                display: block;
              }
              @media print {
                body {
                  min-height: auto;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" onload="window.focus(); window.print(); window.close();" />
          </body>
        </html>
      `);
      printWindow.document.close();
    } catch (err) {
      console.error("Print card error:", err);
      setExportError(err.message || "Failed to print ID card.");
    } finally {
      setIsExporting(false);
    }
  };

  // If no student data is provided, render an empty state rather than mock data
  if (!student) {
    return (
      <div className="w-[22rem] min-h-[34rem] bg-white rounded-xl shadow-xl flex flex-col items-center justify-center p-8 text-center border border-slate-100">
        <Sparkles className="w-10 h-10 text-amber-500/40 mb-3" />
        <h3 className="text-base font-bold text-slate-800">No Student Selected</h3>
        <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
          Select an enrolled student to generate and preview their official ID card.
        </p>
      </div>
    );
  }

  return (
    <div className={`flex flex-col items-center gap-4 ${className}`}>
      {/* 1. Card Container (Standard ID Ratio, Flexible & Breathable) */}
      <div
        ref={cardRef}
        id={`student-id-card-${studentId || "preview"}`}
        className="w-[22rem] min-h-[34rem] bg-white rounded-xl shadow-xl flex flex-col justify-between overflow-hidden relative select-none"
      >
        {/* Top/Internal Content Wrapper with generous whitespace (p-8) */}
        <div className="flex flex-col justify-between flex-1 p-8">
          {/* 2. Header (Official Logo & Branding) */}
          <div className="flex flex-col items-center">
            {/* Official Logo */}
            <img
              src={logoSrc || "/assets/logo.png"}
              alt="ወሉደ ብርሃን ሰንበት ት/ቤት"
              crossOrigin="anonymous"
              className="h-24 object-contain mx-auto transition-transform"
            />

            {/* Amharic School Name in Royal Blue */}
            <h1 className="text-[#1A66CE] text-lg sm:text-xl font-bold text-center tracking-wide mt-4 font-serif">
              ወሉደ ብርሃን ሰንበት ትምህርት ቤት
            </h1>

            {/* Subtle, thin golden divider line */}
            <div className="border-t border-yellow-400 w-1/2 mx-auto mt-2" />
          </div>

          {/* 3. QR Code Section (Floating centrally with gentle padding and soft drop shadow) */}
          <div className="flex items-center justify-center my-4">
            <div className="p-3 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center">
              <QRCodeSVG
                value={studentId || "N/A"}
                size={140}
                level="H"
                includeMargin={false}
                bgColor="#ffffff"
                fgColor="#081226"
              />
            </div>
          </div>

          {/* 4. Student Information (Clean Typography, strictly bound to API) */}
          <div className="flex flex-col items-center text-center gap-2">
            {/* Full Name */}
            <h2 className="text-gray-800 text-xl font-bold tracking-tight line-clamp-2">
              {studentName || "Unnamed Student"}
            </h2>

            {/* Student ID Badge in soft blue pill */}
            <div className="inline-flex items-center justify-center bg-blue-50 text-[#1A66CE] px-3 py-1 rounded-full text-xs font-semibold tracking-wider font-mono">
              {studentId || "ID PENDING"}
            </div>

            {/* Class Details: Grade and Section in muted gray */}
            <div className="text-gray-500 text-sm font-medium">
              <span>{gradeLevel ? `Grade: ${gradeLevel}` : "Grade: -"}</span>
              <span className="mx-1.5">•</span>
              <span>{section ? `Section: ${section}` : "Section: -"}</span>
            </div>
          </div>
        </div>

        {/* 5. Footer Anchor (Edge-to-edge royal blue and gold accent blocks) */}
        <div className="w-full flex h-2 shrink-0">
          <div className="flex-1 bg-[#1A66CE]" />
          <div className="w-16 bg-yellow-400" />
        </div>
      </div>

      {/* 6. Export Capability (Download PDF & Print Buttons) */}
      {showActions && (
        <div className="w-[22rem] flex flex-col gap-2">
          {exportError && (
            <p className="text-xs text-rose-500 text-center font-medium">
              {exportError}
            </p>
          )}

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#1A66CE] hover:bg-[#1553a6] text-white font-semibold text-xs tracking-wide transition-all shadow-md shadow-blue-500/20 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isExporting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              <span>{isExporting ? "Exporting..." : "Download PDF"}</span>
            </button>

            <button
              type="button"
              onClick={handlePrint}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs tracking-wide transition-all border border-slate-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Card</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

StudentIDCard.propTypes = {
  student: PropTypes.shape({
    fullname: PropTypes.string,
    name: PropTypes.string,
    studentId: PropTypes.string,
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    gradeLevel: PropTypes.string,
    section: PropTypes.string,
  }),
  logoSrc: PropTypes.string,
  showActions: PropTypes.bool,
  className: PropTypes.string,
};
