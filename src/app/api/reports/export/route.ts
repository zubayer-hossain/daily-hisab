import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { format, parseISO } from 'date-fns';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export async function GET(request: NextRequest) {
  try {
    const session = await auth();
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const categoryId = searchParams.get('categoryId');
    const type = searchParams.get('type') as 'INCOME' | 'EXPENSE' | null;
    const exportFormat = searchParams.get('format') || 'csv';

    if (!startDate || !endDate) {
      return NextResponse.json(
        { error: 'Start date and end date are required' },
        { status: 400 }
      );
    }

    const parsedStartDate = parseISO(startDate);
    const parsedEndDate = parseISO(endDate);

    const transactions = await db.getTransactions(session.user.id, {
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      ...(categoryId && { categoryId }),
      ...(type && { type }),
    });

    if (exportFormat === 'csv') {
      return exportCSV(transactions);
    } else if (exportFormat === 'pdf') {
      return await exportPDF(transactions, parsedStartDate, parsedEndDate);
    }

    return NextResponse.json({ error: 'Invalid export format' }, { status: 400 });
  } catch (error) {
    console.error('Error exporting report:', error);
    return NextResponse.json(
      { error: 'Failed to export report' },
      { status: 500 }
    );
  }
}

function exportCSV(transactions: any[]) {
  const headers = ['Date', 'Time', 'Type', 'Category', 'Amount', 'Description'];
  const csvRows = [headers.join(',')];

  transactions.forEach((transaction) => {
    const row = [
      format(new Date(transaction.date), 'yyyy-MM-dd'),
      transaction.time || '',
      transaction.type,
      transaction.category?.name || 'Unknown',
      transaction.amount,
      `"${(transaction.description || '').replace(/"/g, '""')}"`,
    ];
    csvRows.push(row.join(','));
  });

  const csvContent = csvRows.join('\n');
  const filename = `report-${format(new Date(), 'yyyy-MM-dd')}.csv`;

  return new NextResponse(csvContent, {
    status: 200,
    headers: {
      'Content-Type': 'text/csv',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

async function exportPDF(transactions: any[], startDate: Date, endDate: Date) {
  try {
    // Calculate totals
    const totalIncome = transactions
      .filter((t) => t.type === 'INCOME')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const totalExpense = transactions
      .filter((t) => t.type === 'EXPENSE')
      .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

    const balance = totalIncome - totalExpense;

    // Create PDF
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage();
    const { height } = page.getSize();
    
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    let y = height - 50;

    // Title
    page.drawText('Financial Report', {
      x: 50,
      y,
      size: 24,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 40;

    // Date range
    page.drawText(`Period: ${format(startDate, 'MMM dd, yyyy')} - ${format(endDate, 'MMM dd, yyyy')}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0.3, 0.3, 0.3),
    });
    y -= 40;

    // Summary
    page.drawText('Summary', {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    page.drawText(`Total Income: $${totalIncome.toFixed(2)}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0, 0.5, 0),
    });
    y -= 20;

    page.drawText(`Total Expense: $${totalExpense.toFixed(2)}`, {
      x: 50,
      y,
      size: 12,
      font,
      color: rgb(0.8, 0, 0),
    });
    y -= 20;

    page.drawText(`Balance: $${balance.toFixed(2)}`, {
      x: 50,
      y,
      size: 12,
      font: boldFont,
      color: balance >= 0 ? rgb(0, 0.5, 0) : rgb(0.8, 0, 0),
    });
    y -= 30;

    // Transactions
    page.drawText(`Transactions (${transactions.length})`, {
      x: 50,
      y,
      size: 16,
      font: boldFont,
      color: rgb(0, 0, 0),
    });
    y -= 25;

    // Show first 10 transactions
    const displayTx = transactions.slice(0, 10);
    displayTx.forEach((tx) => {
      if (y < 100) return; // Stop if we run out of space
      
      const txText = `${format(new Date(tx.date), 'MMM dd')} - ${tx.category?.name || 'N/A'} - $${parseFloat(tx.amount).toFixed(2)} (${tx.type})`;
      page.drawText(txText, {
        x: 50,
        y,
        size: 10,
        font,
        color: rgb(0, 0, 0),
      });
      y -= 18;
    });

    if (transactions.length > 10) {
      y -= 5;
      page.drawText(`...and ${transactions.length - 10} more`, {
        x: 50,
        y,
        size: 9,
        font,
        color: rgb(0.5, 0.5, 0.5),
      });
    }

    // Generate PDF
    const pdfBytes = await pdfDoc.save();
    const filename = `report-${format(new Date(), 'yyyy-MM-dd')}.pdf`;

    return new NextResponse(Buffer.from(pdfBytes), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    throw error;
  }
}
