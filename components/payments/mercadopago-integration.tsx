import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Globe, CreditCard, Smartphone, QrCode, Building2 } from 'lucide-react';

interface MercadoPagoPaymentProps {
  amount: number;
  description: string;
  onSuccess: (paymentId: string) => void;
  onError: (error: string) => void;
}

export function MercadoPagoPayment({ amount, description, onSuccess, onError }: MercadoPagoPaymentProps) {
  const [paymentMethod, setPaymentMethod] = useState<'card' | 'pix' | 'boleto' | 'account_money'>('card');
  const [loading, setLoading] = useState(false);

  const paymentMethods = [
    {
      id: 'card',
      name: 'Tarjeta de Crédito/Débito',
      icon: <CreditCard className="h-5 w-5" />,
      description: 'Visa, Mastercard, American Express',
      available: true,
    },
    {
      id: 'pix',
      name: 'PIX',
      icon: <QrCode className="h-5 w-5" />,
      description: 'Pago instantáneo con código QR',
      available: true,
      country: 'Brasil',
    },
    {
      id: 'boleto',
      name: 'Boleto Bancário',
      icon: <Building2 className="h-5 w-5" />,
      description: 'Pago en efectivo o débito',
      available: true,
      country: 'Brasil',
    },
    {
      id: 'account_money',
      name: 'Dinero en Cuenta',
      icon: <Smartphone className="h-5 w-5" />,
      description: 'Saldo disponible en Mercado Pago',
      available: true,
    },
  ];

  const handlePayment = async () => {
    setLoading(true);
    
    try {
      // Simulación de integración con Mercado Pago
      // En producción, aquí harías la llamada real a la API
      const paymentData = {
        transaction_amount: amount,
        description: description,
        payment_method_id: paymentMethod,
        payer: {
          email: 'user@example.com',
        },
      };

      // Simular delay de procesamiento
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Simular respuesta exitosa
      const mockPaymentId = `mp_${Date.now()}`;
      onSuccess(mockPaymentId);
      
    } catch (error) {
      onError('Error al procesar el pago con Mercado Pago');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-blue-600" />
          Pagar con Mercado Pago
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Resumen del pago */}
        <div className="p-4 bg-muted rounded-lg">
          <div className="flex justify-between items-center">
            <span className="font-medium">Total a pagar:</span>
            <span className="text-2xl font-bold text-blue-600">
              ${amount.toLocaleString('es-AR')}
            </span>
          </div>
          <p className="text-sm text-muted-foreground mt-1">{description}</p>
        </div>

        {/* Métodos de pago */}
        <div className="space-y-3">
          <Label className="text-base font-medium">Método de pago</Label>
          {paymentMethods.map((method) => (
            <div
              key={method.id}
              className={`p-3 border rounded-lg cursor-pointer transition-all ${
                paymentMethod === method.id
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-950'
                  : 'border-border hover:border-blue-300'
              }`}
              onClick={() => setPaymentMethod(method.id as any)}
            >
              <div className="flex items-center gap-3">
                <div className={`p-2 rounded-full ${
                  paymentMethod === method.id ? 'bg-blue-100 text-blue-600' : 'bg-muted'
                }`}>
                  {method.icon}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{method.name}</span>
                    {method.country && (
                      <Badge variant="outline" className="text-xs">
                        {method.country}
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                <div className={`w-4 h-4 rounded-full border-2 ${
                  paymentMethod === method.id
                    ? 'border-blue-500 bg-blue-500'
                    : 'border-gray-300'
                }`}>
                  {paymentMethod === method.id && (
                    <div className="w-full h-full rounded-full bg-white scale-50"></div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Información adicional según el método */}
        {paymentMethod === 'pix' && (
          <Alert>
            <QrCode className="h-4 w-4" />
            <AlertDescription>
              Se generará un código QR para que puedas pagar desde tu app bancaria.
            </AlertDescription>
          </Alert>
        )}

        {paymentMethod === 'boleto' && (
          <Alert>
            <Building2 className="h-4 w-4" />
            <AlertDescription>
              Se generará un boleto que podrás pagar en bancos, lotéricas o por débito automático.
            </AlertDescription>
          </Alert>
        )}

        {/* Botón de pago */}
        <Button 
          onClick={handlePayment} 
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700"
          size="lg"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              Procesando...
            </div>
          ) : (
            `Pagar $${amount.toLocaleString('es-AR')}`
          )}
        </Button>

        {/* Información de seguridad */}
        <div className="text-center">
          <p className="text-xs text-muted-foreground">
            🔒 Pago seguro protegido por Mercado Pago
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Aceptamos todas las tarjetas principales
          </p>
        </div>
      </CardContent>
    </Card>
  );
}

// Hook para integración con Mercado Pago
export function useMercadoPago() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createPayment = async (paymentData: {
    amount: number;
    description: string;
    paymentMethodId: string;
    payerEmail: string;
  }) => {
    setIsLoading(true);
    setError(null);

    try {
      // En producción, aquí harías la llamada a tu backend
      // que se comunicaría con la API de Mercado Pago
      const response = await fetch('/api/mercadopago/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(paymentData),
      });

      if (!response.ok) {
        throw new Error('Error al crear el pago');
      }

      const result = await response.json();
      return result;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getPaymentStatus = async (paymentId: string) => {
    try {
      const response = await fetch(`/api/mercadopago/payment/${paymentId}`);
      if (!response.ok) {
        throw new Error('Error al obtener el estado del pago');
      }
      return await response.json();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      throw err;
    }
  };

  return {
    createPayment,
    getPaymentStatus,
    isLoading,
    error,
  };
}