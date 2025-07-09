import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';
import { format, subMonths, startOfMonth, endOfMonth } from 'date-fns';
import { es } from 'date-fns/locale';

const db = new Database('./database.db');

export async function POST(request: NextRequest) {
  try {
    const { 
      timeRange = '6m', 
      category = 'all', 
      format: exportFormat = 'json',
      includeSettings = false 
    } = await request.json();

    // Calculate date range
    const months = parseInt(timeRange.replace('m', ''));
    const startDate = startOfMonth(subMonths(new Date(), months));
    const endDate = endOfMonth(new Date());

    // Base query conditions
    let whereClause = 'WHERE created_at >= ? AND created_at <= ?';
    let params: any[] = [startDate.toISOString(), endDate.toISOString()];

    if (category !== 'all') {
      whereClause += ' AND category = ?';
      params.push(category);
    }

    // Get payments data
    const paymentsQuery = `
      SELECT 
        id,
        name,
        amount,
        category,
        due_date,
        status,
        priority,
        recurrence,
        frequency,
        description,
        reminder_days,
        paid_date,
        created_at,
        updated_at
      FROM payments 
      ${whereClause}
      ORDER BY created_at DESC
    `;

    const payments = db.prepare(paymentsQuery).all(...params) as any[];

    // Get summary statistics
    const summaryQuery = `
      SELECT 
        COUNT(*) as totalPayments,
        SUM(amount) as totalAmount,
        SUM(CASE WHEN status = 'paid' THEN amount ELSE 0 END) as paidAmount,
        SUM(CASE WHEN status = 'pending' THEN amount ELSE 0 END) as pendingAmount,
        SUM(CASE WHEN status = 'overdue' THEN amount ELSE 0 END) as overdueAmount,
        AVG(amount) as averageAmount
      FROM payments 
      ${whereClause}
    `;

    const summary = db.prepare(summaryQuery).get(...params) as any;

    // Get category breakdown
    const categoryQuery = `
      SELECT 
        category,
        COUNT(*) as count,
        SUM(amount) as totalAmount,
        AVG(amount) as averageAmount
      FROM payments 
      ${whereClause}
      GROUP BY category
      ORDER BY totalAmount DESC
    `;

    const categoryBreakdown = db.prepare(categoryQuery).all(...params) as any[];

    // Prepare export data
    const exportData: any = {
      metadata: {
        exportDate: new Date().toISOString(),
        timeRange,
        category,
        totalRecords: payments.length
      },
      summary,
      categoryBreakdown,
      payments
    };

    // Include settings if requested
    if (includeSettings) {
      const settingsQuery = 'SELECT settings_data FROM payment_settings WHERE user_id = ?';
      const settingsResult = db.prepare(settingsQuery).get('default') as any;
      
      if (settingsResult) {
        exportData.settings = JSON.parse(settingsResult.settings_data);
      }

      // Include categories
      const categoriesQuery = 'SELECT * FROM payment_categories ORDER BY name';
      const categories = db.prepare(categoriesQuery).all();
      exportData.categories = categories;
    }

    if (exportFormat === 'json') {
      const jsonData = JSON.stringify(exportData, null, 2);
      
      return new NextResponse(jsonData, {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="payments-export-${format(new Date(), 'yyyy-MM-dd')}.json"`
        }
      });
    } else if (exportFormat === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'ID',
        'Nombre',
        'Monto',
        'Categoría',
        'Fecha Vencimiento',
        'Estado',
        'Prioridad',
        'Recurrencia',
        'Frecuencia',
        'Descripción',
        'Días Recordatorio',
        'Fecha Pago',
        'Fecha Creación'
      ];

      const csvRows = payments.map(payment => [
        payment.id,
        `"${payment.name}"`,
        payment.amount,
        `"${payment.category}"`,
        payment.due_date,
        payment.status,
        payment.priority,
        payment.recurrence || '',
        payment.frequency || '',
        `"${payment.description || ''}"`,
        payment.reminder_days,
        payment.paid_date || '',
        payment.created_at
      ]);

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.join(','))
      ].join('\n');

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="payments-export-${format(new Date(), 'yyyy-MM-dd')}.csv"`
        }
      });
    } else if (exportFormat === 'pdf') {
      // For PDF, we'll return a simplified JSON that the frontend can use to generate a PDF
      // In a real application, you might use a library like puppeteer or jsPDF
      const pdfData = {
        title: 'Reporte de Pagos',
        generatedAt: format(new Date(), 'PPP', { locale: es }),
        period: `${format(startDate, 'PPP', { locale: es })} - ${format(endDate, 'PPP', { locale: es })}`,
        summary: {
          totalPayments: summary.totalPayments,
          totalAmount: summary.totalAmount,
          paidAmount: summary.paidAmount,
          pendingAmount: summary.pendingAmount,
          overdueAmount: summary.overdueAmount,
          averageAmount: summary.averageAmount
        },
        categoryBreakdown,
        recentPayments: payments.slice(0, 20) // Limit for PDF
      };

      return new NextResponse(JSON.stringify(pdfData), {
        headers: {
          'Content-Type': 'application/json',
          'Content-Disposition': `attachment; filename="payments-report-${format(new Date(), 'yyyy-MM-dd')}.json"`
        }
      });
    }

    return NextResponse.json(
      { error: 'Formato de exportación no soportado' },
      { status: 400 }
    );
  } catch (error) {
    console.error('Error exporting payment data:', error);
    return NextResponse.json(
      { error: 'Error al exportar los datos' },
      { status: 500 }
    );
  }
}