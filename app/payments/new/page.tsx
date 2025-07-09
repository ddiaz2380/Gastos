'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ArrowLeft, Calendar as CalendarIcon, DollarSign, Clock, Repeat, AlertCircle, CheckCircle2 } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface PaymentForm {
  name: string;
  amount: string;
  category: string;
  description: string;
  dueDate: Date | undefined;
  isRecurring: boolean;
  recurringFrequency: string;
  priority: string;
  reminderDays: string;
}

const categories = [
  'Servicios Públicos',
  'Alquiler',
  'Seguros',
  'Suscripciones',
  'Préstamos',
  'Tarjetas de Crédito',
  'Impuestos',
  'Educación',
  'Salud',
  'Otros'
];

const frequencies = [
  { value: 'monthly', label: 'Mensual' },
  { value: 'quarterly', label: 'Trimestral' },
  { value: 'biannual', label: 'Semestral' },
  { value: 'annual', label: 'Anual' },
  { value: 'weekly', label: 'Semanal' },
  { value: 'biweekly', label: 'Quincenal' }
];

const priorities = [
  { value: 'high', label: 'Alta', color: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' },
  { value: 'medium', label: 'Media', color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' },
  { value: 'low', label: 'Baja', color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' }
];

export default function NewPaymentPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<PaymentForm>({
    name: '',
    amount: '',
    category: '',
    description: '',
    dueDate: undefined,
    isRecurring: false,
    recurringFrequency: 'monthly',
    priority: 'medium',
    reminderDays: '3'
  });

  const handleInputChange = (field: keyof PaymentForm, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateStep1 = () => {
    return formData.name && formData.amount && formData.category && formData.dueDate;
  };

  const handleSubmit = async () => {
    if (!validateStep1()) {
      toast.error('Por favor completa todos los campos requeridos');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          amount: parseFloat(formData.amount),
          category: formData.category,
          description: formData.description,
          due_date: formData.dueDate?.toISOString(),
          is_recurring: formData.isRecurring,
          recurring_frequency: formData.isRecurring ? formData.recurringFrequency : null,
          priority: formData.priority,
          reminder_days: parseInt(formData.reminderDays)
        }),
      });

      if (response.ok) {
        toast.success('Pago programado creado exitosamente');
        router.push('/payments');
      } else {
        toast.error('Error al crear el pago programado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al crear el pago programado');
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step === 1 && validateStep1()) {
      setStep(2);
    } else if (step === 1) {
      toast.error('Por favor completa todos los campos requeridos');
    }
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href="/payments">
          <Button variant="ghost" size="sm">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </Link>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nuevo Pago Programado</h1>
          <p className="text-muted-foreground">
            Configura un nuevo pago recurrente o único
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="flex items-center justify-center space-x-4">
        <div className={`flex items-center space-x-2 ${step >= 1 ? 'text-blue-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 1 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            {step > 1 ? <CheckCircle2 className="h-4 w-4" /> : '1'}
          </div>
          <span className="font-medium">Información Básica</span>
        </div>
        <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-blue-600' : 'bg-muted'}`} />
        <div className={`flex items-center space-x-2 ${step >= 2 ? 'text-blue-600' : 'text-muted-foreground'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
            step >= 2 ? 'bg-blue-600 text-white' : 'bg-muted text-muted-foreground'
          }`}>
            2
          </div>
          <span className="font-medium">Configuración Avanzada</span>
        </div>
      </div>

      {/* Step 1: Basic Information */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Información del Pago
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre del Pago *</Label>
                <Input
                  id="name"
                  placeholder="ej. Factura de Luz"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="amount">Monto *</Label>
                <Input
                  id="amount"
                  type="number"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => handleInputChange('amount', e.target.value)}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>Categoría *</Label>
                <Select value={formData.category} onValueChange={(value) => handleInputChange('category', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category} value={category}>
                        {category}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Fecha de Vencimiento *</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={`w-full justify-start text-left font-normal ${
                        !formData.dueDate && "text-muted-foreground"
                      }`}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formData.dueDate ? (
                        format(formData.dueDate, "PPP", { locale: es })
                      ) : (
                        <span>Selecciona una fecha</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={formData.dueDate}
                      onSelect={(date) => handleInputChange('dueDate', date)}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                placeholder="Descripción adicional del pago..."
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={3}
              />
            </div>

            <div className="flex justify-end">
              <Button onClick={nextStep} disabled={!validateStep1()}>
                Continuar
                <ArrowLeft className="h-4 w-4 ml-2 rotate-180" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Advanced Configuration */}
      {step === 2 && (
        <div className="space-y-6">
          {/* Recurring Payment Settings */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Repeat className="h-5 w-5" />
                Configuración de Recurrencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Pago Recurrente</Label>
                  <p className="text-sm text-muted-foreground">
                    Activar para pagos que se repiten automáticamente
                  </p>
                </div>
                <Switch
                  checked={formData.isRecurring}
                  onCheckedChange={(checked) => handleInputChange('isRecurring', checked)}
                />
              </div>

              {formData.isRecurring && (
                <div className="space-y-2">
                  <Label>Frecuencia</Label>
                  <Select 
                    value={formData.recurringFrequency} 
                    onValueChange={(value) => handleInputChange('recurringFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {frequencies.map((freq) => (
                        <SelectItem key={freq.value} value={freq.value}>
                          {freq.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Priority and Reminders */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Prioridad y Recordatorios
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Prioridad</Label>
                  <Select value={formData.priority} onValueChange={(value) => handleInputChange('priority', value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {priorities.map((priority) => (
                        <SelectItem key={priority.value} value={priority.value}>
                          <div className="flex items-center gap-2">
                            <Badge className={priority.color}>
                              {priority.label}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderDays">Recordar con (días de anticipación)</Label>
                  <Input
                    id="reminderDays"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.reminderDays}
                    onChange={(e) => handleInputChange('reminderDays', e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Summary */}
          <Card>
            <CardHeader>
              <CardTitle>Resumen del Pago</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nombre</p>
                    <p className="font-medium">{formData.name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monto</p>
                    <p className="font-medium text-2xl">${parseFloat(formData.amount || '0').toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{formData.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Vencimiento</p>
                    <p className="font-medium">
                      {formData.dueDate ? format(formData.dueDate, "PPP", { locale: es }) : 'No seleccionada'}
                    </p>
                  </div>
                </div>
                
                {formData.isRecurring && (
                  <div className="pt-4 border-t">
                    <div className="flex items-center gap-2 mb-2">
                      <Repeat className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">Pago Recurrente</span>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Se repetirá {frequencies.find(f => f.value === formData.recurringFrequency)?.label.toLowerCase()}
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-between">
            <Button variant="outline" onClick={prevStep}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Anterior
            </Button>
            <Button onClick={handleSubmit} disabled={loading}>
              {loading ? 'Creando...' : 'Crear Pago Programado'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}