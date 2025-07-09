import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/database';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;

    // Get account details
    const account = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);

    if (!account) {
      return NextResponse.json(
        { error: 'Account not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching account details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;
    const body = await request.json();
    const { name, type, currency, is_active } = body;

    // Update account
    db.prepare('UPDATE accounts SET name = ?, type = ?, currency = ?, is_active = ? WHERE id = ?')
      .run(name, type, currency, is_active, accountId);

    // Get updated account
    const updatedAccount = db.prepare('SELECT * FROM accounts WHERE id = ?').get(accountId);

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: accountId } = await params;

    // Check if account has transactions
    const transactionCount = db.prepare('SELECT COUNT(*) as count FROM transactions WHERE account_id = ?')
      .get(accountId) as { count: number };

    if (transactionCount.count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete account with existing transactions' },
        { status: 400 }
      );
    }

    // Delete account
    db.prepare('DELETE FROM accounts WHERE id = ?').run(accountId);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting account:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}