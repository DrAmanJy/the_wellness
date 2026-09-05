import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export interface InvoiceItem {
  product: {
    name: string;
    price: number;
    type?: string;
  };
  quantity: number;
}

export interface InvoiceOrderData {
  orderId: string;
  paymentId?: string;
  items: InvoiceItem[];
  subtotal: number;
  shipping: number;
  tax: number;
  total: number;
  shippingForm: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    zipCode: string;
  };
  date: string;
  status?: string;
  hasRxItems?: boolean;
}

interface jsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: { finalY: number };
}

export function generateInvoicePDF(order: InvoiceOrderData): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  }) as jsPDFWithAutoTable;

  const pageWidth = doc.internal.pageSize.getWidth();

  // Color Palette
  const navyColor: [number, number, number] = [12, 27, 51]; // #0C1B33
  const greenColor: [number, number, number] = [0, 176, 116]; // #00B074
  const darkText: [number, number, number] = [45, 55, 72]; // #2D3748
  const mutedText: [number, number, number] = [113, 128, 150]; // #718096
  const lightBg: [number, number, number] = [248, 250, 252];
  const borderLine: [number, number, number] = [226, 232, 240];

  // 1. Top Decorative Brand Bar
  doc.setFillColor(...greenColor);
  doc.rect(0, 0, pageWidth, 4, 'F');

  // 2. Header: Left Brand Identity
  doc.setTextColor(...navyColor);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(22);
  doc.text('The Wellness.', 14, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...mutedText);
  doc.text('Clinical Formulations & Diagnostic Atelier', 14, 23);
  doc.text('GSTIN: 07AAAAT1234F1Z5 | support@thewellness.com', 14, 27);

  // Header: Right Invoice Title & Metadata
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.setTextColor(...navyColor);
  doc.text('TAX INVOICE', pageWidth - 14, 18, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text(`Invoice No: INV-${order.orderId.substring(0, 8).toUpperCase()}`, pageWidth - 14, 23, {
    align: 'right',
  });
  doc.text(`Date: ${new Date(order.date).toLocaleDateString('en-IN')}`, pageWidth - 14, 27, {
    align: 'right',
  });

  // Top Divider
  doc.setDrawColor(...borderLine);
  doc.setLineWidth(0.5);
  doc.line(14, 32, pageWidth - 14, 32);

  // 3. Customer & Transaction Details Box
  const cardY = 36;
  const cardHeight = 28;

  doc.setFillColor(...lightBg);
  doc.setDrawColor(...borderLine);
  doc.roundedRect(14, cardY, pageWidth - 28, cardHeight, 2, 2, 'FD');

  // Left Column - Shipping / Patient Details
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text('BILLED & DELIVERED TO', 18, cardY + 6);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...navyColor);
  doc.text(order.shippingForm.fullName || 'Valued Customer', 18, cardY + 11);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  const addrText = `${order.shippingForm.address || ''}, ${order.shippingForm.city || ''} ${
    order.shippingForm.zipCode ? `- ${order.shippingForm.zipCode}` : ''
  }`;
  doc.text(addrText, 18, cardY + 16);
  doc.text(
    `Email: ${order.shippingForm.email || 'N/A'}  |  Phone: ${order.shippingForm.phone || 'N/A'}`,
    18,
    cardY + 22,
  );

  // Right Column - Payment & Transaction Reference
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.setTextColor(...mutedText);
  doc.text('PAYMENT DETAILS', pageWidth - 18, cardY + 6, { align: 'right' });

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9);
  doc.setTextColor(...greenColor);
  doc.text('STATUS: PAID & VERIFIED', pageWidth - 18, cardY + 11, { align: 'right' });

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...darkText);
  doc.text(`Gateway: Razorpay`, pageWidth - 18, cardY + 16, { align: 'right' });
  doc.text(`Ref ID: ${order.paymentId || 'PAYMENT_VERIFIED'}`, pageWidth - 18, cardY + 22, {
    align: 'right',
  });

  // 4. Itemised Products Table (Strict Column Alignment Fix)
  const tableRows = order.items.map((item, idx) => {
    const unitPrice = item.product.price;
    const qty = item.quantity;
    const totalAmount = unitPrice * qty;

    return [
      (idx + 1).toString(),
      item.product.name || 'Clinical Formulation',
      item.product.type || 'Prescription Medicine',
      `Rs. ${unitPrice.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
      qty.toString(),
      `Rs. ${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    ];
  });

  autoTable(doc, {
    startY: cardY + cardHeight + 6,
    head: [['#', 'Item Description', 'Formulation Type', 'Unit Price', 'Qty', 'Amount']],
    body: tableRows,
    theme: 'grid',
    headStyles: {
      fillColor: navyColor,
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      fontSize: 8.5,
    },
    bodyStyles: {
      fontSize: 8,
      textColor: darkText,
    },
    columnStyles: {
      0: { cellWidth: 12, halign: 'center' },
      1: { cellWidth: 70, halign: 'left' },
      2: { cellWidth: 36, halign: 'left' },
      3: { cellWidth: 26, halign: 'right' },
      4: { cellWidth: 14, halign: 'center' },
      5: { cellWidth: 24, halign: 'right' },
    },
    alternateRowStyles: {
      fillColor: [250, 252, 255],
    },
    margin: { left: 14, right: 14 },
  });

  // 5. Calculations Summary Section
  const finalY = doc.lastAutoTable?.finalY ?? 110;
  const summaryWidth = 80;
  const summaryX = pageWidth - 14 - summaryWidth;

  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...darkText);

  let currentY = finalY + 8;

  // Subtotal Line
  doc.text('Subtotal:', summaryX, currentY);
  doc.text(
    `Rs. ${(order.subtotal || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - 14,
    currentY,
    { align: 'right' },
  );

  // Shipping Line
  currentY += 5;
  doc.text('Shipping & Cold-Chain:', summaryX, currentY);
  doc.text(
    order.shipping === 0
      ? 'FREE'
      : `Rs. ${(order.shipping || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - 14,
    currentY,
    { align: 'right' },
  );

  // GST Tax Line
  currentY += 5;
  doc.text('GST Tax (10%):', summaryX, currentY);
  doc.text(
    `Rs. ${(order.tax || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - 14,
    currentY,
    { align: 'right' },
  );

  // Divider Line inside Summary
  currentY += 4;
  doc.setDrawColor(...borderLine);
  doc.line(summaryX, currentY, pageWidth - 14, currentY);

  // Grand Total Highlight Box
  currentY += 4;
  doc.setFillColor(240, 253, 244); // Light green background #F0FDF4
  doc.setDrawColor(...greenColor);
  doc.roundedRect(summaryX - 2, currentY, summaryWidth + 2, 9, 1.5, 1.5, 'FD');

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(9.5);
  doc.setTextColor(...greenColor);
  doc.text('Grand Total:', summaryX + 2, currentY + 6);
  doc.text(
    `Rs. ${(order.total || 0).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`,
    pageWidth - 16,
    currentY + 6,
    { align: 'right' },
  );

  // 6. Footer Legal & Compliance Notice
  const pageHeight = doc.internal.pageSize.getHeight();
  const footerY = pageHeight - 20;

  doc.setDrawColor(...borderLine);
  doc.setLineWidth(0.4);
  doc.line(14, footerY - 4, pageWidth - 14, footerY - 4);

  doc.setFont('helvetica', 'bold');
  doc.setFontSize(7.5);
  doc.setTextColor(...navyColor);
  doc.text('Clinical Verification & Legal Compliance Notice:', 14, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(7);
  doc.setTextColor(...mutedText);
  doc.text(
    'All medicinal formulations in this invoice have been verified and approved by registered clinical pharmacists.',
    14,
    footerY + 4,
  );
  doc.text(
    'This is an official computer-generated tax invoice and requires no physical signature. www.thewellness.com',
    14,
    footerY + 8,
  );

  // 7. Save PDF File
  const cleanFilename = `Invoice_${(order.orderId || 'ORDER').replace(/[^a-zA-Z0-9_-]/g, '_')}.pdf`;
  doc.save(cleanFilename);
}
