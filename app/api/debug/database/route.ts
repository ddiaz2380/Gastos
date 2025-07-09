import { NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET() {
  try {
    // Verificar estado de las tablas
    const tables = db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all();
    
    const status = {
      database: 'connected',
      tables: tables.map((t: any) => t.name),
      counts: {} as any,
      sampleData: {} as any
    };

    // Contar registros en cada tabla principal
    const mainTables = ['accounts', 'categories', 'transactions', 'budgets', 'goals'];
    
    for (const table of mainTables) {
      try {
        const count = db.prepare(`SELECT COUNT(*) as count FROM ${table}`).get() as any;
        status.counts[table] = count.count;
        
        // Obtener datos de muestra
        const sample = db.prepare(`SELECT * FROM ${table} LIMIT 2`).all();
        status.sampleData[table] = sample;
      } catch (error) {
        status.counts[table] = `Error: ${(error as Error).message}`;
      }
    }

    return NextResponse.json(status);
  } catch (error) {
    return NextResponse.json(
      { error: 'Error verificando base de datos', details: (error as Error).message },
      { status: 500 }
    );
  }
}
