import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { MercadoPagoPayment } from './mercadopago-integration';
import { 
  CreditCard, 
  Building, 
  Smartphone, 
  Globe,
  CheckCircle,
  Clock,
  AlertCircle
} from 'lucide-react';

interface PaymentMethodsProps {
  amount: number;
  description: string;
  onPaymentSuccess: (paymentId: string, method: string) => void;
  onPaymentError: (error: string) => void;
}

export function PaymentMethods({ amount, description, onPaymentSuccess, onPaymentError }: PaymentMethodsProps) {
  const [selectedMethod, setSelectedMethod] = useState<string | null>(null);
  const [showMercadoPago, setShowMercadoPago] = useState(false);

  const paymentMethods = [
    {
      id: 'stripe',
      name: 'Stripe',
      description: 'Tarjetas internacionales',
      icon: <CreditCard className="h-6 w-6" />,
      color: 'bg-purple-500',
      regions: ['Global'],
      features: ['Visa', 'Mastercard', 'American Express', 'Apple Pay', 'Google Pay'],
    },
    {
      id: 'mercadopago',
      name: 'Mercado Pago',
      description: 'Pagos en Latinoamérica',
      icon: <Globe className="h-6 w-6" />,
      color: 'bg-blue-500',
      regions: ['Argentina', 'Brasil', 'México', 'Colombia', 'Chile', 'Perú', 'Uruguay'],
      features: ['Tarjetas locales', 'PIX', 'Boleto', 'Efectivo', 'Cuotas sin interés'],
    },
    {
      id: 'bank',
      name: 'Transferencia Bancaria',
      description: 'Transferencia directa',
      icon: <Building className="h-6 w-6" />,
      color: 'bg-green-500',
      regions: ['Local'],
      features: ['CBU/CVU', 'Alias', 'Transferencia inmediata'],
    },
    {
      id: 'digital',
      name: 'Billeteras Digitales',
      description: 'Pagos móviles',
      icon: <Smartphone className="h-6 w-6" />,
      color: 'bg-orange-500',
      regions: ['Global'],
      features: ['PayPal', 'Apple Pay', 'Google Pay', 'Samsung Pay'],
    },
  ];

  const handleMethodSelect = (methodId: string) => {
    setSelectedMethod(methodId);
    
    if (methodId === 'mercadopago') {
      setShowMercadoPago(true);
    } else {
      // Aquí manejarías otros métodos de pago
      console.log(`Selected payment method: ${methodId}`);
    }
  };

  const handleMercadoPagoSuccess = (paymentId: string) => {
    setShowMercadoPago(false);
    onPaymentSuccess(paymentId, 'mercadopago');
  };

  const handleMercadoPagoError = (error: string) => {
    setShowMercadoPago(false);
    onPaymentError(error);
  };

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Seleccionar método de pago</CardTitle>
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Total a pagar:</span>
            <span className="text-2xl font-bold">${amount.toLocaleString()}</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`p-4 border rounded-lg cursor-pointer transition-all hover:shadow-md ${
                  selectedMethod === method.id
                    ? 'border-primary bg-primary/5'
                    : 'border-border hover:border-primary/50'
                }`}
                onClick={() => handleMethodSelect(method.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`p-3 rounded-full text-white ${method.color}`}>
                    {method.icon}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold">{method.name}</h3>
                    <p className="text-sm text-muted-foreground mb-2">
                      {method.description}
                    </p>
                    
                    {/* Regiones disponibles */}
                    <div className="flex flex-wrap gap-1 mb-2">
                      {method.regions.map((region) => (
                        <Badge key={region} variant="outline" className="text-xs">
                          {region}
                        </Badge>
                      ))}
                    </div>
                    
                    {/* Características */}
                    <div className="space-y-1">
                      {method.features.slice(0, 3).map((feature) => (
                        <div key={feature} className="flex items-center gap-1 text-xs text-muted-foreground">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          {feature}
                        </div>
                      ))}
                      {method.features.length > 3 && (
                        <div className="text-xs text-muted-foreground">
                          +{method.features.length - 3} más...
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Información adicional */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <AlertCircle className="h-4 w-4 text-blue-500" />
              <span className="font-medium text-sm">Información importante</span>
            </div>
            <ul className="text-xs text-muted-foreground space-y-1">
              <li>• Todos los pagos están protegidos con encriptación SSL</li>
              <li>• Los datos de tu tarjeta nunca se almacenan en nuestros servidores</li>
              <li>• Puedes cancelar el pago antes de confirmar</li>
              <li>• Recibirás una confirmación por email</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Mercado Pago */}
      <Dialog open={showMercadoPago} onOpenChange={setShowMercadoPago}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Pagar con Mercado Pago</DialogTitle>
            <DialogDescription>
              Completa tu pago de forma segura a través de Mercado Pago.
            </DialogDescription>
          </DialogHeader>
          <MercadoPagoPayment
            amount={amount}
            description={description}
            onSuccess={handleMercadoPagoSuccess}
            onError={handleMercadoPagoError}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}