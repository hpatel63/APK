import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import dayjs from 'dayjs';
import { UPLOAD_DIR } from '../config.js';

export function renderTemplate(template, context) {
  return template.replace(/{{(\w+)}}/g, (_, key) => context[key] ?? '');
}

export async function generatePdf({ template, context, filename }) {
  const doc = new PDFDocument({ margin: 40 });
  const outputPath = path.join(UPLOAD_DIR, filename);
  const stream = fs.createWriteStream(outputPath);
  doc.pipe(stream);
  doc.fontSize(18).text(context.propertyName || 'Aurora Hospitality', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(renderTemplate(template, context));
  doc.moveDown();
  doc.text(`Generated: ${dayjs().format('YYYY-MM-DD HH:mm')}`);
  doc.text(`Reservation: ${context.reservationCode || 'N/A'}`);
  doc.end();

  await new Promise((resolve, reject) => {
    stream.on('finish', resolve);
    stream.on('error', reject);
  });

  return outputPath;
}
