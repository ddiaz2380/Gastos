import { NextRequest, NextResponse } from 'next/server';
import Database from 'better-sqlite3';

const db = new Database('./database.db');

// Initialize settings table if it doesn't exist
db.exec(`
  CREATE TABLE IF NOT EXISTS payment_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id TEXT DEFAULT 'default',
    settings_data TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

interface PaymentSettings {
  notifications: {
    email: boolean;
    push: boolean;
    sms: boolean;
    reminderDays: number;
    overdueAlerts: boolean;
    weeklyDigest: boolean;
  };
  preferences: {
    defaultCategory: string;
    defaultPriority: string;
    autoMarkPaid: boolean;
    currency: string;
    dateFormat: string;
    theme: string;
  };
  automation: {
    autoRecurring: boolean;
    smartReminders: boolean;
    predictiveAnalysis: boolean;
    budgetAlerts: boolean;
  };
  security: {
    requireConfirmation: boolean;
    sessionTimeout: number;
    twoFactorAuth: boolean;
  };
}

const defaultSettings: PaymentSettings = {
  notifications: {
    email: true,
    push: true,
    sms: false,
    reminderDays: 3,
    overdueAlerts: true,
    weeklyDigest: true
  },
  preferences: {
    defaultCategory: 'Servicios Públicos',
    defaultPriority: 'medium',
    autoMarkPaid: false,
    currency: 'USD',
    dateFormat: 'dd/MM/yyyy',
    theme: 'system'
  },
  automation: {
    autoRecurring: true,
    smartReminders: true,
    predictiveAnalysis: false,
    budgetAlerts: true
  },
  security: {
    requireConfirmation: true,
    sessionTimeout: 30,
    twoFactorAuth: false
  }
};

export async function GET(request: NextRequest) {
  try {
    const userId = 'default'; // In a real app, get from authentication

    const stmt = db.prepare('SELECT settings_data FROM payment_settings WHERE user_id = ?');
    const result = stmt.get(userId) as any;

    if (result) {
      const settings = JSON.parse(result.settings_data);
      return NextResponse.json(settings);
    } else {
      // Return default settings if none exist
      return NextResponse.json(defaultSettings);
    }
  } catch (error) {
    console.error('Error fetching payment settings:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const userId = 'default'; // In a real app, get from authentication
    const settings: PaymentSettings = await request.json();

    // Validate settings structure
    if (!settings.notifications || !settings.preferences || !settings.automation || !settings.security) {
      return NextResponse.json(
        { error: 'Estructura de configuración inválida' },
        { status: 400 }
      );
    }

    // Check if settings exist
    const existingStmt = db.prepare('SELECT id FROM payment_settings WHERE user_id = ?');
    const existing = existingStmt.get(userId) as any;

    const settingsJson = JSON.stringify(settings);

    if (existing) {
      // Update existing settings
      const updateStmt = db.prepare(`
        UPDATE payment_settings 
        SET settings_data = ?, updated_at = CURRENT_TIMESTAMP 
        WHERE user_id = ?
      `);
      updateStmt.run(settingsJson, userId);
    } else {
      // Insert new settings
      const insertStmt = db.prepare(`
        INSERT INTO payment_settings (user_id, settings_data) 
        VALUES (?, ?)
      `);
      insertStmt.run(userId, settingsJson);
    }

    return NextResponse.json({ message: 'Configuración guardada exitosamente' });
  } catch (error) {
    console.error('Error saving payment settings:', error);
    return NextResponse.json(
      { error: 'Error al guardar la configuración' },
      { status: 500 }
    );
  }
}