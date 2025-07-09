'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Clock, 
  Repeat, 
  AlertTriangle, 
  CheckCircle2, 
  Edit, 
  Trash2,
  Download,
  Bell,
  CreditCard,
  TrendingUp,
  History
} from 'lucide-react';
import { format, differenceInDays, addMonths, addWeeks, addDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { toast } from 'sonner';
import Link from 'next/link';

interface Payment {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  status: 'pending' | 'paid' | 'overdue';
  category: string;
  description?: string;
  is_recurring: boolean;
  recurring_frequency?: string;
  priority: 'high' | 'medium' | 'low';
  reminder_days: number;
  created_at: string;
  last_paid?: string;
  next_due?: string;
}

interface PaymentHistory {
  id: string;
  payment_id: string;
  amount: number;
  paid_date: string;
  method: string;
  status: string;
}

export default function PaymentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const [payment, setPayment] = useState<Payment | null>(null);
  const [paymentHistory, setPaymentHistory] = useState<PaymentHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (params.id) {
      fetchPaymentDetails();
      fetchPaymentHistory();
    }
  }, [params.id]);

  const fetchPaymentDetails = async () => {
    try {
      const response = await fetch(`/api/payments/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPayment(data);
      } else {
        toast.error('Error al cargar los detalles del pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al cargar los detalles del pago');
    } finally {
      setLoading(false);
    }
  };

  const fetchPaymentHistory = async () => {
    try {
      const response = await fetch(`/api/payments/${params.id}/history`);
      if (response.ok) {
        const data = await response.json();
        setPaymentHistory(data);
      }
    } catch (error) {
      console.error('Error fetching payment history:', error);
    }
  };

  const markAsPaid = async () => {
    setActionLoading(true);
    try {
      const response = await fetch(`/api/payments/${params.id}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: payment?.amount,
          method: 'manual',
          paid_date: new Date().toISOString()
        }),
      });

      if (response.ok) {
        toast.success('Pago marcado como pagado');
        fetchPaymentDetails();
        fetchPaymentHistory();
      } else {
        toast.error('Error al marcar como pagado');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al marcar como pagado');
    } finally {
      setActionLoading(false);
    }
  };

  const deletePayment = async () => {
    if (!confirm('¿Estás seguro de que quieres eliminar este pago programado?')) {
      return;
    }

    setActionLoading(true);
    try {
      const response = await fetch(`/api/payments/${params.id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        toast.success('Pago eliminado exitosamente');
        router.push('/payments');
      } else {
        toast.error('Error al eliminar el pago');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Error al eliminar el pago');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'overdue': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    }
  };

  const getNextDueDate = () => {
    if (!payment?.is_recurring || !payment.due_date) return null;
    
    const dueDate = new Date(payment.due_date);
    const now = new Date();
    
    if (dueDate > now) return dueDate;
    
    switch (payment.recurring_frequency) {
      case 'monthly': return addMonths(dueDate, 1);
      case 'weekly': return addWeeks(dueDate, 1);
      case 'biweekly': return addWeeks(dueDate, 2);
      case 'quarterly': return addMonths(dueDate, 3);
      case 'biannual': return addMonths(dueDate, 6);
      case 'annual': return addMonths(dueDate, 12);
      default: return addMonths(dueDate, 1);
    }
  };

  const getDaysUntilDue = () => {
    if (!payment?.due_date) return 0;
    const dueDate = new Date(payment.due_date);
    const now = new Date();
    return differenceInDays(dueDate, now);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando detalles del pago...</p>
        </div>
      </div>
    );
  }

  if (!payment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-bold mb-4">Pago no encontrado</h2>
        <p className="text-muted-foreground mb-6">El pago que buscas no existe o ha sido eliminado.</p>
        <Link href="/payments">
          <Button>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Pagos
          </Button>
        </Link>
      </div>
    );
  }

  const daysUntilDue = getDaysUntilDue();
  const nextDueDate = getNextDueDate();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
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
            <h1 className="text-3xl font-bold tracking-tight">{payment.name}</h1>
            <p className="text-muted-foreground">
              {payment.category} • Creado el {format(new Date(payment.created_at), 'PPP', { locale: es })}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Edit className="h-4 w-4 mr-2" />
            Editar
          </Button>
          <Button variant="outline" size="sm" onClick={deletePayment} disabled={actionLoading}>
            <Trash2 className="h-4 w-4 mr-2" />
            Eliminar
          </Button>
        </div>
      </div>

      {/* Status and Quick Actions */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Estado Actual</CardTitle>
            {payment.status === 'paid' ? (
              <CheckCircle2 className="h-4 w-4 text-green-600" />
            ) : payment.status === 'overdue' ? (
              <AlertTriangle className="h-4 w-4 text-red-600" />
            ) : (
              <Clock className="h-4 w-4 text-yellow-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Badge className={getStatusColor(payment.status)}>
                {payment.status === 'paid' ? 'Pagado' : 
                 payment.status === 'overdue' ? 'Vencido' : 'Pendiente'}
              </Badge>
              {payment.status === 'pending' && (
                <p className="text-sm text-muted-foreground">
                  {daysUntilDue > 0 ? `Vence en ${daysUntilDue} días` : 
                   daysUntilDue === 0 ? 'Vence hoy' : `Vencido hace ${Math.abs(daysUntilDue)} días`}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Monto</CardTitle>
            <DollarSign className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${payment.amount.toLocaleString()}</div>
            <div className="flex items-center gap-2 mt-2">
              <Badge className={getPriorityColor(payment.priority)}>
                Prioridad {payment.priority === 'high' ? 'Alta' : payment.priority === 'medium' ? 'Media' : 'Baja'}
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Próximo Vencimiento</CardTitle>
            <Calendar className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-lg font-semibold">
              {nextDueDate ? format(nextDueDate, 'PPP', { locale: es }) : 
               format(new Date(payment.due_date), 'PPP', { locale: es })}
            </div>
            {payment.is_recurring && (
              <div className="flex items-center gap-1 mt-2 text-sm text-muted-foreground">
                <Repeat className="h-3 w-3" />
                <span>Recurrente</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {payment.status === 'pending' && (
        <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-blue-900 dark:text-blue-100">Acciones Rápidas</h3>
                <p className="text-sm text-blue-700 dark:text-blue-300">
                  Marca este pago como completado o programa un recordatorio
                </p>
              </div>
              <div className="flex gap-2">
                <Button onClick={markAsPaid} disabled={actionLoading}>
                  <CheckCircle2 className="h-4 w-4 mr-2" />
                  Marcar como Pagado
                </Button>
                <Button variant="outline">
                  <Bell className="h-4 w-4 mr-2" />
                  Recordatorio
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Detailed Information */}
      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Detalles</TabsTrigger>
          <TabsTrigger value="history">Historial</TabsTrigger>
          <TabsTrigger value="analytics">Análisis</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Información General</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Categoría</p>
                    <p className="font-medium">{payment.category}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Monto</p>
                    <p className="font-medium text-lg">${payment.amount.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Fecha de Vencimiento</p>
                    <p className="font-medium">{format(new Date(payment.due_date), 'PPP', { locale: es })}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Recordatorio</p>
                    <p className="font-medium">{payment.reminder_days} días antes</p>
                  </div>
                </div>
                
                {payment.description && (
                  <div>
                    <p className="text-sm text-muted-foreground mb-2">Descripción</p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{payment.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configuración de Recurrencia</CardTitle>
              </CardHeader>
              <CardContent>
                {payment.is_recurring ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2">
                      <Repeat className="h-4 w-4 text-blue-600" />
                      <span className="font-medium text-blue-600">Pago Recurrente Activo</span>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Frecuencia</p>
                        <p className="font-medium capitalize">{payment.recurring_frequency}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Próximo Pago</p>
                        <p className="font-medium">
                          {nextDueDate ? format(nextDueDate, 'PPP', { locale: es }) : 'No programado'}
                        </p>
                      </div>
                    </div>
                    {payment.last_paid && (
                      <div>
                        <p className="text-sm text-muted-foreground">Último Pago</p>
                        <p className="font-medium">{format(new Date(payment.last_paid), 'PPP', { locale: es })}</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <Clock className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Este es un pago único</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="history" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="h-5 w-5" />
                Historial de Pagos
              </CardTitle>
            </CardHeader>
            <CardContent>
              {paymentHistory.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No hay historial de pagos disponible</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {paymentHistory.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                          <CheckCircle2 className="h-5 w-5 text-green-600 dark:text-green-400" />
                        </div>
                        <div>
                          <p className="font-medium">Pago Completado</p>
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(record.paid_date), 'PPP', { locale: es })} • {record.method}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">${record.amount.toLocaleString()}</p>
                        <Badge variant="outline">{record.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estadísticas de Pago
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pagos a Tiempo</span>
                    <span>85%</span>
                  </div>
                  <Progress value={85} className="h-2" />
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Pagos Tardíos</span>
                    <span>15%</span>
                  </div>
                  <Progress value={15} className="h-2" />
                </div>
                <Separator />
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <p className="text-2xl font-bold">{paymentHistory.length}</p>
                    <p className="text-sm text-muted-foreground">Total Pagos</p>
                  </div>
                  <div>
                    <p className="text-2xl font-bold">
                      ${paymentHistory.reduce((sum, p) => sum + p.amount, 0).toLocaleString()}
                    </p>
                    <p className="text-sm text-muted-foreground">Total Pagado</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Proyección Anual</CardTitle>
              </CardHeader>
              <CardContent>
                {payment.is_recurring ? (
                  <div className="space-y-4">
                    <div className="text-center">
                      <p className="text-3xl font-bold text-blue-600">
                        ${(payment.amount * 12).toLocaleString()}
                      </p>
                      <p className="text-sm text-muted-foreground">Costo anual estimado</p>
                    </div>
                    <Separator />
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span className="text-sm">Mensual</span>
                        <span className="font-medium">${payment.amount.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Trimestral</span>
                        <span className="font-medium">${(payment.amount * 3).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-sm">Semestral</span>
                        <span className="font-medium">${(payment.amount * 6).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6">
                    <DollarSign className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">Pago único - No hay proyección</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}