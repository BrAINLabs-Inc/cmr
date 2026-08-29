import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';
import { supabaseAdmin } from '../config/supabase.js';
import { escapeLikeValue, sanitizeSpreadsheetCell } from './text.js';
import { unwrap } from './db.js';

export const EXPORT_SELECT_COLUMNS = '*, intake:intakes(intake_number, course_title), student:students(student_number)';
const EXPORT_ROW_CAP = 20000;

function educationValue(row) {
  return row.education_qualification === 'other' ? row.education_qualification_other : row.education_qualification;
}

function howHeardValue(row) {
  return row.how_heard === 'other' ? row.how_heard_other : row.how_heard;
}

function meditationExperienceValue(row) {
  if (row.has_meditation_experience === null || row.has_meditation_experience === undefined) return '';
  return row.has_meditation_experience ? 'Yes' : 'No';
}

// Single source of truth for "what an application export contains" — CSV
// and Excel use every column; the PDF report picks a readable subset of it
// by header name (see PDF_SUMMARY_HEADERS below) instead of redefining
// its own accessors.
export const EXPORT_COLUMNS = [
  { header: 'Intake', value: (r) => (r.intake ? `${r.intake.intake_number} — ${r.intake.course_title}` : '') },
  { header: 'Status', value: (r) => r.status },
  { header: 'Student Number', value: (r) => r.student?.student_number ?? '' },
  { header: 'Submitted At', value: (r) => r.submitted_at },
  { header: 'Title', value: (r) => r.title },
  { header: 'Full Name', value: (r) => r.full_name },
  { header: 'Name With Initials', value: (r) => r.name_with_initials },
  { header: 'Date of Birth', value: (r) => r.date_of_birth },
  { header: 'Gender', value: (r) => r.gender },
  { header: 'NIC/Passport', value: (r) => r.nic_or_passport },
  { header: 'Email', value: (r) => r.email },
  { header: 'Phone', value: (r) => r.phone_number },
  { header: 'WhatsApp', value: (r) => r.whatsapp_number },
  { header: 'Address', value: (r) => r.residential_address },
  { header: 'Occupation', value: (r) => r.current_occupation },
  { header: 'Education Qualification', value: educationValue },
  { header: 'Degree', value: (r) => r.degree_name },
  { header: 'Degree Documents', value: (r) => (r.degree_documents ?? []).map((d) => d.filename).join('; ') },
  { header: 'Reason For Joining', value: (r) => r.reason_for_joining },
  { header: 'Meditation Experience', value: meditationExperienceValue },
  { header: 'How Heard', value: howHeardValue },
  { header: 'Payment Slip', value: (r) => r.payment_slip?.filename ?? '' },
  { header: 'Admin Notes', value: (r) => r.admin_notes },
];

const PDF_SUMMARY_HEADERS = ['Full Name', 'Email', 'Phone', 'NIC/Passport', 'Intake', 'Status', 'Student Number', 'Submitted At'];
const PDF_COLUMNS = PDF_SUMMARY_HEADERS.map((header) => EXPORT_COLUMNS.find((c) => c.header === header));

function applicationsSearchFilter(q) {
  const safe = escapeLikeValue(q.replace(/[,()]/g, ' ').trim());
  const needle = `%${safe}%`;
  return `full_name.ilike.${needle},email.ilike.${needle},nic_or_passport.ilike.${needle}`;
}

export function applyApplicationFilters(query, { intakeId, status, q }) {
  if (intakeId) query = query.eq('intake_id', intakeId);
  if (status) query = query.eq('status', status);
  if (q) query = query.or(applicationsSearchFilter(q));
  return query;
}

export async function fetchApplicationsForExport({ intakeId, status, q }) {
  let query = supabaseAdmin
    .from('applications')
    .select(EXPORT_SELECT_COLUMNS)
    .order('submitted_at', { ascending: false })
    .limit(EXPORT_ROW_CAP);
  query = applyApplicationFilters(query, { intakeId, status, q });
  return unwrap(await query);
}

export function buildApplicationsCsv(rows) {
  const escape = (v) => `"${sanitizeSpreadsheetCell(v).replace(/"/g, '""')}"`;
  const lines = [EXPORT_COLUMNS.map((c) => escape(c.header)).join(',')];

  for (const row of rows) {
    lines.push(EXPORT_COLUMNS.map((c) => escape(c.value(row))).join(','));
  }
  return lines.join('\r\n');
}

export async function buildApplicationsXlsx(rows) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'CMR';
  workbook.created = new Date();

  const sheet = workbook.addWorksheet('Applications', { views: [{ state: 'frozen', ySplit: 1 }] });
  sheet.columns = EXPORT_COLUMNS.map((c) => ({
    header: c.header,
    key: c.header,
    width: Math.min(40, Math.max(14, c.header.length + 6)),
  }));
  sheet.getRow(1).font = { bold: true };
  sheet.autoFilter = { from: { row: 1, column: 1 }, to: { row: 1, column: EXPORT_COLUMNS.length } };

  for (const row of rows) {
    sheet.addRow(Object.fromEntries(EXPORT_COLUMNS.map((c) => [c.header, sanitizeSpreadsheetCell(c.value(row))])));
  }

  return workbook.xlsx.writeBuffer();
}

function drawPdfHeaderRow(doc, colWidth) {
  doc.font('Helvetica-Bold').fontSize(8);
  let x = doc.page.margins.left;
  const y = doc.y;
  for (const column of PDF_COLUMNS) {
    doc.text(column.header, x, y, { width: colWidth - 6, ellipsis: true });
    x += colWidth;
  }
  doc.moveDown(1.1);
  doc
    .moveTo(doc.page.margins.left, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#cccccc')
    .stroke();
  doc.moveDown(0.4);
  doc.font('Helvetica').fontSize(8);
}

export function streamApplicationsPdf(res, rows, summary) {
  const doc = new PDFDocument({ margin: 40, size: 'A4', layout: 'landscape' });
  doc.pipe(res);

  doc.font('Helvetica-Bold').fontSize(16).fillColor('#111111').text('CMR Applications Export');
  doc
    .font('Helvetica')
    .fontSize(9)
    .fillColor('#666666')
    .text(`Generated ${new Date().toLocaleString()}${summary ? ` · ${summary}` : ''} · ${rows.length} application${rows.length === 1 ? '' : 's'}`);
  doc.moveDown(1);
  doc.fillColor('#000000');

  const colWidth = (doc.page.width - doc.page.margins.left - doc.page.margins.right) / PDF_COLUMNS.length;
  const bottomLimit = doc.page.height - doc.page.margins.bottom;

  drawPdfHeaderRow(doc, colWidth);

  for (const row of rows) {
    if (doc.y > bottomLimit - 24) {
      doc.addPage();
      drawPdfHeaderRow(doc, colWidth);
    }

    const y = doc.y;
    const cells = PDF_COLUMNS.map((c) => String(c.value(row) ?? '—'));
    const rowHeight = Math.max(...cells.map((text) => doc.heightOfString(text, { width: colWidth - 6 })));

    let x = doc.page.margins.left;
    cells.forEach((text) => {
      doc.text(text, x, y, { width: colWidth - 6, ellipsis: true });
      x += colWidth;
    });
    doc.y = y + rowHeight + 6;
  }

  doc.end();
}
