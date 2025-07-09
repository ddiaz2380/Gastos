'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowLeft, 
  Bell, 
  Mail, 
  Smartphone, 
  Calendar, 
  DollarSign,
  Shield,
  Palette,
  Globe,
  Download,
  Upload,
  Trash2,
  Save,
  Settings,
  CreditCard,
  Clock,
  Target,
  Zap
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

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

interface PaymentCategory {
  id: string;
  name: string;
  color: string;
  count: number;
}

export default function PaymentSettingsPage() {
  const [settings, setSettings] = useState<PaymentSettings>({
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
  });
  
  const [categories, setCategories] = useState<PaymentCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState('#3b82f6');

  useEffect(() => {
    fetchSettings();
    fetchCategories();
  }, []);

  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/payments/settings');
      if (response.ok) {
        const data = await response.json();
        setSettings(data);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/payments/categories');
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/payments/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast.success('Configuración guardada exitosamente');
      } else {
        toast.error('Error al guardar la configuración');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al guardar la configuración');
    } finally {
      setSaving(false);
    }
  };

  const addCategory = async () => {
    if (!newCategoryName.trim()) {
      toast.error('El nombre de la categoría es requerido');
      return;
    }

    try {
      const response = await fetch('/api/payments/categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: newCategoryName,
          color: newCategoryColor
        }),
      });

      if (response.ok) {
        const newCategory = await response.json();
        setCategories([...categories, newCategory]);
        setNewCategoryName('');
        setNewCategoryColor('#3b82f6');
        toast.success('Categoría creada exitosamente');
      } else {
        toast.error('Error al crear la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear la categoría');
    }
  };

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch(`/api/payments/categories/${categoryId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setCategories(categories.filter(cat => cat.id !== categoryId));
        toast.success('Categoría eliminada exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al eliminar la categoría');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar la categoría');
    }
  };

  const exportData = async () => {
    try {
      const response = await fetch('/api/payments/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ format: 'json', includeSettings: true }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `payments-backup-${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        toast.success('Datos exportados exitosamente');
      } else {
        toast.error('Error al exportar los datos');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al exportar los datos');
    }
  };

  const updateNotificationSetting = (key: keyof typeof settings.notifications, value: any) => {
    setSettings(prev => ({
      ...prev,
      notifications: {
        ...prev.notifications,
        [key]: value
      }
    }));
  };

  const updatePreferenceSetting = (key: keyof typeof settings.preferences, value: any) => {
    setSettings(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        [key]: value
      }
    }));
  };

  const updateAutomationSetting = (key: keyof typeof settings.automation, value: any) => {
    setSettings(prev => ({
      ...prev,
      automation: {
        ...prev.automation,
        [key]: value
      }
    }));
  };

  const updateSecuritySetting = (key: keyof typeof settings.security, value: any) => {
    setSettings(prev => ({
      ...prev,
      security: {
        ...prev.security,
        [key]: value
      }
    }));
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/payments">
            <Button variant="ghost" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Volver
            </Button>
          </Link>
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Configuración de Pagos</h1>
            <p className="text-muted-foreground">
              Personaliza tu experiencia de gestión de pagos
            </p>
          </div>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Save className="h-4 w-4 mr-2" />
          {saving ? 'Guardando...' : 'Guardar Cambios'}
        </Button>
      </div>

      <Tabs defaultValue="notifications" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="preferences">Preferencias</TabsTrigger>
          <TabsTrigger value="automation">Automatización</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        <TabsContent value="notifications" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5" />
                Configuración de Notificaciones
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      Notificaciones por Email
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe recordatorios y alertas por correo electrónico
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.email}
                    onCheckedChange={(checked) => updateNotificationSetting('email', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Bell className="h-4 w-4" />
                      Notificaciones Push
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe notificaciones en tiempo real en tu navegador
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.push}
                    onCheckedChange={(checked) => updateNotificationSetting('push', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      Notificaciones SMS
                    </Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe alertas importantes por mensaje de texto
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.sms}
                    onCheckedChange={(checked) => updateNotificationSetting('sms', checked)}
                  />
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label>Días de Recordatorio</Label>
                  <Select 
                    value={settings.notifications.reminderDays.toString()} 
                    onValueChange={(value) => updateNotificationSetting('reminderDays', parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 día antes</SelectItem>
                      <SelectItem value="3">3 días antes</SelectItem>
                      <SelectItem value="5">5 días antes</SelectItem>
                      <SelectItem value="7">7 días antes</SelectItem>
                      <SelectItem value="14">14 días antes</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    Cuándo recibir recordatorios antes del vencimiento
                  </p>
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Vencimiento</Label>
                    <p className="text-sm text-muted-foreground">
                      Notificaciones cuando un pago está vencido
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.overdueAlerts}
                    onCheckedChange={(checked) => updateNotificationSetting('overdueAlerts', checked)}
                  />
                </div>

                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Resumen Semanal</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibe un resumen de tus pagos cada semana
                    </p>
                  </div>
                  <Switch
                    checked={settings.notifications.weeklyDigest}
                    onCheckedChange={(checked) => updateNotificationSetting('weeklyDigest', checked)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="preferences" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Preferencias Generales
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Categoría por Defecto</Label>
                  <Select 
                    value={settings.preferences.defaultCategory} 
                    onValueChange={(value) => updatePreferenceSetting('defaultCategory', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Servicios Públicos">Servicios Públicos</SelectItem>
                      <SelectItem value="Alquiler">Alquiler</SelectItem>
                      <SelectItem value="Seguros">Seguros</SelectItem>
                      <SelectItem value="Suscripciones">Suscripciones</SelectItem>
                      <SelectItem value="Otros">Otros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Prioridad por Defecto</Label>
                  <Select 
                    value={settings.preferences.defaultPriority} 
                    onValueChange={(value) => updatePreferenceSetting('defaultPriority', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Baja</SelectItem>
                      <SelectItem value="medium">Media</SelectItem>
                      <SelectItem value="high">Alta</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select 
                    value={settings.preferences.currency} 
                    onValueChange={(value) => updatePreferenceSetting('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD ($)</SelectItem>
                      <SelectItem value="EUR">EUR (€)</SelectItem>
                      <SelectItem value="GBP">GBP (£)</SelectItem>
                      <SelectItem value="ARS">ARS ($)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato de Fecha</Label>
                  <Select 
                    value={settings.preferences.dateFormat} 
                    onValueChange={(value) => updatePreferenceSetting('dateFormat', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dd/MM/yyyy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="MM/dd/yyyy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="yyyy-MM-dd">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Marcar como Pagado Automáticamente</Label>
                  <p className="text-sm text-muted-foreground">
                    Marcar pagos recurrentes como pagados en la fecha de vencimiento
                  </p>
                </div>
                <Switch
                  checked={settings.preferences.autoMarkPaid}
                  onCheckedChange={(checked) => updatePreferenceSetting('autoMarkPaid', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tema</Label>
                <Select 
                  value={settings.preferences.theme} 
                  onValueChange={(value) => updatePreferenceSetting('theme', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Claro</SelectItem>
                    <SelectItem value="dark">Oscuro</SelectItem>
                    <SelectItem value="system">Sistema</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Zap className="h-5 w-5" />
                Automatización Inteligente
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Pagos Recurrentes Automáticos</Label>
                  <p className="text-sm text-muted-foreground">
                    Crear automáticamente el siguiente pago cuando se marca uno como pagado
                  </p>
                </div>
                <Switch
                  checked={settings.automation.autoRecurring}
                  onCheckedChange={(checked) => updateAutomationSetting('autoRecurring', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Recordatorios Inteligentes</Label>
                  <p className="text-sm text-muted-foreground">
                    Ajustar automáticamente los recordatorios basados en tu historial de pagos
                  </p>
                </div>
                <Switch
                  checked={settings.automation.smartReminders}
                  onCheckedChange={(checked) => updateAutomationSetting('smartReminders', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Análisis Predictivo</Label>
                  <p className="text-sm text-muted-foreground">
                    Predecir patrones de gasto y sugerir optimizaciones
                  </p>
                </div>
                <Switch
                  checked={settings.automation.predictiveAnalysis}
                  onCheckedChange={(checked) => updateAutomationSetting('predictiveAnalysis', checked)}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Alertas de Presupuesto</Label>
                  <p className="text-sm text-muted-foreground">
                    Notificar cuando los pagos excedan límites de presupuesto
                  </p>
                </div>
                <Switch
                  checked={settings.automation.budgetAlerts}
                  onCheckedChange={(checked) => updateAutomationSetting('budgetAlerts', checked)}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Gestión de Categorías</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-1">
                  <Input
                    placeholder="Nombre de la nueva categoría"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                  />
                </div>
                <div className="w-20">
                  <Input
                    type="color"
                    value={newCategoryColor}
                    onChange={(e) => setNewCategoryColor(e.target.value)}
                  />
                </div>
                <Button onClick={addCategory}>
                  Agregar
                </Button>
              </div>

              <div className="grid gap-4">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-4 h-4 rounded-full" 
                        style={{ backgroundColor: category.color }}
                      />
                      <div>
                        <p className="font-medium">{category.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {category.count} pagos
                        </p>
                      </div>
                    </div>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      onClick={() => deleteCategory(category.id)}
                      disabled={category.count > 0}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Configuración de Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Requerir Confirmación</Label>
                  <p className="text-sm text-muted-foreground">
                    Solicitar confirmación antes de marcar pagos como completados
                  </p>
                </div>
                <Switch
                  checked={settings.security.requireConfirmation}
                  onCheckedChange={(checked) => updateSecuritySetting('requireConfirmation', checked)}
                />
              </div>

              <div className="space-y-2">
                <Label>Tiempo de Sesión (minutos)</Label>
                <Select 
                  value={settings.security.sessionTimeout.toString()} 
                  onValueChange={(value) => updateSecuritySetting('sessionTimeout', parseInt(value))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                    <SelectItem value="0">Sin límite</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores</Label>
                  <p className="text-sm text-muted-foreground">
                    Agregar una capa extra de seguridad a tu cuenta
                  </p>
                </div>
                <Switch
                  checked={settings.security.twoFactorAuth}
                  onCheckedChange={(checked) => updateSecuritySetting('twoFactorAuth', checked)}
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="font-medium">Gestión de Datos</h4>
                <div className="flex gap-4">
                  <Button variant="outline" onClick={exportData}>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Datos
                  </Button>
                  <Button variant="outline">
                    <Upload className="h-4 w-4 mr-2" />
                    Importar Datos
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}