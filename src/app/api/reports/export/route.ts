import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db/supabase';
import { format, parseISO } from 'date-fns';

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

    // Fetch transactions
    const transactions = await db.getTransactions(session.user.id, {
      startDate: parseISO(startDate),
      endDate: parseISO(endDate),
      ...(categoryId && { categoryId }),
      ...(type && { type }),
    });

    if (exportFormat === 'csv') {
      return exportCSV(transactions);
    } else if (exportFormat === 'pdf') {
      return exportPDF(transactions);
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
      `"${(transaction.description || '').replace(/"/g, '""')}"`, // Escape quotes
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

function exportPDF(transactions: any[]) {
  // For PDF export, we'll create a simple HTML that can be printed as PDF
  // In production, you might want to use a library like pdf-lib or puppeteer
  
  const totalIncome = transactions
    .filter((t) => t.type === 'INCOME')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const totalExpense = transactions
    .filter((t) => t.type === 'EXPENSE')
    .reduce((sum, t) => sum + parseFloat(t.amount.toString()), 0);

  const balance = totalIncome - totalExpense;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Transaction Report</title>
      <style>
        body {
          font-family: Arial, sans-serif;
          margin: 40px;
        }
        h1 {
          color: #333;
        }
        .summary {
          margin: 20px 0;
          padding: 20px;
          background: #f5f5f5;
          border-radius: 5px;
        }
        .summary-item {
          display: flex;
          justify-content: space-between;
          margin: 10px 0;
          font-size: 16px;
        }
        .summary-label {
          font-weight: bold;
        }
        .income {
          color: #10b981;
        }
        .expense {
          color: #ef4444;
        }
        .balance {
          color: #3b82f6;
        }
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        th, td {
          border: 1px solid #ddd;
          padding: 12px;
          text-align: left;
        }
        th {
          background-color: #333;
          color: white;
        }
        tr:nth-child(even) {
          background-color: #f9f9f9;
        }
        .print-date {
          color: #666;
          font-size: 14px;
          margin-top: 20px;
        }
      </style>
    </head>
    <body>
      <h1>Transaction Report</h1>
      <div class="print-date">Generated on: ${format(new Date(), 'PPpp')}</div>
      
      <div class="summary">
        <h2>Summary</h2>
        <div class="summary-item">
          <span class="summary-label">Total Income:</span>
          <span class="income">৳${totalIncome.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Expense:</span>
          <span class="expense">৳${totalExpense.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Balance:</span>
          <span class="balance">৳${balance.toFixed(2)}</span>
        </div>
        <div class="summary-item">
          <span class="summary-label">Total Transactions:</span>
          <span>${transactions.length}</span>
        </div>
      </div>

      <h2>Transactions</h2>
      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Type</th>
            <th>Category</th>
            <th>Amount</th>
            <th>Description</th>
          </tr>
        </thead>
        <tbody>
          ${transactions
            .map(
              (t) => `
            <tr>
              <td>${format(new Date(t.date), 'yyyy-MM-dd')}</td>
              <td>${t.time || ''}</td>
              <td class="${t.type.toLowerCase()}">${t.type}</td>
              <td>${t.category?.name || 'Unknown'}</td>
              <td>৳${parseFloat(t.amount.toString()).toFixed(2)}</td>
              <td>${t.description || ''}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </body>
    </html>
  `;

  const filename = `report-${format(new Date(), 'yyyy-MM-dd')}.html`;

  return new NextResponse(html, {
    status: 200,
    headers: {
      'Content-Type': 'text/html',
      'Content-Disposition': `attachment; filename="${filename}"`,
    },
  });
}

