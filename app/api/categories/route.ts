import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let categories;
    
    if (type && ['income', 'expense'].includes(type)) {
      categories = dbQueries.getCategoriesByType.all(type);
    } else {
      categories = dbQueries.getAllCategories.all();
    }
    
    // Filtrar categorías inactivas si no se solicita incluirlas
    if (!includeInactive) {
      categories = categories.filter((category: any) => category.is_active);
    }
    
    // Agregar estadísticas de uso para cada categoría
    const categoriesWithStats = categories.map((category: any) => {
      // Contar transacciones de esta categoría en el mes actual
      const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM
      const monthlyTransactions = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions 
        WHERE category_id = ? AND date LIKE ?
      `).get(category.id, `${currentMonth}%`);
      
      // Contar transacciones totales
      const totalTransactions = db.prepare(`
        SELECT COUNT(*) as count, COALESCE(SUM(amount), 0) as total
        FROM transactions 
        WHERE category_id = ?
      `).get(category.id);
      
      return {
        ...category,
        monthly_transactions: (monthlyTransactions as any).count,
        monthly_total: (monthlyTransactions as any).total,
        total_transactions: (totalTransactions as any).count,
        total_amount: (totalTransactions as any).total
      };
    });
    
    return NextResponse.json(categoriesWithStats);
  } catch (error) {
    console.error('Error fetching categories:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, color, icon, description } = body;
    
    // Validaciones básicas
    if (!name || !type) {
      return NextResponse.json(
        { error: 'Nombre y tipo son requeridos' },
        { status: 400 }
      );
    }
    
    if (!['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'El tipo debe ser income o expense' },
        { status: 400 }
      );
    }
    
    // Validar nombre
    if (name.length > 100) {
      return NextResponse.json(
        { error: 'El nombre no puede exceder 100 caracteres' },
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
    
    // Validar color (formato hexadecimal)
    if (color && !/^#[0-9A-F]{6}$/i.test(color)) {
      return NextResponse.json(
        { error: 'El color debe estar en formato hexadecimal (#RRGGBB)' },
        { status: 400 }
      );
    }
    

    
    // Verificar que no exista una categoría activa con el mismo nombre y tipo
    const existingCategory = db.prepare(`
      SELECT id FROM categories 
      WHERE name = ? AND type = ? AND is_active = 1
    `).get(name, type);
    
    if (existingCategory) {
      return NextResponse.json(
        { error: `Ya existe una categoría activa de tipo ${type} con el nombre "${name}"` },
        { status: 400 }
      );
    }
    
    const categoryId = uuidv4();
    
    // Insertar la categoría
    db.prepare(`
      INSERT INTO categories (
        id, name, type, icon, color, description, 
        is_active, created_at
      )
      VALUES (?, ?, ?, ?, ?, ?, 1, datetime('now'))
    `).run(
      categoryId, 
      name, 
      type, 
      icon || null, 
      color || null, 
      description || null
    );
    
    // Obtener la categoría creada
    const createdCategory = dbQueries.getCategoryById.get(categoryId);
    
    if (!createdCategory) {
      throw new Error('No se pudo recuperar la categoría creada');
    }
    
    // Agregar estadísticas iniciales
    const categoryWithStats = {
      ...createdCategory,
      monthly_transactions: 0,
      monthly_total: 0,
      total_transactions: 0,
      total_amount: 0
    };
    
    return NextResponse.json(categoryWithStats, { status: 201 });
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, color, icon } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    if (type && !['income', 'expense'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo debe ser "income" o "expense"' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE categories 
      SET name = ?, type = ?, color = ?, icon = ?
      WHERE id = ?
    `);

    const result = stmt.run(name, type, color, icon, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    const updatedCategory = db.prepare('SELECT * FROM categories WHERE id = ?').get(id);
    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating category:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
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

    // Verificar si la categoría tiene transacciones asociadas
    const transactionCount = db.prepare(
      'SELECT COUNT(*) as count FROM transactions WHERE category_id = ?'
    ).get(id) as { count: number };

    if (transactionCount.count > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría que tiene transacciones asociadas' },
        { status: 400 }
      );
    }

    const stmt = db.prepare('DELETE FROM categories WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting category:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}