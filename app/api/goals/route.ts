import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const currency = searchParams.get('currency');
    const status = searchParams.get('status');
    const priority = searchParams.get('priority');
    
    let goals;
    
    if (currency && CURRENCIES[currency as keyof typeof CURRENCIES]) {
      goals = dbQueries.getGoalsByCurrency.all(currency);
    } else if (status && ['active', 'completed', 'paused', 'cancelled'].includes(status)) {
      goals = dbQueries.getGoalsByStatus.all(status);
    } else {
      goals = dbQueries.getAllGoals.all();
    }
    
    // Filtrar por prioridad si se especifica
    if (priority && ['high', 'medium', 'low'].includes(priority)) {
      goals = goals.filter((g: any) => g.priority === priority);
    }
    
    // Calcular el progreso para cada meta
    const goalsWithProgress = goals.map((goal: any) => {
      const progress = goal.target_amount > 0 ? (goal.current_amount / goal.target_amount) * 100 : 0;
      const remaining = Math.max(goal.target_amount - goal.current_amount, 0);
      
      // Calcular días restantes
      const today = new Date();
      const targetDate = new Date(goal.target_date);
      const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
      
      // Determinar estado basado en progreso y tiempo
      let goalStatus = goal.status;
      if (goalStatus === 'active') {
        if (progress >= 100) {
          goalStatus = 'completed';
        } else if (daysRemaining < 0) {
          goalStatus = 'overdue';
        } else if (progress >= 75) {
          goalStatus = 'on_track';
        } else if (daysRemaining <= 30 && progress < 50) {
          goalStatus = 'at_risk';
        } else {
          goalStatus = 'behind';
        }
      }
      
      return {
        ...goal,
        progress: Math.min(progress, 100),
        remaining,
        days_remaining: daysRemaining,
        status: goalStatus,
        formatted_target_amount: formatCurrency(goal.target_amount, goal.currency),
        formatted_current_amount: formatCurrency(goal.current_amount, goal.currency),
        formatted_remaining: formatCurrency(remaining, goal.currency)
      };
    });
    
    return NextResponse.json(goalsWithProgress);
  } catch (error) {
    console.error('Error fetching goals:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, target_amount, currency, target_date, priority, category } = body;
    
    // Validaciones básicas
    if (!name || !target_amount || !currency || !target_date) {
      return NextResponse.json(
        { error: 'Nombre, monto objetivo, moneda y fecha objetivo son requeridos' },
        { status: 400 }
      );
    }
    
    if (typeof target_amount !== 'number' || target_amount <= 0) {
      return NextResponse.json(
        { error: 'El monto objetivo debe ser un número positivo' },
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
    
    // Validar fecha objetivo
    const targetDate = new Date(target_date);
    if (isNaN(targetDate.getTime())) {
      return NextResponse.json(
        { error: 'La fecha objetivo no es válida' },
        { status: 400 }
      );
    }
    
    const today = new Date();
    if (targetDate <= today) {
      return NextResponse.json(
        { error: 'La fecha objetivo debe ser futura' },
        { status: 400 }
      );
    }
    
    // Validar prioridad
    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return NextResponse.json(
        { error: 'La prioridad debe ser "high", "medium" o "low"' },
        { status: 400 }
      );
    }
    
    // Validar categoría
    if (category && !['savings', 'investment', 'debt_payment', 'purchase', 'emergency_fund', 'other'].includes(category)) {
      return NextResponse.json(
        { error: 'La categoría especificada no es válida' },
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
    
    // Verificar si ya existe una meta con el mismo nombre
    const existingGoal = db.prepare(`
      SELECT id FROM goals 
      WHERE name = ? AND status != 'cancelled'
    `).get(name);
    
    if (existingGoal) {
      return NextResponse.json(
        { error: 'Ya existe una meta activa con este nombre' },
        { status: 400 }
      );
    }
    
    const goalId = uuidv4();
    
    // Insertar la meta
    db.prepare(`
      INSERT INTO goals (id, name, description, target_amount, currency, current_amount, target_date, priority, category, status, created_at)
      VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?, 'active', datetime('now'))
    `).run(
      goalId, 
      name, 
      description || null, 
      target_amount, 
      currency,
      target_date, 
      priority || 'medium',
      category || 'other'
    );
    
    // Obtener la meta creada
    const createdGoal = dbQueries.getGoalById.get(goalId);
    
    if (!createdGoal) {
      throw new Error('No se pudo recuperar la meta creada');
    }
    
    const progress = (createdGoal as any).target_amount > 0 ? ((createdGoal as any).current_amount / (createdGoal as any).target_amount) * 100 : 0;
    const remaining = Math.max((createdGoal as any).target_amount - (createdGoal as any).current_amount, 0);
    
    // Calcular días restantes
    const daysRemaining = Math.ceil((targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    const goalWithProgress = {
      ...createdGoal,
      progress: Math.min(progress, 100),
      remaining,
      days_remaining: daysRemaining,
      status: 'active',
      formatted_target_amount: formatCurrency((createdGoal as any).target_amount, (createdGoal as any).currency),
      formatted_current_amount: formatCurrency((createdGoal as any).current_amount, (createdGoal as any).currency),
      formatted_remaining: formatCurrency(remaining, (createdGoal as any).currency)
    };
    
    return NextResponse.json(goalWithProgress, { status: 201 });
  } catch (error) {
    console.error('Error creating goal:', error);
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
      description,
      target_amount,
      current_amount,
      target_date,
      category,
      priority,
      status
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    if (priority && !['high', 'medium', 'low'].includes(priority)) {
      return NextResponse.json(
        { error: 'Prioridad debe ser "high", "medium" o "low"' },
        { status: 400 }
      );
    }

    if (status && !['active', 'completed', 'paused'].includes(status)) {
      return NextResponse.json(
        { error: 'Estado debe ser "active", "completed" o "paused"' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE goals 
      SET title = ?, description = ?, target_amount = ?, current_amount = ?,
          target_date = ?, category = ?, priority = ?, status = ?,
          updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(
      title,
      description,
      target_amount,
      current_amount,
      target_date,
      category,
      priority,
      status,
      id
    );

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Meta no encontrada' },
        { status: 404 }
      );
    }

    const updatedGoal = db.prepare('SELECT * FROM goals WHERE id = ?').get(id);
    return NextResponse.json(updatedGoal);
  } catch (error) {
    console.error('Error updating goal:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la meta' },
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

    const stmt = db.prepare('DELETE FROM goals WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Meta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Meta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting goal:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la meta' },
      { status: 500 }
    );
  }
}