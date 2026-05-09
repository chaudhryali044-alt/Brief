import { FullBriefResult } from "./types";

/** Generate and download a PDF of a brief. Client-only (uses jsPDF). */
export async function generatePdf(brief: FullBriefResult): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });

  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 20;
  const contentW = pageW - margin * 2;
  let y = margin;

  const gold = [233, 193, 118] as [number, number, number];
  const darkBg = [18, 20, 20] as [number, number, number];
  const lightText = [226, 226, 226] as [number, number, number];
  const mutedText = [71, 70, 70] as [number, number, number];

  // Background
  doc.setFillColor(...darkBg);
  doc.rect(0, 0, pageW, pageH, "F");

  function addPage() {
    doc.addPage();
    doc.setFillColor(...darkBg);
    doc.rect(0, 0, pageW, pageH, "F");
    y = margin;
    addFooter();
  }

  function checkY(needed: number) {
    if (y + needed > pageH - 20) addPage();
  }

  function addFooter() {
    const currentPage = (doc.internal as unknown as { getCurrentPageInfo: () => { pageNumber: number } }).getCurrentPageInfo().pageNumber;
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.text(
      `Brief Intelligence — getbrief.io — Sources cited throughout — Page ${currentPage}`,
      pageW / 2,
      pageH - 8,
      { align: "center" }
    );
  }

  function sectionHeader(label: string) {
    checkY(14);
    doc.setDrawColor(...gold);
    doc.setLineWidth(0.5);
    doc.line(margin, y, pageW - margin, y);
    y += 4;
    doc.setFontSize(9);
    doc.setTextColor(...gold);
    doc.setFont("helvetica", "bold");
    doc.text(label.toUpperCase(), margin, y);
    y += 6;
    doc.setFont("helvetica", "normal");
  }

  function bodyText(text: string, size = 10) {
    doc.setFontSize(size);
    doc.setTextColor(...lightText);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentW);
    checkY(lines.length * (size * 0.4));
    doc.text(lines, margin, y);
    y += lines.length * (size * 0.4) + 2;
  }

  function mutedText2(text: string) {
    doc.setFontSize(8);
    doc.setTextColor(...mutedText);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(text, contentW);
    doc.text(lines, margin, y);
    y += lines.length * 3.5 + 2;
  }

  // ── Header ───────────────────────────────────────────────────────────────
  addFooter();

  // Gold accent bar
  doc.setFillColor(...gold);
  doc.rect(0, 0, pageW, 2, "F");

  doc.setFontSize(9);
  doc.setTextColor(...gold);
  doc.setFont("helvetica", "bold");
  doc.text("BRIEF — CONFIDENTIAL", margin, y + 4);
  y += 10;

  doc.setFontSize(20);
  doc.setTextColor(...lightText);
  const lines = doc.splitTextToSize(brief.detection.name, contentW);
  doc.text(lines, margin, y);
  y += lines.length * 8 + 2;

  doc.setFontSize(9);
  doc.setTextColor(...mutedText);
  doc.text(
    `${brief.detection.sector} · ${brief.detection.geography} · Generated ${new Date(brief.generatedAt).toLocaleDateString("en-GB")}`,
    margin,
    y
  );
  y += 12;

  // ── 30-Second Take ───────────────────────────────────────────────────────
  sectionHeader("The 30-Second Take");
  doc.setFillColor(30, 32, 32);
  const takeLines = doc.splitTextToSize(brief.thirtySecondTake, contentW - 8);
  doc.rect(margin, y - 2, contentW, takeLines.length * 5 + 6, "F");
  doc.setFillColor(...gold);
  doc.rect(margin, y - 2, 1.5, takeLines.length * 5 + 6, "F");
  doc.setFontSize(11);
  doc.setTextColor(...lightText);
  doc.text(takeLines, margin + 5, y + 3);
  y += takeLines.length * 5 + 10;

  // ── Snapshot ─────────────────────────────────────────────────────────────
  if (brief.type === "company") {
    sectionHeader("Company Snapshot");
    const snap = brief.snapshot;
    const fields = [
      ["Sector", snap.sector],
      ["Founded", snap.founded || "—"],
      ["HQ", snap.headquarters || "—"],
      ["Ownership", snap.ownership],
      ["Exchange", snap.exchange || "Private"],
      ["Revenue", snap.revenue || "—"],
    ];
    fields.forEach(([label, value]) => {
      checkY(6);
      doc.setFontSize(8);
      doc.setTextColor(...gold);
      doc.text(label + ":", margin, y);
      doc.setTextColor(...lightText);
      doc.text(value, margin + 30, y);
      y += 5;
    });
    y += 4;

    // Business Model
    sectionHeader("Business Model");
    bodyText(brief.businessModel.description);
    brief.businessModel.keyStreams.forEach((s) => {
      mutedText2(`›  ${s}`);
    });
    y += 4;

    // Financials
    sectionHeader("Financials");
    const fin = brief.financials;
    if (fin.available) {
      const rows = [
        ["Revenue (Latest)", fin.revenue.latest || "—"],
        ["Revenue (Prior)", fin.revenue.prior || "—"],
        ["Revenue Growth", fin.revenue.growth || "—"],
        ["Net Income", fin.netIncome || "—"],
        ["Total Debt", fin.debt || "—"],
        ["Cash", fin.cash || "—"],
      ];
      rows.forEach(([label, value]) => {
        checkY(6);
        doc.setFontSize(8);
        doc.setTextColor(...mutedText);
        doc.text(label, margin, y);
        doc.setTextColor(...lightText);
        doc.text(value, margin + 60, y);
        y += 5;
      });
      mutedText2(`Source: ${fin.source}`);
    } else {
      bodyText(`Financial data unavailable — ${fin.note}`);
    }
    y += 4;

    // Recent Developments
    sectionHeader("Recent Developments");
    if (brief.recentDevelopments.length > 0) {
      brief.recentDevelopments.slice(0, 5).forEach((dev) => {
        checkY(14);
        doc.setFontSize(8);
        doc.setTextColor(...gold);
        doc.text(dev.date, margin, y);
        y += 4;
        doc.setFontSize(9);
        doc.setTextColor(...lightText);
        const devLines = doc.splitTextToSize(dev.headline, contentW);
        doc.text(devLines, margin, y);
        y += devLines.length * 4;
        doc.setFontSize(8);
        doc.setTextColor(...mutedText);
        const mLines = doc.splitTextToSize(`Why it matters: ${dev.whyItMatters}`, contentW);
        doc.text(mLines, margin, y);
        y += mLines.length * 3.5 + 4;
      });
    } else {
      bodyText("No significant developments found in last 90 days.");
    }

    // Banking Context
    sectionHeader("Banking Context");
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("Products Used:", margin, y);
    y += 4;
    bodyText(brief.bankingContext.productsUsed.join(", "), 9);

    checkY(8);
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("Mandate Opportunities:", margin, y);
    y += 4;
    brief.bankingContext.mandateOpportunities.forEach((m, i) => {
      bodyText(`${i + 1}. ${m}`, 9);
    });

    checkY(12);
    doc.setFontSize(8);
    doc.setTextColor(...gold);
    doc.text("Conversation Starter:", margin, y);
    y += 4;
    bodyText(brief.bankingContext.conversationStarter, 10);
    y += 4;

    // Talking Points
    sectionHeader("Interview & Meeting Prep — Talking Points");
    brief.talkingPoints.forEach((tp, i) => {
      checkY(12);
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text(`${i + 1}.`, margin, y);
      doc.setTextColor(...lightText);
      const tLines = doc.splitTextToSize(tp.point, contentW - 8);
      doc.text(tLines, margin + 6, y);
      y += tLines.length * 4;
      mutedText2(tp.context);
    });

    // Smart Questions
    sectionHeader("Smart Questions to Ask");
    brief.smartQuestions.forEach((sq, i) => {
      checkY(12);
      doc.setFontSize(9);
      doc.setTextColor(...gold);
      doc.text(`${i + 1}.`, margin, y);
      doc.setTextColor(...lightText);
      const qLines = doc.splitTextToSize(`"${sq.question}"`, contentW - 8);
      doc.text(qLines, margin + 6, y);
      y += qLines.length * 4;
      mutedText2(sq.why);
    });
  }

  // ── Save ─────────────────────────────────────────────────────────────────
  const filename = `brief-${brief.detection.name.toLowerCase().replace(/\s+/g, "-")}.pdf`;
  doc.save(filename);
}
