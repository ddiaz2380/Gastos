import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');
    
    let budgets;
    
    if (currency && CURRENCIES[currency as keyof typeof CURRENCIES]) {
      budgets = dbQueries.getBudgetsByCurrency.all(currency);
    } else {
      budgets = dbQueries.getAllBudgets.all();
    }
    
    // Calcular el gasto actual para cada presupuesto
    const budgetsWithSpent = budgets.map((budget: any) => {
      const spent = db.prepare(`
        SELECT COALESCE(SUM(ABS(t.amount)), 0) as total
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        WHERE t.category_id = ? 
        AND t.type = 'expense'
        AND a.currency = ?
        AND t.date >= ?
        AND (? IS NULL OR t.date <= ?)
      `).get(
        budget.category_id,
        budget.currency,
        budget.start_date,
        budget.end_date,
        budget.end_date
      ) as { total: number };
      
      const remaining = budget.amount - spent.total;
      const percentage = budget.amount > 0 ? (spent.total / budget.amount) * 100 : 0;
      const alertPercentage = budget.alert_threshold || 80;
      
      let budgetStatus = 'good';
      if (percentage >= 100) {
        budgetStatus = 'exceeded';
      } else if (percentage >= alertPercentage) {
        budgetStatus = 'warning';
      }
      
      return {
        ...budget,
        spent: spent.total,
        remaining: Math.max(remaining, 0),
        percentage: Math.min(percentage, 100),
        status: budgetStatus,
        formatted_amount: formatCurrency(budget.amount, budget.currency),
        formatted_spent: formatCurrency(spent.total, budget.currency),
        formatted_remaining: formatCurrency(Math.max(remaining, 0), budget.currency)
      };
    });
    
    // Filtrar por estado si se especifica
    let filteredBudgets = budgetsWithSpent;
    if (status && ['good', 'warning', 'exceeded'].includes(status)) {
      filteredBudgets = budgetsWithSpent.filter((b: any) => b.status === status);
    }
    
    return NextResponse.json(filteredBudgets);
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { category_id, amount, currency, start_date, end_date, alert_threshold, description } = body;
    
    // Validaciones básicas
    if (!category_id || !amount || !currency || !start_date) {
      return NextResponse.json(
        { error: 'Categoría, monto, moneda y fecha de inicio son requeridos' },
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
    
    // Validar fechas
    const startDate = new Date(start_date);
    if (isNaN(startDate.getTime())) {
      return NextResponse.json(
        { error: 'La fecha de inicio no es válida' },
        { status: 400 }
      );
    }
    
    if (end_date) {
      const endDate = new Date(end_date);
      if (isNaN(endDate.getTime())) {
        return NextResponse.json(
          { error: 'La fecha de fin no es válida' },
          { status: 400 }
        );
      }
      
      if (endDate <= startDate) {
        return NextResponse.json(
          { error: 'La fecha de fin debe ser posterior a la fecha de inicio' },
          { status: 400 }
        );
      }
    }
    
    // Validar umbral de alerta
    if (alert_threshold !== undefined && (typeof alert_threshold !== 'number' || alert_threshold < 0 || alert_threshold > 100)) {
      return NextResponse.json(
        { error: 'El umbral de alerta debe ser un número entre 0 y 100' },
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
    
    // Verificar que la categoría es de tipo gasto
    if ((category as any).type !== 'expense') {
      return NextResponse.json(
        { error: 'Solo se pueden crear presupuestos para categorías de gastos' },
        { status: 400 }
      );
    }
    
    // Verificar si ya existe un presupuesto activo para esta categoría y moneda en el período
    const existingBudget = db.prepare(`
      SELECT id FROM budgets 
      WHERE category_id = ? 
      AND currency = ?
      AND is_active = TRUE
      AND start_date <= ?
      AND (end_date IS NULL OR end_date >= ?)
    `).get(category_id, currency, end_date || '9999-12-31', start_date);
    
    if (existingBudget) {
      return NextResponse.json(
        { error: 'Ya existe un presupuesto activo para esta categoría y moneda en el período especificado' },
        { status: 400 }
      );
    }
    
    // Validar descripción
    if (description && description.length > 500) {
      return NextResponse.json(
        { error: 'La descripción no puede exceder 500 caracteres' },
        { status: 400 }
      );
    }
    
    const budgetId = uuidv4();
    
    // Insertar el presupuesto
    db.prepare(`
      INSERT INTO budgets (id, category_id, amount, currency, start_date, end_date, alert_threshold, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      budgetId, 
      category_id, 
      amount, 
      currency, 
      start_date, 
      end_date || null, 
      alert_threshold || 80,
      description || null
    );
    
    // Obtener el presupuesto creado con información completa
    const createdBudget = dbQueries.getBudgetById.get(budgetId);
    
    if (!createdBudget) {
      throw new Error('No se pudo recuperar el presupuesto creado');
    }
    
    // Calcular el gasto actual
    const spent = db.prepare(`
      SELECT COALESCE(SUM(ABS(t.amount)), 0) as total
      FROM transactions t
      JOIN accounts a ON t.account_id = a.id
      WHERE t.category_id = ? 
      AND t.type = 'expense'
      AND a.currency = ?
      AND t.date >= ?
      AND (? IS NULL OR t.date <= ?)
    `).get(
      (createdBudget as any).category_id,
      (createdBudget as any).currency,
      (createdBudget as any).start_date,
      (createdBudget as any).end_date,
      (createdBudget as any).end_date
    ) as { total: number };
    
    const remaining = (createdBudget as any).amount - spent.total;
    const percentage = (createdBudget as any).amount > 0 ? (spent.total / (createdBudget as any).amount) * 100 : 0;
    const alertPercentage = (createdBudget as any).alert_threshold || 80;
    
    let budgetStatus = 'good';
    if (percentage >= 100) {
      budgetStatus = 'exceeded';
    } else if (percentage >= alertPercentage) {
      budgetStatus = 'warning';
    }
    
    const budgetWithSpent = {
      ...createdBudget,
      spent: spent.total,
      remaining: Math.max(remaining, 0),
      percentage: Math.min(percentage, 100),
      status: budgetStatus,
      formatted_amount: formatCurrency((createdBudget as any).amount, (createdBudget as any).currency),
      formatted_spent: formatCurrency(spent.total, (createdBudget as any).currency),
      formatted_remaining: formatCurrency(Math.max(remaining, 0), (createdBudget as any).currency)
    };
    
    return NextResponse.json(budgetWithSpent, { status: 201 });
  } catch (error) {
    console.error('Error creating budget:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, category_id, amount, period, start_date, end_date } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE budgets 
      SET category_id = ?, amount = ?, period = ?, start_date = ?, 
          end_date = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(category_id, amount, period, start_date, end_date, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    const updatedBudget = db.prepare(`
      SELECT b.*, c.name as category_name, c.color as category_color
      FROM budgets b
      JOIN categories c ON b.category_id = c.id
      WHERE b.id = ?
    `).get(id);

    return NextResponse.json(updatedBudget);
  } catch (error) {
    console.error('Error updating budget:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el presupuesto' },
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

    const stmt = db.prepare('DELETE FROM budgets WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Presupuesto no encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Presupuesto eliminado exitosamente' });
  } catch (error) {
    console.error('Error deleting budget:', error);
    return NextResponse.json(
      { error: 'Error al eliminar el presupuesto' },
      { status: 500 }
    );
  }
}