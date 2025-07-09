import { NextRequest, NextResponse } from 'next/server';
import db, { dbQueries } from '@/lib/database';
import { formatCurrency, CURRENCIES } from '@/lib/currency';
import { v4 as uuidv4 } from 'uuid';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const currency = searchParams.get('currency');
    const includeInactive = searchParams.get('includeInactive') === 'true';
    
    let accounts;
    
    if (type && ['checking', 'savings', 'credit', 'investment', 'cash'].includes(type)) {
      accounts = dbQueries.getAccountsByType.all(type);
    } else if (currency && CURRENCIES[currency as keyof typeof CURRENCIES]) {
      accounts = dbQueries.getAccountsByCurrency.all(currency);
    } else {
      accounts = dbQueries.getAllAccounts.all();
    }
    
    // Incluir cuentas inactivas si se solicita
    if (includeInactive) {
      const query = type ? 
        'SELECT * FROM accounts WHERE type = ? ORDER BY name' :
        currency ? 
        'SELECT * FROM accounts WHERE currency = ? ORDER BY name' :
        'SELECT * FROM accounts ORDER BY name';
      
      const params = type ? [type] : currency ? [currency] : [];
      accounts = db.prepare(query).all(...params);
    }
    
    // Formatear cuentas con información de moneda
    const formattedAccounts = accounts.map((account: any) => ({
      ...account,
      formatted_balance: formatCurrency(account.balance, account.currency),
      currency_info: CURRENCIES[account.currency as keyof typeof CURRENCIES]
    }));
    
    return NextResponse.json(formattedAccounts);
  } catch (error) {
    console.error('Error fetching accounts:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, type, currency, balance, description } = body;
    
    // Validaciones básicas
    if (!name || !type || !currency || balance === undefined) {
      return NextResponse.json(
        { error: 'Nombre, tipo, moneda y balance son requeridos' },
        { status: 400 }
      );
    }
    
    if (typeof balance !== 'number') {
      return NextResponse.json(
        { error: 'El balance debe ser un número' },
        { status: 400 }
      );
    }
    
    // Validar tipo de cuenta
    if (!['checking', 'savings', 'credit', 'investment', 'cash'].includes(type)) {
      return NextResponse.json(
        { error: 'Tipo de cuenta no válido. Debe ser: checking, savings, credit, investment o cash' },
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
    

    
    // Verificar si ya existe una cuenta con el mismo nombre
    const existingAccount = db.prepare(`
      SELECT id FROM accounts 
      WHERE name = ? AND is_active = TRUE
    `).get(name);
    
    if (existingAccount) {
      return NextResponse.json(
        { error: 'Ya existe una cuenta activa con este nombre' },
        { status: 400 }
      );
    }
    
    // Validaciones específicas por tipo de cuenta
    if (type === 'credit' && balance > 0) {
      return NextResponse.json(
        { error: 'Las cuentas de crédito no pueden tener balance positivo inicial' },
        { status: 400 }
      );
    }
    
    const accountId = uuidv4();
    
    // Insertar la cuenta
    db.prepare(`
      INSERT INTO accounts (id, name, type, currency, balance, description, created_at)
      VALUES (?, ?, ?, ?, ?, ?, datetime('now'))
    `).run(
      accountId, 
      name, 
      type, 
      currency, 
      balance, 
      description || null
    );
    
    // Obtener la cuenta creada
    const createdAccount = dbQueries.getAccountById.get(accountId);
    
    if (!createdAccount) {
      throw new Error('No se pudo recuperar la cuenta creada');
    }
    
    const formattedAccount = {
      ...createdAccount,
      formatted_balance: formatCurrency((createdAccount as any).balance, (createdAccount as any).currency),
      currency_info: CURRENCIES[(createdAccount as any).currency as keyof typeof CURRENCIES]
    };
    
    return NextResponse.json(formattedAccount, { status: 201 });
  } catch (error) {
    console.error('Error creating account:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, name, type, balance, currency } = body;

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    const stmt = db.prepare(`
      UPDATE accounts 
      SET name = ?, type = ?, balance = ?, currency = ?, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `);

    const result = stmt.run(name, type, balance, currency, id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    const updatedAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(id);
    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la cuenta' },
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

    const stmt = db.prepare('DELETE FROM accounts WHERE id = ?');
    const result = stmt.run(id);

    if (result.changes === 0) {
      return NextResponse.json(
        { error: 'Cuenta no encontrada' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Cuenta eliminada exitosamente' });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la cuenta' },
      { status: 500 }
    );
  }
}