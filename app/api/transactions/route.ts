import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');
    const accountId = searchParams.get('accountId');
    const categoryId = searchParams.get('categoryId');
    const currency = searchParams.get('currency');
    const type = searchParams.get('type');
    
    let transactions;
    
    if (accountId) {
      transactions = dbQueries.getTransactionsByAccount.all(accountId);
    } else if (categoryId) {
      transactions = dbQueries.getTransactionsByCategory.all(categoryId);
    } else if (startDate && endDate) {
      transactions = dbQueries.getTransactionsByDateRange.all(startDate, endDate);
    } else {
      transactions = dbQueries.getAllTransactions.all();
    }
    
    // Filtrar por moneda si se especifica
    if (currency && CURRENCIES[currency as keyof typeof CURRENCIES]) {
      transactions = transactions.filter((t: any) => t.account_currency === currency);
    }
    
    // Filtrar por tipo si se especifica
    if (type && (type === 'income' || type === 'expense')) {
      transactions = transactions.filter((t: any) => t.type === type);
    }
    
    // Formatear transacciones con información de moneda
    const formattedTransactions = transactions.map((transaction: any) => ({
      ...transaction,
      tags: transaction.tags ? JSON.parse(transaction.tags) : [],
      formatted_amount: formatCurrency(transaction.amount, transaction.account_currency)
    }));
    
    return NextResponse.json(formattedTransactions);
  } catch (error) {
    console.error('Error fetching transactions:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { description, amount, type, category_id, account_id, date, tags, location } = body;
    
    // Validaciones básicas
    if (!description || !amount || !type || !category_id || !account_id || !date) {
      return NextResponse.json(
        { error: 'Todos los campos requeridos deben ser proporcionados' },
        { status: 400 }
      );
    }
    
    if (type !== 'income' && type !== 'expense') {
      return NextResponse.json(
        { error: 'El tipo debe ser "income" o "expense"' },
        { status: 400 }
      );
    }
    
    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json(
        { error: 'El monto debe ser un número positivo' },
        { status: 400 }
      );
    }
    
    // Validar fecha
    const transactionDate = new Date(date);
    if (isNaN(transactionDate.getTime())) {
      return NextResponse.json(
        { error: 'La fecha proporcionada no es válida' },
        { status: 400 }
      );
    }
    
    // Verificar que la cuenta existe y está activa
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
    
    // Verificar que la categoría existe y está activa
    const category = dbQueries.getCategoryById.get(category_id);
    if (!category) {
      return NextResponse.json(
        { error: 'La categoría especificada no existe' },
        { status: 400 }
      );
    }
    
    if (!(category as any).is_active) {
      return NextResponse.json(
        { error: 'La categoría especificada está inactiva' },
        { status: 400 }
      );
    }
    
    // Verificar que el tipo de transacción coincide con el tipo de categoría
    if ((category as any).type !== type) {
      return NextResponse.json(
        { error: `La categoría seleccionada es de tipo "${(category as any).type}" pero la transacción es de tipo "${type}"` },
        { status: 400 }
      );
    }
    
    // Validar tags
    if (tags && !Array.isArray(tags)) {
      return NextResponse.json(
        { error: 'Las etiquetas deben ser un array' },
        { status: 400 }
      );
    }
    
    // Validar descripción
    if (description.length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }
    
    // Validar ubicación
    if (location && location.length > 200) {
      return NextResponse.json(
        { error: 'La ubicación no puede exceder 200 caracteres' },
        { status: 400 }
      );
    }
    
    const transactionId = uuidv4();
    const transactionAmount = type === 'expense' ? -Math.abs(amount) : Math.abs(amount);
    const tagsJson = tags && Array.isArray(tags) ? JSON.stringify(tags) : null;
    
    // Iniciar transacción de base de datos
    const dbTransaction = db.transaction(() => {
      // Insertar la transacción
      db.prepare(`
        INSERT INTO transactions (id, description, amount, type, category_id, account_id, date, tags, location, created_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
      `).run(transactionId, description, transactionAmount, type, category_id, account_id, date, tagsJson, location || null);
      
      // Actualizar el balance de la cuenta
      db.prepare(`
        UPDATE accounts 
        SET balance = balance + ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(transactionAmount, account_id);
    });
    
    dbTransaction();
    
    // Obtener la transacción creada con información completa
    const createdTransaction = db.prepare(`
      SELECT t.*, a.name as account_name, a.currency as account_currency,
             c.name as category_name, c.color as category_color, c.icon as category_icon
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(transactionId);
    
    const formattedTransaction = {
      ...(createdTransaction as any),
      tags: (createdTransaction as any).tags ? JSON.parse((createdTransaction as any).tags) : [],
      formatted_amount: formatCurrency((createdTransaction as any).amount, (createdTransaction as any).account_currency)
    };
    
    return NextResponse.json(formattedTransaction, { status: 201 });
  } catch (error) {
    console.error('Error creating transaction:', error);
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
      account_id,
      category_id,
      amount,
      description,
      date,
      type,
      tags = [],
      is_recurring = false,
      recurring_frequency
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    // Obtener la transacción original para revertir el balance
    const originalTransaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    
    if (!originalTransaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Revertir el balance original
    const revertBalanceStmt = db.prepare(`
      UPDATE accounts 
      SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const originalBalanceChange = (originalTransaction as any).type === 'income' ? (originalTransaction as any).amount : -(originalTransaction as any).amount;
    revertBalanceStmt.run(originalBalanceChange, originalTransaction.account_id);

    // Actualizar la transacción
    const updateStmt = db.prepare(`
      UPDATE transactions 
      SET account_id = ?, category_id = ?, amount = ?, description = ?, 
          date = ?, type = ?, tags = ?, is_recurring = ?, 
          recurring_frequency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    updateStmt.run(
      account_id,
      category_id,
      amount,
      description,
      date,
      type,
      JSON.stringify(tags),
      is_recurring,
      recurring_frequency,
      id
    );

    // Aplicar el nuevo balance
    const newBalanceChange = type === 'income' ? amount : -amount;
    const applyBalanceStmt = db.prepare(`
      UPDATE accounts 
      SET balance = balance + ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    applyBalanceStmt.run(newBalanceChange, account_id);

    // Obtener la transacción actualizada
    const updatedTransaction = db.prepare(`
      SELECT t.*, a.name as account_name, c.name as category_name, c.color as category_color
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      JOIN categories c ON t.category_id = c.id
      WHERE t.id = ?
    `).get(id);

    const parsedTransaction = {
      ...(updatedTransaction as any),
      tags: JSON.parse((updatedTransaction as any).tags || '[]')
    };

    return NextResponse.json(parsedTransaction);
  } catch (error) {
    console.error('Error updating transaction:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la transacción' },
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

    // Obtener la transacción para revertir el balance
    const transaction = db.prepare('SELECT * FROM transactions WHERE id = ?').get(id) as any;
    
    if (!transaction) {
      return NextResponse.json(
        { error: 'Transacción no encontrada' },
        { status: 404 }
      );
    }

    // Revertir el balance
    const revertBalanceStmt = db.prepare(`
      UPDATE accounts 
      SET balance = balance - ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);
    
    const balanceChange = (transaction as any).type === 'income' ? (transaction as any).amount : -(transaction as any).amount;
    revertBalanceStmt.run(balanceChange, transaction.account_id);

    // Eliminar la transacción
    const deleteStmt = db.prepare('DELETE FROM transactions WHERE id = ?');
    deleteStmt.run(id);

    return NextResponse.json({ message: 'Transacción eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la transacción' },
      { status: 500 }
    );
  }
}