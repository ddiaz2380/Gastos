'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, Download, ArrowLeft, Globe } from 'lucide-react';
import Link from 'next/link';

function PaymentSuccessContent() {
  const searchParams = useSearchParams();
  const [paymentData, setPaymentData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const paymentId = searchParams.get('payment_id');
    const status = searchParams.get('status');
    const merchantOrderId = searchParams.get('merchant_order_id');

    if (paymentId) {
      // Simular obtención de datos del pago
      setTimeout(() => {
        setPaymentData({
          id: paymentId,
          status: status || 'approved',
          amount: 150.00,
          description: 'Pago de factura de servicios',
          date: new Date().toISOString(),
          method: 'mercadopago',
          merchantOrderId,
        });
        setLoading(false);
      }, 1000);
    } else {
      setLoading(false);
    }
  }, [searchParams]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Verificando el pago...</p>
        </div>
      </div>
    );
  }

  if (!paymentData) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="max-w-md w-full">
          <CardContent className="text-center p-8">
            <div className="text-red-500 mb-4">
              <CheckCircle className="h-16 w-16 mx-auto" />
            </div>
            <h2 className="text-xl font-bold mb-2">Pago no encontrado</h2>
            <p className="text-muted-foreground mb-4">
              No se pudo verificar la información del pago.
            </p>
            <Link href="/payments">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver a Pagos
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950 dark:to-blue-950 flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 p-3 bg-green-100 dark:bg-green-900 rounded-full w-fit">
            <CheckCircle className="h-12 w-12 text-green-600 dark:text-green-400" />
          </div>
          <CardTitle className="text-2xl text-green-600 dark:text-green-400">
            ¡Pago Exitoso!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Detalles del pago */}
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Monto pagado:</span>
              <span className="text-2xl font-bold text-green-600">
                ${paymentData.amount.toLocaleString('es-AR')}
              </span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">ID de pago:</span>
              <span className="font-mono text-sm">{paymentData.id}</span>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Estado:</span>
              <Badge variant="default" className="bg-green-600">
                Aprobado
              </Badge>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Método:</span>
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-blue-600" />
                <span>Mercado Pago</span>
              </div>
            </div>
            
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Fecha:</span>
              <span>{new Date(paymentData.date).toLocaleDateString('es-AR')}</span>
            </div>
          </div>

          {/* Descripción */}
          <div className="p-4 bg-muted rounded-lg">
            <h4 className="font-medium mb-1">Descripción:</h4>
            <p className="text-sm text-muted-foreground">{paymentData.description}</p>
          </div>

          {/* Información adicional */}
          <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-200 mb-2">
              ¿Qué sigue?
            </h4>
            <ul className="text-sm text-blue-700 dark:text-blue-300 space-y-1">
              <li>• Recibirás un email de confirmación</li>
              <li>• El comprobante estará disponible en tu cuenta</li>
              <li>• El servicio se activará automáticamente</li>
            </ul>
          </div>

          {/* Acciones */}
          <div className="space-y-3">
            <Button className="w-full" variant="outline">
              <Download className="h-4 w-4 mr-2" />
              Descargar Comprobante
            </Button>
            
            <div className="grid grid-cols-2 gap-3">
              <Link href="/payments" className="w-full">
                <Button variant="outline" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Volver
                </Button>
              </Link>
              <Link href="/" className="w-full">
                <Button className="w-full">
                  Ir al Dashboard
                </Button>
              </Link>
            </div>
          </div>

          {/* Soporte */}
          <div className="text-center pt-4 border-t">
            <p className="text-xs text-muted-foreground">
              ¿Problemas con tu pago?{' '}
              <a href="/support" className="text-blue-600 hover:underline">
                Contacta soporte
              </a>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>Cargando...</p>
        </div>
      </div>
    }>
      <PaymentSuccessContent />
    </Suspense>
  );
}