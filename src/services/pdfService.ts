
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const COLORS = {
  primary: [30, 60, 114],
  secondary: [42, 82, 152],
  accent: [29, 133, 237],
  text: [51, 65, 85],
  lightText: [100, 116, 139],
  border: [226, 232, 240]
};

const drawHeader = (doc: any, title: string, subtitle: string, rightText?: string) => {
  doc.setFillColor(...COLORS.primary);
  doc.rect(0, 0, 210, 45, 'F');
  doc.setDrawColor(255, 255, 255);
  doc.setLineWidth(0.5);
  doc.line(14, 32, 196, 32);
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(title.toUpperCase(), 14, 22);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(200, 210, 230);
  doc.text(subtitle, 14, 38);
  if (rightText) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(rightText, 196, 22, { align: 'right' });
  }
};

const drawPageNumber = (doc: any) => {
  const pageCount = doc.internal.getNumberOfPages();
  const pageHeight = doc.internal.pageSize.height || 297;
  doc.setFontSize(8);
  doc.setTextColor(150);
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.text(`Page ${i} sur ${pageCount}`, 196, pageHeight - 10, { align: 'right' });
    doc.text("ComptaLink Vision AI Studio - Rapport Confidentiel", 14, pageHeight - 10);
  }
};

const extractTablesFromMessages = (messages: any[]) => {
    const allTables: any[] = [];
    messages.forEach(msg => {
        if (msg.role === 'model') {
            const tableRegex = /\|(.+)\|[\r\n]+\|([\s-:\\|]+)\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g;
            let match;
            while ((match = tableRegex.exec(msg.text)) !== null) {
                const headers = match[1].split('|').map(h => h.trim()).filter(h => h !== '');
                const rows = match[3].trim().split('\n').map(row => 
                    row.split('|').map(c => c.trim()).filter(c => c !== '')
                );
                allTables.push({ headers, rows });
            }
        }
    });
    return allTables;
};

const formatDZ = (n: number) => new Intl.NumberFormat('fr-DZ').format(Math.round(n)) + ' DA';

export const pdfService = {
  generateExpertReportPdf: (expert: any, messages: any[]) => {
    const doc: any = new jsPDF();
    const date = new Date().toLocaleDateString('fr-DZ');
    drawHeader(doc, "Expertise Analytique", `Agent : ${expert.name} | ${expert.role}`, date);

    let yPos = 60;
    doc.setFontSize(16);
    doc.setTextColor(...COLORS.primary);
    doc.setFont('helvetica', 'bold');
    doc.text("1. Diagnostic Financier", 14, yPos);
    yPos += 12;

    messages.forEach((msg) => {
        if (msg.role === 'model' && msg.text) {
            const sections = msg.text.split(/(\|[^\n]+\|\n\|[\s-:\\|]+\|\n(?:\|[^\n]+\|\n?)+|### .*?\n)/g);
            
            sections.forEach((section: string) => {
                if (!section.trim()) return;
                if (yPos > 260) { doc.addPage(); yPos = 25; }

                if (section.startsWith('###')) {
                    const title = section.replace('###', '').trim();
                    doc.setFontSize(14);
                    doc.setFont('helvetica', 'bold');
                    doc.setTextColor(...COLORS.primary);
                    doc.text(title, 14, yPos);
                    doc.setDrawColor(...COLORS.accent);
                    doc.setLineWidth(0.8);
                    doc.line(14, yPos + 2, 40, yPos + 2);
                    yPos += 12;
                } else if (section.trim().startsWith('|')) {
                    const lines = section.trim().split('\n').filter(l => l.includes('|'));
                    if (lines.length > 2) {
                        const headers = lines[0].split('|').filter(h => h.trim()).map(h => h.trim());
                        const body = lines.slice(2).map(row => row.split('|').filter(c => c.trim()).map(c => c.trim()));
                        
                        autoTable(doc, {
                            startY: yPos,
                            head: [headers],
                            body: body,
                            theme: 'grid',
                            headStyles: { fillColor: COLORS.primary, textColor: 255, fontSize: 9, fontStyle: 'bold' },
                            styles: { fontSize: 8, cellPadding: 3, textColor: COLORS.text, lineColor: COLORS.border },
                            alternateRowStyles: { fillColor: [245, 248, 255] },
                            columnStyles: { 
                                ...headers.reduce((acc: any, h, idx) => {
                                    if (body.some(row => /[\d\s,.]+DA|[\d\s,.]+%/.test(row[idx]))) {
                                        acc[idx] = { halign: 'right' };
                                    }
                                    return acc;
                                }, {})
                            },
                            margin: { left: 14, right: 14 },
                            didDrawPage: (data) => { yPos = data.cursor.y; }
                        });
                        yPos = (doc as any).lastAutoTable.finalY + 12;
                    }
                } else {
                    doc.setFontSize(10);
                    doc.setFont('helvetica', 'normal');
                    doc.setTextColor(...COLORS.text);
                    const cleanText = section.replace(/\*\*/g, '').trim();
                    const wrapped = doc.splitTextToSize(cleanText, 182);
                    doc.text(wrapped, 14, yPos);
                    yPos += (wrapped.length * 5) + 5;
                }
            });
        }
    });

    drawPageNumber(doc);
    doc.save(`Expertise_ComptaLink_${date.replace(/\//g, '-')}.pdf`);
  },

  generateExcelReport: (expert: any, messages: any[]) => {
    const tables = extractTablesFromMessages(messages);
    if (tables.length === 0) {
        alert("Aucun tableau de données trouvé dans cette conversation pour l'export Excel.");
        return;
    }

    let excelContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head><meta charset="utf-8" /><style>
        table { border-collapse: collapse; font-family: Calibri, sans-serif; }
        th { background-color: #1e3c72; color: white; font-weight: bold; border: 0.5pt solid #ccc; padding: 10px; text-align: center; }
        td { border: 0.5pt solid #ccc; padding: 8px; vertical-align: middle; }
        .num { text-align: right; mso-number-format:"\#\,\#\#0\.00"; }
        .title { font-size: 16pt; font-weight: bold; color: #1e3c72; }
      </style></head><body>
      <div class="title">Rapport de Données ComptaLink - ${expert.name}</div>
      <p>Généré le ${new Date().toLocaleString('fr-DZ')}</p>
      <br/>
    `;

    tables.forEach((table, idx) => {
        excelContent += `<h3>Tableau ${idx + 1}</h3><table><thead><tr>`;
        table.headers.forEach((h: string) => excelContent += `<th>${h}</th>`);
        excelContent += `</tr></thead><tbody>`;
        table.rows.forEach((row: string[]) => {
            excelContent += `<tr>`;
            row.forEach((cell: string) => {
                const isNum = /^[0-9\s,.]+$/.test(cell.replace('DA', '').replace('%', '').trim());
                excelContent += `<td class="${isNum ? 'num' : ''}">${cell}</td>`;
            });
            excelContent += `</tr>`;
        });
        excelContent += `</tbody></table><br/><br/>`;
    });

    excelContent += `</body></html>`;
    
    const blob = new Blob([excelContent], { type: 'application/vnd.ms-excel' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Donnees_Analytiques_ComptaLink_${Date.now()}.xls`;
    link.click();
  },

  generateWordReport: (expert: any, messages: any[]) => {
    let wordContent = `
      <html xmlns:o='urn:schemas-microsoft-com:office:office' xmlns:w='urn:schemas-microsoft-com:office:word' xmlns='http://www.w3.org/TR/REC-html40'>
      <head><meta charset='utf-8'><style>
        body { font-family: 'Calibri', sans-serif; line-height: 1.6; color: #333; }
        h1 { color: #1e3c72; border-bottom: 2pt solid #1e3c72; padding-bottom: 5pt; }
        h2 { color: #2a5298; margin-top: 25pt; font-size: 14pt; border-left: 4pt solid #1d85ed; padding-left: 10pt; }
        table { border-collapse: collapse; width: 100%; margin: 20pt 0; }
        th { background-color: #f4f7fb; border: 1pt solid #999; padding: 8pt; text-align: left; font-weight: bold; color: #1e3c72; }
        td { border: 1pt solid #ccc; padding: 8pt; font-size: 10pt; }
        .footer { font-size: 9pt; color: #777; margin-top: 40pt; border-top: 1pt solid #eee; padding-top: 10pt; }
        .note { background-color: #f9f9f9; padding: 10pt; border-radius: 5pt; font-style: italic; }
      </style></head><body>
      <h1>RAPPORT D'EXPERTISE COMPTALINK</h1>
      <p><b>Expert Digital :</b> ${expert.name} (${expert.role})</p>
      <p><b>Date du rapport :</b> ${new Date().toLocaleDateString('fr-DZ')}</p>
      <div class="note">Ce document récapitule les analyses et recommandations formulées par notre intelligence artificielle spécialisée.</div>
    `;

    messages.forEach(msg => {
        if (msg.role === 'model') {
            const html = msg.text
                .replace(/### (.*)/g, '<h2>$1</h2>')
                .replace(/\*\*(.*?)\*\*/g, '<b>$1</b>')
                .replace(/\|(.+)\|[\r\n]+\|[\s-:\\|]+\|[\r\n]+((?:\|.+\|[\r\n]*)+)/g, (match: string) => {
                    const lines = match.trim().split('\n');
                    let tableHtml = '<table><thead><tr>';
                    lines[0].split('|').filter(c => c.trim()).forEach(h => tableHtml += `<th>${h.trim()}</th>`);
                    tableHtml += '</tr></thead><tbody>';
                    lines.slice(2).forEach(row => {
                        tableHtml += '<tr>';
                        row.split('|').filter(c => c.trim()).forEach(cell => {
                            const isNum = /^[0-9\s,.]+$/.test(cell.replace('DA', '').replace('%', '').trim());
                            tableHtml += `<td style="${isNum ? 'text-align:right;' : ''}">${cell.trim()}</td>`;
                        });
                        tableHtml += '</tr>';
                    });
                    return tableHtml + '</tbody></table>';
                })
                .replace(/\n/g, '<br/>');
            wordContent += `<div>${html}</div>`;
        }
    });

    wordContent += `<div class='footer'>Rapport généré par ComptaLink Visionary Studio - Confidentialité garantie.</div></body></html>`;
    
    const blob = new Blob(['\ufeff', wordContent], { type: 'application/msword' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Rapport_Expert_ComptaLink_${Date.now()}.doc`;
    link.click();
  },

  generateQuotePdf: (data: any, settings: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Estimation d'Honoraires", data.type, new Date().toLocaleDateString('fr-DZ'));
    
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.text("Résumé de la demande", 14, 60);
    
    doc.setFontSize(10);
    doc.setTextColor(...COLORS.text);
    const summary = doc.splitTextToSize(data.summary, 182);
    doc.text(summary, 14, 70);
    
    const tableData = Object.entries(data.details).map(([k, v]) => [k, v]);
    autoTable(doc, {
      startY: 70 + (summary.length * 5),
      head: [['Paramètre', 'Valeur']],
      body: tableData,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 15;
    doc.setFontSize(16);
    doc.text(`Montant Estimé : ${formatDZ(data.price)} HT`, 14, finalY);
    
    drawPageNumber(doc);
    doc.save(`Estimation_ComptaLink_${Date.now()}.pdf`);
  },

  generateValuationPdf: (data: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Rapport de Valorisation Startup", data.formData.nomEntreprise, new Date().toLocaleDateString('fr-DZ'));

    let yPos = 60;
    doc.setFontSize(14);
    doc.text("Score Final du Projet", 14, yPos);
    yPos += 10;
    doc.setFontSize(24);
    doc.setTextColor(...COLORS.accent);
    doc.text(`${data.finalScore.total}/100`, 14, yPos);
    
    yPos += 20;
    doc.setFontSize(14);
    doc.setTextColor(...COLORS.primary);
    doc.text("Synthèse des Valorisations", 14, yPos);
    
    const valRows = [
      ['Méthode Scorecard', formatDZ(data.valuations.scorecard)],
      ['Méthode Berkus', formatDZ(data.valuations.berkus)],
      ['Méthode Venture Capital', formatDZ(data.valuations.vc)],
      ['Moyenne du marché', formatDZ(data.valuations.median)]
    ];

    autoTable(doc, {
      startY: yPos + 5,
      head: [['Méthode d\'évaluation', 'Valorisation estimée']],
      body: valRows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary }
    });

    drawPageNumber(doc);
    doc.save(`Valorisation_${data.formData.nomEntreprise}_${Date.now()}.pdf`);
  },

  generateBusinessPlanPdf: (formData: any, stats: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Business Plan Pro", formData.nomEntreprise, new Date().toLocaleDateString('fr-DZ'));

    doc.setFontSize(14);
    doc.text("Indicateurs de Viabilité", 14, 60);

    const rows = [
      ['Chiffre d\'Affaires (An 1)', formatDZ(stats.ca)],
      ['Charges d\'Exploitation', formatDZ(stats.charges)],
      ['Résultat Net Estimé', formatDZ(stats.resultNet)],
      ['VAN (5 ans)', formatDZ(stats.van)],
      ['Taux de Rentabilité (TRI)', `${stats.tri}%`],
      ['Besoin en Fonds de Roulement', formatDZ(stats.bfr)]
    ];

    autoTable(doc, {
      startY: 70,
      head: [['Indicateur', 'Estimation']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary }
    });

    drawPageNumber(doc);
    doc.save(`BusinessPlan_${formData.nomEntreprise}_${Date.now()}.pdf`);
  },

  generateChecklistPdf: (data: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Checklist Création Startup", `Avancement : ${data.percent}%`, new Date().toLocaleDateString('fr-DZ'));

    let yPos = 60;
    data.phases.forEach((phase: any) => {
      if (yPos > 250) { doc.addPage(); yPos = 25; }
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(`${phase.name}`, 14, yPos);
      yPos += 8;

      const tasks = phase.sections.flatMap((s: any) => s.tasks);
      const rows = tasks.map((t: any) => [
        data.completedTasks.includes(t.id) ? '[X]' : '[ ]',
        t.title
      ]);

      autoTable(doc, {
        startY: yPos,
        body: rows,
        styles: { fontSize: 8 },
        columnStyles: { 0: { cellWidth: 10 } }
      });
      yPos = (doc as any).lastAutoTable.finalY + 10;
    });

    drawPageNumber(doc);
    doc.save(`Checklist_Creation_${Date.now()}.pdf`);
  },

  generateForecastPdf: (formData: any, results: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Prévisions Financières", formData.companyName, new Date().toLocaleDateString('fr-DZ'));

    autoTable(doc, {
      startY: 60,
      head: [['Poste', ...results.map((r: any) => `Année ${r.year}`)]],
      body: [
        ['Chiffre d\'Affaires', ...results.map((r: any) => formatDZ(r.caHT))],
        ['Résultat d\'Exploitation', ...results.map((r: any) => formatDZ(r.resultatExploitation))],
        ['Résultat Net', ...results.map((r: any) => formatDZ(r.resultatNet))],
        ['Trésorerie Finale', ...results.map((r: any) => formatDZ(r.cashEnd))]
      ],
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary }
    });

    drawPageNumber(doc);
    doc.save(`Forecast_${formData.companyName}_${Date.now()}.pdf`);
  },

  generateCacLtvPdf: (data: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Analyse Unit Economics", "CAC & LTV", new Date().toLocaleDateString('fr-DZ'));

    autoTable(doc, {
      startY: 60,
      head: [['Métrique', 'Valeur']],
      body: [
        ['Coût d\'Acquisition (CAC)', formatDZ(data.results.cac)],
        ['Lifetime Value (LTV)', formatDZ(data.results.ltv || data.results.ltvUpsell)],
        ['Ratio LTV/CAC', `${(data.results.ratio).toFixed(2)}x`],
        ['Payback Period', `${(data.results.payback).toFixed(1)} mois`]
      ],
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary }
    });

    drawPageNumber(doc);
    doc.save(`Unit_Economics_${Date.now()}.pdf`);
  },

  generatePayslipPdf: (data: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, "Bulletin de Paie", data.employeeInfo.name, new Date().toLocaleDateString('fr-DZ'));

    doc.setFontSize(10);
    doc.text(`Employeur: ${data.companyInfo.name}`, 14, 60);
    doc.text(`NIF: ${data.companyInfo.nif}`, 14, 65);

    const rows = [
      ['Salaire de Base', '', formatDZ(data.baseSalary)],
      ...data.bonuses.map((b: any) => [b.name, '', formatDZ(b.amount)]),
      ['Cotisation SS (Salarié)', '9%', `-${formatDZ(data.results.cnas)}`],
      ['IRG', 'Barème', `-${formatDZ(data.results.irg)}`],
      ['NET À PAYER', '', formatDZ(data.results.netSalary)]
    ];

    autoTable(doc, {
      startY: 75,
      head: [['Désignation', 'Taux', 'Montant']],
      body: rows,
      theme: 'grid',
      headStyles: { fillColor: COLORS.primary }
    });

    drawPageNumber(doc);
    doc.save(`Bulletin_${data.employeeInfo.name}_${Date.now()}.pdf`);
  },

  generateInvoicePdf: (data: any) => {
    const doc: any = new jsPDF();
    drawHeader(doc, data.meta.type, `N° ${data.meta.number}`, data.meta.date);

    doc.setFontSize(10);
    doc.text(`Client: ${data.client.name}`, 14, 60);
    doc.text(`${data.client.address}`, 14, 65);

    const rows = data.items.map((i: any) => [
      i.description,
      i.quantity,
      formatDZ(i.price),
      `${i.tva}%`,
      formatDZ(i.quantity * i.price)
    ]);

    autoTable(doc, {
      startY: 80,
      head: [['Description', 'Qté', 'P.U HT', 'TVA', 'Total HT']],
      body: rows,
      theme: 'striped',
      headStyles: { fillColor: COLORS.primary }
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.text(`Total HT: ${formatDZ(data.totals.totalHT)}`, 140, finalY);
    doc.text(`TVA: ${formatDZ(data.totals.totalTVA)}`, 140, finalY + 5);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(`NET À PAYER: ${formatDZ(data.totals.netAPayer)}`, 140, finalY + 15);

    drawPageNumber(doc);
    doc.save(`${data.meta.type}_${data.meta.number}.pdf`);
  }
};
