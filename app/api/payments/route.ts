import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const currency = searchParams.get('currency');
    const isRecurring = searchParams.get('isRecurring');
    const overdue = searchParams.get('overdue') === 'true';
    
    let payments;
    
    if (overdue) {
      payments = dbQueries.getOverduePayments.all();
    } else if (status && ['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
      payments = dbQueries.getPaymentsByStatus.all(status);
    } else if (currency && CURRENCIES[currency as keyof typeof CURRENCIES]) {
      payments = dbQueries.getPaymentsByCurrency.all(currency);
    } else if (isRecurring === 'true') {
      payments = dbQueries.getRecurringPayments.all();
    } else {
      payments = dbQueries.getAllPayments.all();
    }
    
    // Actualizar estado de pagos vencidos automáticamente
    const today = new Date().toISOString().split('T')[0];
    db.prepare(`
      UPDATE payments 
      SET status = 'overdue', updated_at = datetime('now')
      WHERE status = 'pending' AND due_date < ?
    `).run(today);
    
    // Formatear pagos con información de moneda y días restantes
    const formattedPayments = payments.map((payment: any) => {
      const dueDate = new Date(payment.due_date);
      const todayDate = new Date();
      const daysUntilDue = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...payment,
        formatted_amount: formatCurrency(payment.amount, payment.currency),
        currency_info: CURRENCIES[payment.currency as keyof typeof CURRENCIES],
        days_until_due: daysUntilDue,
        is_overdue: daysUntilDue < 0 && payment.status === 'pending'
      };
    });
    
    return NextResponse.json(formattedPayments);
  } catch (error) {
    console.error('Error fetching payments:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      name, 
      amount, 
      currency, 
      due_date, 
      status, 
      description, 
      is_recurring, 
      recurring_frequency,
      account_id,
      category
    } = body;
    
    // Validaciones básicas
    if (!name || !amount || !currency || !due_date) {
      return NextResponse.json(
        { error: 'Nombre, monto, moneda y fecha de vencimiento son requeridos' },
        { status: 400 }
      );
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }
    
    // Validar moneda
    if (!CURRENCIES[currency as keyof typeof CURRENCIES]) {
      return NextResponse.json(
        { error: 'La moneda especificada no es válida' },
        { status: 400 }
      );
    }
    
    // Validar estado
    if (status && !['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado no válido. Debe ser: pending, paid, overdue o cancelled' },
        { status: 400 }
      );
    }
    
    // Validar fecha de vencimiento
    const dueDateValidation = new Date(due_date);
    if (isNaN(dueDateValidation.getTime())) {
      return NextResponse.json(
        { error: 'La fecha de vencimiento no es válida' },
        { status: 400 }
      );
    }
    
    // Validar nombre
    if (name.length > 200) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 200 caracteres' },
        { status: 400 }
      );
    }
    
    // Validar descripción
    if (description && description.length > 1000) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 1000 caracteres' },
        { status: 400 }
      );
    }
    
    // Validar frecuencia recurrente
    if (is_recurring && recurring_frequency && !['daily', 'weekly', 'monthly', 'quarterly', 'yearly'].includes(recurring_frequency)) {
      return NextResponse.json(
        { error: 'Frecuencia recurrente no válida. Debe ser: daily, weekly, monthly, quarterly o yearly' },
        { status: 400 }
      );
    }
    
    // Validar cuenta si se proporciona
    if (account_id) {
      const account = dbQueries.getAccountById.get(account_id);
      if (!account) {
        return NextResponse.json(
          { error: 'La cuenta especificada no existe' },
          { status: 400 }
        );
      }
      
      if (!(account as any).is_active) {
        return NextResponse.json(
          { error: 'La cuenta especificada está inactiva' },
          { status: 400 }
        );
      }
      
      // Verificar que la moneda de la cuenta coincida
      if ((account as any).currency !== currency) {
        return NextResponse.json(
          { error: `La cuenta seleccionada es en ${(account as any).currency} pero el pago es en ${currency}` },
          { status: 400 }
        );
      }
    }
    
    // Validar categoría
    if (category && !['utilities', 'rent', 'insurance', 'loan', 'subscription', 'tax', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'Categoría no válida' },
        { status: 400 }
      );
    }
    
    const paymentId = uuidv4();
    
    // Insertar el pago
    db.prepare(`
      INSERT INTO payments (
        id, name, amount, currency, due_date, status, description, 
        is_recurring, recurring_frequency, account_id, category, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      paymentId, 
      name, 
      amount, 
      currency,
      due_date, 
      status || 'pending', 
      description || null,
      is_recurring || false,
      recurring_frequency || null,
      account_id || null,
      category || 'other'
    );
    
    // Obtener el pago creado
    const createdPayment = dbQueries.getPaymentById.get(paymentId);
    
    if (!createdPayment) {
      throw new Error('No se pudo recuperar el pago creado');
    }
    
    const dueDate = new Date((createdPayment as any).due_date);
    const todayDate = new Date();
    const daysUntilDue = Math.ceil((dueDate.getTime() - todayDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const formattedPayment = {
      ...createdPayment,
      formatted_amount: formatCurrency((createdPayment as any).amount, (createdPayment as any).currency),
      currency_info: CURRENCIES[(createdPayment as any).currency as keyof typeof CURRENCIES],
      days_until_due: daysUntilDue,
      is_overdue: daysUntilDue < 0 && (createdPayment as any).status === 'pending'
    };
    
    return NextResponse.json(formattedPayment, { status: 201 });
  } catch (error) {
    console.error('Error creating payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      id,
      title,
      amount,
      due_date,
      status,
      category,
      description,
      is_recurring,
      recurring_frequency,
      account_id
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    if (status && !['pending', 'paid', 'overdue', 'cancelled'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado debe ser "pending", "paid", "overdue" o "cancelled"' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE payments 
      SET title = ?, amount = ?, due_date = ?, status = ?, category = ?,
          description = ?, is_recurring = ?, recurring_frequency = ?,
          account_id = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      amount,
      due_date,
      status,
      category,
      description,
      is_recurring,
      recurring_frequency,
      account_id,
      id
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    const updatedPayment = db.prepare(`
      SELECT p.*, a.name as account_name
      FROM payments p
      LEFT JOIN accounts a ON p.account_id = a.id
      WHERE p.id = ?
    `).get(id);

    return NextResponse.json(updatedPayment);
  } catch (error) {
    console.error('Error updating payment:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el pago' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM payments WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Pago no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Pago eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting payment:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el pago' },
      { status: 500 }
    );
  }
}