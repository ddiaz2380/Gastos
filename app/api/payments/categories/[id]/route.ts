import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./database.db');

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;

    // Check if category exists
    const categoryStmt = db.prepare('SELECT * FROM payment_categories WHERE id = ?');
    const category = categoryStmt.get(id) as any;

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Check if category is being used by any payments
    const usageStmt = db.prepare('SELECT COUNT(*) as count FROM payments WHERE category = ?');
    const { count } = usageStmt.get(category.name) as { count: number };

    if (count > 0) {
      return NextResponse.json(
        { error: `No se puede eliminar la categoría porque tiene ${count} pagos asociados` },
        { status: 409 }
      );
    }

    // Delete the category
    const deleteStmt = db.prepare('DELETE FROM payment_categories WHERE id = ?');
    deleteStmt.run(id);

    return NextResponse.json({ message: 'Categoría eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting payment category:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la categoría' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Nombre y color son requeridos' },
        { status: 400 }
      );
    }

    // Check if category exists
    const categoryStmt = db.prepare('SELECT * FROM payment_categories WHERE id = ?');
    const category = categoryStmt.get(id) as any;

    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      );
    }

    // Check if another category with the same name exists (excluding current)
    const duplicateStmt = db.prepare('SELECT id FROM payment_categories WHERE name = ? AND id != ?');
    const duplicate = duplicateStmt.get(name, id);

    if (duplicate) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 409 }
      );
    }

    // Update category
    const updateStmt = db.prepare(`
      UPDATE payment_categories 
      SET name = ?, color = ?, updated_at = CURRENT_TIMESTAMP 
      WHERE id = ?
    `);
    
    updateStmt.run(name, color, id);

    // If name changed, update all payments that use this category
    if (category.name !== name) {
      const updatePaymentsStmt = db.prepare(`
        UPDATE payments 
        SET category = ? 
        WHERE category = ?
      `);
      updatePaymentsStmt.run(name, category.name);
    }

    // Return updated category
    const updatedCategory = {
      id,
      name,
      color,
      created_at: category.created_at,
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(updatedCategory);
  } catch (error) {
    console.error('Error updating payment category:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la categoría' },
      { status: 500 }
    );
  }
}