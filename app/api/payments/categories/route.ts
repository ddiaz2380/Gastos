import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./database.db');

// Initialize categories table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS payment_categories (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    color TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Insert default categories if table is empty
const defaultCategories = [
  { id: 'servicios-publicos', name: 'Servicios Públicos', color: '#3b82f6' },
  { id: 'alquiler', name: 'Alquiler', color: '#ef4444' },
  { id: 'seguros', name: 'Seguros', color: '#10b981' },
  { id: 'suscripciones', name: 'Suscripciones', color: '#f59e0b' },
  { id: 'otros', name: 'Otros', color: '#6b7280' }
];

// Check if categories exist, if not, insert defaults
const countStmt = db.prepare('SELECT COUNT(*) as count FROM payment_categories');
const { count } = countStmt.get() as { count: number };

if (count === 0) {
  const insertStmt = db.prepare(`
    INSERT INTO payment_categories (id, name, color) 
    VALUES (?, ?, ?)
  `);
  
  for (const category of defaultCategories) {
    insertStmt.run(category.id, category.name, category.color);
  }
}

export async function GET(request: NextRequest) {
  try {
    const stmt = db.prepare(`
      SELECT 
        pc.*,
        COUNT(p.id) as count
      FROM payment_categories pc
      LEFT JOIN payments p ON p.category = pc.name
      GROUP BY pc.id, pc.name, pc.color, pc.created_at, pc.updated_at
      ORDER BY pc.name
    `);
    
    const categories = stmt.all();
    return NextResponse.json(categories);
  } catch (error) {
    console.error('Error fetching payment categories:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { name, color } = await request.json();

    if (!name || !color) {
      return NextResponse.json(
        { error: 'Nombre y color son requeridos' },
        { status: 400 }
      );
    }

    // Generate ID from name
    const id = name.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .substring(0, 50);

    // Check if category already exists
    const existingStmt = db.prepare('SELECT id FROM payment_categories WHERE name = ? OR id = ?');
    const existing = existingStmt.get(name, id);

    if (existing) {
      return NextResponse.json(
        { error: 'Ya existe una categoría con ese nombre' },
        { status: 409 }
      );
    }

    // Insert new category
    const insertStmt = db.prepare(`
      INSERT INTO payment_categories (id, name, color) 
      VALUES (?, ?, ?)
    `);
    
    insertStmt.run(id, name, color);

    // Return the created category
    const newCategory = {
      id,
      name,
      color,
      count: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    return NextResponse.json(newCategory, { status: 201 });
  } catch (error) {
    console.error('Error creating payment category:', error);
    return NextResponse.json(
      { error: 'Error al crear la categoría' },
      { status: 500 }
    );
  }
}