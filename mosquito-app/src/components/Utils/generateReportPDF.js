// utils/generateReportPDF.js
// Generates a styled PDF for a district outbreak report
// Uses jsPDF + jspdf-autotable (install: npm install jspdf jspdf-autotable)

import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const PRIMARY = [47, 106, 95];    // #2F6A5F
const DARK = [26, 61, 55];     // #1A3D37
const LIGHT_BG = [240, 247, 245];  // #F0F7F5
const WHITE = [255, 255, 255];
const GRAY = [100, 116, 110];
const LIGHT_GRAY = [220, 230, 228];

const RISK_COLORS = {
    HIGH: [239, 68, 68],
    MEDIUM: [249, 115, 22],
    LOW: [47, 106, 95],
};

// Draw a rounded rectangle (jsPDF doesn't have one natively)
function roundedRect(doc, x, y, w, h, r, style = 'F') {
    doc.roundedRect(x, y, w, h, r, r, style);
}

// Draw the header band
function drawHeader(doc, report, pageW) {
    // Green header band
    doc.setFillColor(...PRIMARY);
    doc.rect(0, 0, pageW, 42, 'F');

    // System logo/name (left)
    doc.setTextColor(...WHITE);
    doc.setFontSize(7);
    doc.setFont('helvetica', 'bold');
    doc.text('SMART MOSQUITO CONTROL SYSTEM', 14, 11);
    doc.setFontSize(5.5);
    doc.setFont('helvetica', 'normal');
    doc.text('Sri Lanka Institute of Information Technology', 14, 16);

    // Divider line
    doc.setDrawColor(...LIGHT_BG);
    doc.setLineWidth(0.3);
    doc.line(14, 19, pageW - 14, 19);

    // Report title (large)
    doc.setFontSize(13);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...WHITE);
    const title = report.title.length > 60 ? report.title.substring(0, 57) + '...' : report.title;
    doc.text(title, 14, 30);

    // Category badge (right side of header)
    const catW = doc.getTextWidth(report.category) + 8;
    doc.setFillColor(...LIGHT_BG);
    doc.roundedRect(pageW - 14 - catW, 23, catW, 8, 2, 2, 'F');
    doc.setTextColor(...PRIMARY);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'bold');
    doc.text(report.category.toUpperCase(), pageW - 14 - catW + 4, 28.5);

    // Subtitle row
    doc.setTextColor(200, 230, 220);
    doc.setFontSize(6.5);
    doc.setFont('helvetica', 'normal');
    doc.text(`${report.district || 'All Districts'}  ·  ${report.province || ''}  ·  Generated: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}`, 14, 38);
}

// Draw summary stat boxes
function drawSummaryBoxes(doc, report, rows, y, pageW) {
    const totalCases = rows.reduce((s, r) => s + (r.reportedCases || 0), 0);
    const totalDeaths = rows.reduce((s, r) => s + (r.deaths || 0), 0);
    const highRisk = rows.filter(r => r.severity === 'HIGH').length;
    const medRisk = rows.filter(r => r.severity === 'MEDIUM').length;

    const boxes = [
        { label: 'Total Cases', value: totalCases.toLocaleString(), color: PRIMARY },
        { label: 'Total Deaths', value: totalDeaths.toLocaleString(), color: [239, 68, 68] },
        { label: 'High Risk Periods', value: highRisk, color: [239, 68, 68] },
        { label: 'Medium Risk', value: medRisk, color: [249, 115, 22] },
        { label: 'Outbreak Periods', value: rows.length, color: DARK },
    ];

    const boxW = (pageW - 28 - 8) / boxes.length;
    boxes.forEach((box, i) => {
        const x = 14 + i * (boxW + 2);
        doc.setFillColor(...LIGHT_BG);
        roundedRect(doc, x, y, boxW, 22, 3);

        // Colored top accent
        doc.setFillColor(...box.color);
        roundedRect(doc, x, y, boxW, 4, 2);
        doc.rect(x, y + 2, boxW, 2, 'F'); // square bottom of top accent

        doc.setTextColor(...box.color);
        doc.setFontSize(14);
        doc.setFont('helvetica', 'bold');
        doc.text(String(box.value), x + boxW / 2, y + 14, { align: 'center' });

        doc.setTextColor(...GRAY);
        doc.setFontSize(5.5);
        doc.setFont('helvetica', 'normal');
        doc.text(box.label.toUpperCase(), x + boxW / 2, y + 19.5, { align: 'center' });
    });

    return y + 28;
}

// Section heading
function sectionHead(doc, text, y, pageW) {
    doc.setFillColor(...PRIMARY);
    doc.rect(14, y, 3, 6, 'F');
    doc.setTextColor(...DARK);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(text, 20, y + 4.5);
    doc.setDrawColor(...LIGHT_GRAY);
    doc.setLineWidth(0.2);
    doc.line(20, y + 7, pageW - 14, y + 7);
    return y + 11;
}

// Footer on each page
function drawFooter(doc, pageNum, totalPages, pageW, pageH) {
    doc.setFillColor(...LIGHT_BG);
    doc.rect(0, pageH - 12, pageW, 12, 'F');
    doc.setTextColor(...GRAY);
    doc.setFontSize(6);
    doc.setFont('helvetica', 'normal');
    doc.text('Smart Mosquito Control System — Health Data Integration Platform', 14, pageH - 5);
    doc.text(`Page ${pageNum} of ${totalPages}`, pageW - 14, pageH - 5, { align: 'right' });
    doc.text('CONFIDENTIAL — For Official Use Only', pageW / 2, pageH - 5, { align: 'center' });
}

export const generateReportPDF = async (report, rows) => {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();
    const pageH = doc.internal.pageSize.getHeight();

    // ── Page 1 ──────────────────────────────────────────────────────
    drawHeader(doc, report, pageW);

    let y = 50;

    // Summary boxes
    y = sectionHead(doc, 'OUTBREAK SUMMARY', y, pageW);
    y = drawSummaryBoxes(doc, report, rows, y, pageW);

    // Risk distribution bar
    y = sectionHead(doc, 'RISK DISTRIBUTION', y, pageW);
    const total = rows.length || 1;
    const highPct = rows.filter(r => r.severity === 'HIGH').length / total;
    const medPct = rows.filter(r => r.severity === 'MEDIUM').length / total;
    const lowPct = 1 - highPct - medPct;
    const barW = pageW - 28;

    // Bar background
    doc.setFillColor(...LIGHT_BG);
    roundedRect(doc, 14, y, barW, 8, 3);

    // Colored segments
    let bx = 14;
    if (highPct > 0) { doc.setFillColor(239, 68, 68); roundedRect(doc, bx, y, barW * highPct, 8, 3); bx += barW * highPct; }
    if (medPct > 0) { doc.setFillColor(249, 115, 22); doc.rect(bx, y, barW * medPct, 8, 'F'); bx += barW * medPct; }
    if (lowPct > 0) { doc.setFillColor(...PRIMARY); doc.rect(bx, y, barW * lowPct, 8, 'F'); }

    // Legend
    y += 12;
    const legend = [
        { label: `High (${Math.round(highPct * 100)}%)`, color: [239, 68, 68] },
        { label: `Medium (${Math.round(medPct * 100)}%)`, color: [249, 115, 22] },
        { label: `Low (${Math.round(lowPct * 100)}%)`, color: PRIMARY },
    ];
    legend.forEach((l, i) => {
        const lx = 14 + i * 50;
        doc.setFillColor(...l.color);
        doc.roundedRect(lx, y, 4, 4, 1, 1, 'F');
        doc.setTextColor(...GRAY);
        doc.setFontSize(6.5);
        doc.setFont('helvetica', 'normal');
        doc.text(l.label, lx + 6, y + 3.5);
    });
    y += 10;

    // ── Data table ───────────────────────────────────────────────────
    y = sectionHead(doc, 'OUTBREAK RECORDS', y, pageW);

    const tableRows = rows.slice(0, 100).map(r => [
        r.id || '—',
        r.district || '—',
        (r.diseaseType || '—').charAt(0).toUpperCase() + (r.diseaseType || '').slice(1),
        r.startDate || '—',
        r.endDate || '—',
        r.reportedCases?.toLocaleString() || '0',
        r.deaths || '0',
        r.severity || '—',
    ]);

    autoTable(doc, {
        startY: y,
        head: [['ID', 'District', 'Disease', 'Start', 'End', 'Cases', 'Deaths', 'Severity']],
        body: tableRows,
        theme: 'grid',
        styles: {
            fontSize: 6.5,
            cellPadding: 2.5,
            font: 'helvetica',
            textColor: [60, 80, 75],
        },
        headStyles: {
            fillColor: PRIMARY,
            textColor: WHITE,
            fontStyle: 'bold',
            fontSize: 6.5,
        },
        alternateRowStyles: {
            fillColor: LIGHT_BG,
        },
        columnStyles: {
            0: { cellWidth: 22 },
            1: { cellWidth: 28 },
            2: { cellWidth: 22 },
            3: { cellWidth: 22 },
            4: { cellWidth: 22 },
            5: { cellWidth: 18, halign: 'right' },
            6: { cellWidth: 14, halign: 'right' },
            7: { cellWidth: 22, halign: 'center' },
        },
        didDrawCell: (data) => {
            // Color-code severity cells
            if (data.column.index === 7 && data.section === 'body') {
                const val = data.cell.raw;
                const col = RISK_COLORS[val] || GRAY;
                doc.setTextColor(...col);
                doc.setFontSize(6.5);
                doc.setFont('helvetica', 'bold');
                doc.text(val, data.cell.x + data.cell.width / 2, data.cell.y + data.cell.height / 2 + 1, { align: 'center' });
            }
        },
        margin: { left: 14, right: 14 },
    });

    // ── Footer on every page ─────────────────────────────────────────
    const totalPages = doc.internal.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        drawFooter(doc, i, totalPages, pageW, pageH);
    }

    // Save
    const filename = `${(report.district || 'All').replace(/\s+/g, '_')}_${report.category}_${new Date().toISOString().split('T')[0]}.pdf`;
    doc.save(filename);
};
