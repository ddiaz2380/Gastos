'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  ArrowLeft, 
  ArrowRight,
  Wallet, 
  CreditCard, 
  PiggyBank, 
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Shield,
  Zap,
  Info
} from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
  is_active: boolean;
}

interface TransferData {
  fromAccountId: string;
  toAccountId: string;
  amount: string;
  description: string;
  transferType: 'internal' | 'external';
  scheduledDate?: string;
}

export default function TransferPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [sourceAccount, setSourceAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [step, setStep] = useState(1); // 1: Form, 2: Confirmation, 3: Success
  
  const [transferData, setTransferData] = useState<TransferData>({
    fromAccountId: accountId,
    toAccountId: '',
    amount: '',
    description: '',
    transferType: 'internal'
  });

  useEffect(() => {
    fetchAccounts();
  }, []);

  const fetchAccounts = async () => {
    try {
      const response = await fetch('/api/accounts');
      if (response.ok) {
        const data = await response.json();
        setAccounts(data.filter((acc: Account) => acc.is_active));
        const source = data.find((acc: Account) => acc.id === accountId);
        setSourceAccount(source || null);
      } else {
        toast.error('Error al cargar las cuentas');
      }
    } catch (error) {
      console.error('Error fetching accounts:', error);
      toast.error('Error al cargar las cuentas');
    } finally {
      setLoading(false);
    }
  };

  const getAccountIcon = (type: string) => {
    switch (type) {
      case 'checking': return <Wallet className="h-5 w-5" />;
      case 'savings': return <PiggyBank className="h-5 w-5" />;
      case 'credit': return <CreditCard className="h-5 w-5" />;
      case 'investment': return <TrendingUp className="h-5 w-5" />;
      default: return <Wallet className="h-5 w-5" />;
    }
  };

  const getAccountColor = (type: string) => {
    switch (type) {
      case 'checking': return 'text-blue-600 bg-blue-50 border-blue-200';
      case 'savings': return 'text-green-600 bg-green-50 border-green-200';
      case 'credit': return 'text-red-600 bg-red-50 border-red-200';
      case 'investment': return 'text-purple-600 bg-purple-50 border-purple-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  };

  const formatBalance = (balance: number) => {
    return `$${Math.abs(balance).toLocaleString()}`;
  };

  const validateTransfer = () => {
    const amount = parseFloat(transferData.amount);
    const errors = [];

    if (!transferData.toAccountId) {
      errors.push('Selecciona una cuenta de destino');
    }
    
    if (!transferData.amount || amount <= 0) {
      errors.push('Ingresa un monto válido');
    }
    
    if (sourceAccount && amount > sourceAccount.balance && sourceAccount.type !== 'credit') {
      errors.push('Saldo insuficiente en la cuenta origen');
    }
    
    if (transferData.fromAccountId === transferData.toAccountId) {
      errors.push('No puedes transferir a la misma cuenta');
    }

    return errors;
  };

  const handleTransfer = async () => {
    const errors = validateTransfer();
    if (errors.length > 0) {
      errors.forEach(error => toast.error(error));
      return;
    }

    setStep(2);
  };

  const confirmTransfer = async () => {
    setProcessing(true);
    
    try {
      const response = await fetch('/api/transfers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...transferData,
          amount: parseFloat(transferData.amount)
        }),
      });

      if (response.ok) {
        setStep(3);
        toast.success('Transferencia realizada exitosamente');
      } else {
        const error = await response.json();
        toast.error(error.message || 'Error al procesar la transferencia');
        setStep(1);
      }
    } catch (error) {
      console.error('Error processing transfer:', error);
      toast.error('Error al procesar la transferencia');
      setStep(1);
    } finally {
      setProcessing(false);
    }
  };

  const destinationAccount = accounts.find(acc => acc.id === transferData.toAccountId);
  const transferAmount = parseFloat(transferData.amount) || 0;
  const transferFee = transferData.transferType === 'external' ? transferAmount * 0.01 : 0;
  const totalAmount = transferAmount + transferFee;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Cargando información de transferencia...</p>
        </div>
      </div>
    );
  }

  if (!sourceAccount) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-muted-foreground mb-4">Cuenta no encontrada</p>
          <Button onClick={() => router.push('/accounts')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver a Cuentas
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => {
            if (step > 1) {
              setStep(step - 1);
            } else {
              router.push(`/accounts/${accountId}`);
            }
          }}
          className="transition-all duration-200 hover:scale-105"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step > 1 ? 'Atrás' : 'Volver'}
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transferir Fondos</h1>
          <p className="text-muted-foreground">
            {step === 1 && 'Configura los detalles de tu transferencia'}
            {step === 2 && 'Confirma los detalles de la transferencia'}
            {step === 3 && 'Transferencia completada exitosamente'}
          </p>
        </div>
      </div>

      {/* Progress Indicator */}
      <div className="flex items-center justify-center space-x-4 mb-8">
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          step >= 1 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
        }`}>
          1
        </div>
        <div className={`h-1 w-16 ${
          step >= 2 ? 'bg-primary' : 'bg-muted'
        }`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          step >= 2 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
        }`}>
          2
        </div>
        <div className={`h-1 w-16 ${
          step >= 3 ? 'bg-primary' : 'bg-muted'
        }`}></div>
        <div className={`flex items-center justify-center w-8 h-8 rounded-full border-2 ${
          step >= 3 ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground text-muted-foreground'
        }`}>
          3
        </div>
      </div>

      {/* Step 1: Transfer Form */}
      {step === 1 && (
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Source Account */}
          <Card className="lg:col-span-1">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ArrowRight className="h-5 w-5 text-blue-600" />
                Cuenta Origen
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`p-4 rounded-lg border-2 ${getAccountColor(sourceAccount.type)}`}>
                <div className="flex items-center gap-3 mb-3">
                  {getAccountIcon(sourceAccount.type)}
                  <div>
                    <p className="font-medium">{sourceAccount.name}</p>
                    <Badge variant="outline" className="text-xs capitalize">
                      {sourceAccount.type}
                    </Badge>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-sm text-muted-foreground">Saldo disponible</p>
                  <p className="text-xl font-bold">
                    {formatBalance(sourceAccount.balance)}
                  </p>
                  <p className="text-xs text-muted-foreground">{sourceAccount.currency}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Transfer Form */}
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-green-600" />
                Detalles de la Transferencia
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Destination Account */}
              <div className="space-y-2">
                <Label>Cuenta de Destino</Label>
                <Select
                  value={transferData.toAccountId}
                  onValueChange={(value) => setTransferData(prev => ({ ...prev, toAccountId: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecciona una cuenta de destino" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts
                      .filter(acc => acc.id !== accountId)
                      .map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            {getAccountIcon(account.type)}
                            <span>{account.name}</span>
                            <Badge variant="outline" className="text-xs capitalize ml-auto">
                              {account.type}
                            </Badge>
                          </div>
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              {/* Amount */}
              <div className="space-y-2">
                <Label>Monto a Transferir</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="number"
                    placeholder="0.00"
                    value={transferData.amount}
                    onChange={(e) => setTransferData(prev => ({ ...prev, amount: e.target.value }))}
                    className="pl-10"
                    step="0.01"
                    min="0"
                  />
                </div>
                {transferData.amount && parseFloat(transferData.amount) > sourceAccount.balance && sourceAccount.type !== 'credit' && (
                  <Alert>
                    <AlertTriangle className="h-4 w-4" />
                    <AlertDescription>
                      El monto excede el saldo disponible en la cuenta origen.
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              {/* Transfer Type */}
              <div className="space-y-2">
                <Label>Tipo de Transferencia</Label>
                <Select
                  value={transferData.transferType}
                  onValueChange={(value: 'internal' | 'external') => 
                    setTransferData(prev => ({ ...prev, transferType: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal">
                      <div className="flex items-center gap-2">
                        <Zap className="h-4 w-4 text-green-600" />
                        <div>
                          <p>Transferencia Interna</p>
                          <p className="text-xs text-muted-foreground">Instantánea • Sin comisión</p>
                        </div>
                      </div>
                    </SelectItem>
                    <SelectItem value="external">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-blue-600" />
                        <div>
                          <p>Transferencia Externa</p>
                          <p className="text-xs text-muted-foreground">1-3 días hábiles • Comisión 1%</p>
                        </div>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label>Descripción (Opcional)</Label>
                <Textarea
                  placeholder="Concepto de la transferencia..."
                  value={transferData.description}
                  onChange={(e) => setTransferData(prev => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>

              {/* Transfer Summary */}
              {transferData.amount && parseFloat(transferData.amount) > 0 && (
                <div className="bg-muted/30 p-4 rounded-lg space-y-2">
                  <h4 className="font-medium flex items-center gap-2">
                    <Info className="h-4 w-4" />
                    Resumen de la Transferencia
                  </h4>
                  <div className="space-y-1 text-sm">
                    <div className="flex justify-between">
                      <span>Monto:</span>
                      <span>{formatBalance(transferAmount)}</span>
                    </div>
                    {transferFee > 0 && (
                      <div className="flex justify-between">
                        <span>Comisión (1%):</span>
                        <span>{formatBalance(transferFee)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex justify-between font-medium">
                      <span>Total a debitar:</span>
                      <span>{formatBalance(totalAmount)}</span>
                    </div>
                  </div>
                </div>
              )}

              <Button 
                onClick={handleTransfer} 
                className="w-full"
                disabled={!transferData.toAccountId || !transferData.amount || parseFloat(transferData.amount) <= 0}
              >
                Continuar con la Transferencia
              </Button>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Step 2: Confirmation */}
      {step === 2 && (
        <Card className="max-w-2xl mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-blue-600" />
              Confirmar Transferencia
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Transfer Details */}
            <div className="bg-muted/30 p-6 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${getAccountColor(sourceAccount.type)}`}>
                    {getAccountIcon(sourceAccount.type)}
                  </div>
                  <div>
                    <p className="font-medium">{sourceAccount.name}</p>
                    <p className="text-sm text-muted-foreground">Cuenta origen</p>
                  </div>
                </div>
                <ArrowRight className="h-6 w-6 text-muted-foreground" />
                <div className="flex items-center gap-3">
                  <div className={`p-3 rounded-full ${destinationAccount ? getAccountColor(destinationAccount.type) : 'bg-gray-100'}`}>
                    {destinationAccount ? getAccountIcon(destinationAccount.type) : <Wallet className="h-5 w-5" />}
                  </div>
                  <div>
                    <p className="font-medium">{destinationAccount?.name}</p>
                    <p className="text-sm text-muted-foreground">Cuenta destino</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <p className="text-sm text-muted-foreground">Monto</p>
                  <p className="text-xl font-bold">{formatBalance(transferAmount)}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Tipo</p>
                  <div className="flex items-center gap-2">
                    {transferData.transferType === 'internal' ? (
                      <>
                        <Zap className="h-4 w-4 text-green-600" />
                        <span>Interna</span>
                      </>
                    ) : (
                      <>
                        <Clock className="h-4 w-4 text-blue-600" />
                        <span>Externa</span>
                      </>
                    )}
                  </div>
                </div>
                {transferFee > 0 && (
                  <div>
                    <p className="text-sm text-muted-foreground">Comisión</p>
                    <p className="font-medium">{formatBalance(transferFee)}</p>
                  </div>
                )}
                <div>
                  <p className="text-sm text-muted-foreground">Total a debitar</p>
                  <p className="text-xl font-bold text-red-600">{formatBalance(totalAmount)}</p>
                </div>
              </div>

              {transferData.description && (
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Descripción</p>
                  <p className="text-sm bg-background p-2 rounded border">{transferData.description}</p>
                </div>
              )}
            </div>

            <Alert>
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Esta transferencia se procesará de forma segura. Verifica que todos los datos sean correctos antes de confirmar.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button 
                variant="outline" 
                onClick={() => setStep(1)}
                className="flex-1"
              >
                Modificar
              </Button>
              <Button 
                onClick={confirmTransfer} 
                disabled={processing}
                className="flex-1"
              >
                {processing ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Procesando...
                  </>
                ) : (
                  'Confirmar Transferencia'
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Success */}
      {step === 3 && (
        <Card className="max-w-2xl mx-auto text-center">
          <CardContent className="pt-6">
            <div className="space-y-6">
              <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              
              <div>
                <h2 className="text-2xl font-bold text-green-600 mb-2">¡Transferencia Exitosa!</h2>
                <p className="text-muted-foreground">
                  Tu transferencia de {formatBalance(transferAmount)} ha sido procesada correctamente.
                </p>
              </div>

              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <div className="text-sm space-y-1">
                  <div className="flex justify-between">
                    <span>De:</span>
                    <span className="font-medium">{sourceAccount.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Para:</span>
                    <span className="font-medium">{destinationAccount?.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Monto:</span>
                    <span className="font-medium">{formatBalance(transferAmount)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Fecha:</span>
                    <span className="font-medium">{new Date().toLocaleDateString('es-ES')}</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <Button 
                  variant="outline" 
                  onClick={() => router.push('/accounts')}
                  className="flex-1"
                >
                  Ver Todas las Cuentas
                </Button>
                <Button 
                  onClick={() => router.push(`/accounts/${accountId}`)}
                  className="flex-1"
                >
                  Ver Cuenta Origen
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}