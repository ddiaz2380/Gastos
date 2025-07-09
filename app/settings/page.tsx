'use client';

import { useState, useEffect } from 'react';
import { useLoading } from '@/components/providers/loading-provider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette,
  Globe,
  Download,
  Trash2,
  AlertCircle,
  CreditCard,
  DollarSign,
  Key,
  Server,
  Webhook,
  CheckCircle,
  XCircle,
  Eye,
  EyeOff,
  Copy,
  RefreshCw,
  Zap,
  Building,
  MapPin,
  Phone,
  Mail,
  Lock,
  Unlock,
  TestTube,
  Activity,
  Bitcoin,
  Clock,
  Database,
  FileText,
  Save
} from 'lucide-react';

export default function SettingsPage() {
  const { setLoading } = useLoading();
  const [settings, setSettings] = useState({
    // Profile
    name: 'John Doe',
    userEmail: 'john.doe@example.com',
    
    // Notifications
    emailNotifications: true,
    pushNotifications: false,
    budgetAlerts: true,
    goalReminders: true,
    
    // Preferences
    currency: 'USD',
    language: 'en',
    theme: 'system',
    
    // Security
    twoFactorAuth: false,
    sessionTimeout: '30',
    
    // MercadoPago Configuration
    mercadoPago: {
      enabled: false,
      environment: 'sandbox', // sandbox | production
      country: 'AR',
      publicKey: '',
      accessToken: '',
      webhookUrl: '',
      webhookSecret: '',
      autoReturn: 'approved',
      maxInstallments: 12,
      excludedPaymentMethods: [],
      excludedPaymentTypes: [],
      binaryMode: false,
      statementDescriptor: '',
      externalReference: '',
      notificationUrl: '',
      backUrls: {
        success: '',
        failure: '',
        pending: ''
      }
    },
    
    // Stripe Configuration
    stripe: {
      enabled: false,
      environment: 'test', // test | live
      publishableKey: '',
      secretKey: '',
      webhookSecret: '',
      webhookUrl: '',
      currency: 'usd',
      paymentMethods: ['card', 'apple_pay', 'google_pay'],
      captureMethod: 'automatic', // automatic | manual
      confirmationMethod: 'automatic', // automatic | manual
      setupFutureUsage: 'off_session', // off_session | on_session | none
      statementDescriptor: '',
      receiptEmail: true,
      allowRedisplay: 'unspecified' // always | limited | unspecified
    },
    
    // PayPal Configuration
    paypal: {
      enabled: false,
      environment: 'sandbox', // sandbox | live
      clientId: '',
      clientSecret: '',
      webhookId: '',
      currency: 'USD',
      intent: 'capture', // capture | authorize
      brandName: '',
      locale: 'en_US',
      landingPage: 'LOGIN', // LOGIN | BILLING | NO_PREFERENCE
      userAction: 'PAY_NOW', // PAY_NOW | CONTINUE
      returnUrl: '',
      cancelUrl: ''
    },
    
    // Bank Transfer Configuration
    bankTransfer: {
      enabled: false,
      supportedBanks: [],
      processingTime: '1-3', // business days
      minimumAmount: 0,
      maximumAmount: 0,
      currency: 'USD',
      accountValidation: true,
      instantVerification: false,
      bankName: '',
      accountNumber: '',
      cbu: '',
      alias: '',
      instructions: ''
    },
    
    // Cryptocurrency Configuration
    crypto: {
      enabled: false,
      supportedCoins: ['BTC', 'ETH', 'USDT', 'USDC'],
      provider: 'coinbase', // coinbase | binance | custom
      network: 'mainnet',
      apiKey: '',
      apiSecret: '',
      walletAddress: '',
      webhookSecret: '',
      confirmations: {
        BTC: 3,
        ETH: 12,
        USDT: 12,
        USDC: 12
      },
      autoConvert: true,
      targetCurrency: 'USD'
    },
    
    // API Configuration
    api: {
      rateLimit: {
        enabled: true,
        requestsPerMinute: 100,
        requestsPerHour: 1000,
        requestsPerDay: 10000,
        blockDuration: 60
      },
      cors: {
        enabled: true,
        allowedOrigins: ['http://localhost:3000'],
        allowedMethods: ['GET', 'POST', 'PUT', 'DELETE'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        allowCredentials: true
      },
      auth: {
        type: 'jwt',
        tokenExpiration: 24,
        jwtSecret: '',
        jwtExpiration: '24h',
        refreshTokenExpiration: '7d',
        requireApiKey: false,
        apiKeys: []
      }
    },
    
    // Email Configuration
    email: {
      provider: 'smtp', // smtp | sendgrid | mailgun | ses
      fromEmail: '',
      smtp: {
        host: '',
        port: 587,
        secure: false,
        username: '',
        password: ''
      },
      sendgrid: {
        apiKey: '',
        fromEmail: '',
        fromName: ''
      },
      templates: {
        welcome: '',
        passwordReset: '',
        paymentConfirmation: '',
        monthlyReport: ''
      }
    },
    
    // Database Configuration
    database: {
      provider: 'sqlite', // sqlite | postgresql | mysql
      backupEnabled: true,
      backupFrequency: 'daily', // hourly | daily | weekly
      retentionDays: 30,
      encryptionEnabled: false,
      encryption: false,
      autoBackup: true,
      connectionPoolSize: 10
    }
  });
  
  const [showSecrets, setShowSecrets] = useState({
    mercadopagoAccessToken: false,
    stripeSecretKey: false,
    paypalClientSecret: false,
    cryptoApiKey: false,
    cryptoApiSecret: false,
    jwtSecret: false,
    emailPassword: false,
    smtpPassword: false,
    sendgridApiKey: false
  });
  
  const [testResults, setTestResults] = useState({
    mercadoPago: null,
    stripe: null,
    paypal: null,
    crypto: null,
    email: null
  });

  useEffect(() => {
    const loadSettings = async () => {
      setLoading(true);
      try {
        // Simular carga de configuraciones
        await new Promise(resolve => setTimeout(resolve, 1000));
      } catch (error) {
        console.error('Error loading settings:', error);
      } finally {
        setLoading(false);
      }
    };
    loadSettings();
  }, []);

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };
  
  const handleNestedSettingChange = (section: string, key: string, value: any) => {
    setSettings(prev => {
      const currentSection = prev[section as keyof typeof prev];
      if (typeof currentSection === 'object' && currentSection !== null) {
        return {
          ...prev,
          [section]: {
            ...currentSection,
            [key]: value
          }
        };
      }
      return prev;
    });
  };
  
  const handleDeepNestedSettingChange = (section: string, subsection: string, key: string, value: any) => {
    setSettings(prev => {
      const currentSection = prev[section as keyof typeof prev];
      if (typeof currentSection === 'object' && currentSection !== null) {
        const currentSubsection = (currentSection as any)[subsection];
        if (typeof currentSubsection === 'object' && currentSubsection !== null) {
          return {
            ...prev,
            [section]: {
              ...currentSection,
              [subsection]: {
                ...currentSubsection,
                [key]: value
              }
            }
          };
        }
      }
      return prev;
    });
  };
  
  const toggleSecretVisibility = (key: string) => {
    setShowSecrets(prev => ({ ...prev, [key]: !prev[key as keyof typeof prev] }));
  };
  
  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      // Aquí podrías agregar una notificación de éxito
    } catch (err) {
      console.error('Error copying to clipboard:', err);
    }
  };
  
  const testConnection = async (service: string) => {
    setTestResults(prev => ({ ...prev, [service]: 'testing' }));
    
    try {
      // Simular prueba de conexión
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Aquí irían las validaciones reales para cada servicio
      const success = Math.random() > 0.3; // Simular éxito/fallo
      
      setTestResults(prev => ({ 
        ...prev, 
        [service]: success ? 'success' : 'error' 
      }));
    } catch (error) {
      setTestResults(prev => ({ ...prev, [service]: 'error' }));
    }
  };
  
  const validateConfiguration = (service: string) => {
    const config = settings[service as keyof typeof settings] as any;
    
    switch (service) {
      case 'mercadoPago':
        return config.enabled && config.publicKey && config.accessToken;
      case 'stripe':
        return config.enabled && config.publishableKey && config.secretKey;
      case 'paypal':
        return config.enabled && config.clientId && config.clientSecret;
      case 'crypto':
        return config.enabled && config.apiKey && config.apiSecret;
      case 'email':
        if (config.provider === 'smtp') {
          return config.smtp.host && config.smtp.username && config.smtp.password;
        }
        return config.sendgrid.apiKey;
      default:
        return false;
    }
  };
  
  const getStatusBadge = (service: string) => {
    const isValid = validateConfiguration(service);
    const testResult = testResults[service as keyof typeof testResults];
    
    if (testResult === 'testing') {
      return <Badge variant="secondary"><RefreshCw className="h-3 w-3 mr-1 animate-spin" />Probando</Badge>;
    }
    
    if (testResult === 'success') {
      return <Badge variant="default" className="bg-green-500"><CheckCircle className="h-3 w-3 mr-1" />Conectado</Badge>;
    }
    
    if (testResult === 'error') {
      return <Badge variant="destructive"><XCircle className="h-3 w-3 mr-1" />Error</Badge>;
    }
    
    if (isValid) {
      return <Badge variant="outline"><Activity className="h-3 w-3 mr-1" />Configurado</Badge>;
    }
    
    return <Badge variant="secondary">No configurado</Badge>;
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configuración</h1>
        <p className="text-muted-foreground">
          Administra la configuración de tu cuenta, servicios de pago y preferencias del sistema
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="payments">Pagos</TabsTrigger>
          <TabsTrigger value="integrations">Integraciones</TabsTrigger>
          <TabsTrigger value="api">API</TabsTrigger>
          <TabsTrigger value="system">Sistema</TabsTrigger>
          <TabsTrigger value="security">Seguridad</TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Profile Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="h-5 w-5" />
                  Perfil
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre Completo</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => handleSettingChange('name', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Dirección de Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={settings.userEmail}
                    onChange={(e) => handleSettingChange('userEmail', e.target.value)}
                  />
                </div>
                <Button>Actualizar Perfil</Button>
              </CardContent>
            </Card>

            {/* Notification Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Notificaciones
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones por Email</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir actualizaciones por email
                    </p>
                  </div>
                  <Switch
                    checked={settings.emailNotifications}
                    onCheckedChange={(checked) => handleSettingChange('emailNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Notificaciones Push</Label>
                    <p className="text-sm text-muted-foreground">
                      Recibir notificaciones push
                    </p>
                  </div>
                  <Switch
                    checked={settings.pushNotifications}
                    onCheckedChange={(checked) => handleSettingChange('pushNotifications', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Alertas de Presupuesto</Label>
                    <p className="text-sm text-muted-foreground">
                      Alertar al acercarse a los límites del presupuesto
                    </p>
                  </div>
                  <Switch
                    checked={settings.budgetAlerts}
                    onCheckedChange={(checked) => handleSettingChange('budgetAlerts', checked)}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label>Recordatorios de Metas</Label>
                    <p className="text-sm text-muted-foreground">
                      Recordatorios para metas financieras
                    </p>
                  </div>
                  <Switch
                    checked={settings.goalReminders}
                    onCheckedChange={(checked) => handleSettingChange('goalReminders', checked)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Preferences */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Palette className="h-5 w-5" />
                  Preferencias
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.currency}
                    onValueChange={(value) => handleSettingChange('currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD - US Dollar</SelectItem>
                      <SelectItem value="EUR">EUR - Euro</SelectItem>
                      <SelectItem value="GBP">GBP - British Pound</SelectItem>
                      <SelectItem value="CAD">CAD - Canadian Dollar</SelectItem>
                      <SelectItem value="ARS">ARS - Peso Argentino</SelectItem>
                      <SelectItem value="BRL">BRL - Real Brasileño</SelectItem>
                      <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Idioma</Label>
                  <Select
                    value={settings.language}
                    onValueChange={(value) => handleSettingChange('language', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Español</SelectItem>
                      <SelectItem value="pt">Português</SelectItem>
                      <SelectItem value="fr">Français</SelectItem>
                      <SelectItem value="de">Deutsch</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tema</Label>
                  <Select
                    value={settings.theme}
                    onValueChange={(value) => handleSettingChange('theme', value)}
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
          </div>
        </TabsContent>

        {/* Payments Settings */}
        <TabsContent value="payments" className="space-y-6">
          {/* MercadoPago Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  MercadoPago
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('mercadoPago')}
                  <Switch
                    checked={settings.mercadoPago.enabled}
                    onCheckedChange={(checked) => handleNestedSettingChange('mercadoPago', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entorno</Label>
                  <Select
                    value={settings.mercadoPago.environment}
                    onValueChange={(value) => handleNestedSettingChange('mercadoPago', 'environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox (Pruebas)</SelectItem>
                      <SelectItem value="production">Producción</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>País</Label>
                  <Select
                    value={settings.mercadoPago.country}
                    onValueChange={(value) => handleNestedSettingChange('mercadoPago', 'country', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="AR">Argentina</SelectItem>
                      <SelectItem value="BR">Brasil</SelectItem>
                      <SelectItem value="MX">México</SelectItem>
                      <SelectItem value="CO">Colombia</SelectItem>
                      <SelectItem value="CL">Chile</SelectItem>
                      <SelectItem value="PE">Perú</SelectItem>
                      <SelectItem value="UY">Uruguay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Clave Pública</Label>
                <Input
                  value={settings.mercadoPago.publicKey}
                  onChange={(e) => handleNestedSettingChange('mercadoPago', 'publicKey', e.target.value)}
                  placeholder="TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Access Token</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.mercadopagoAccessToken ? 'text' : 'password'}
                    value={settings.mercadoPago.accessToken}
                    onChange={(e) => handleNestedSettingChange('mercadoPago', 'accessToken', e.target.value)}
                    placeholder="TEST-xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecretVisibility('mercadopagoAccessToken')}
                  >
                    {showSecrets.mercadopagoAccessToken ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.mercadoPago.accessToken)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>URL de Webhook</Label>
                  <Input
                    value={settings.mercadoPago.webhookUrl}
                    onChange={(e) => handleNestedSettingChange('mercadoPago', 'webhookUrl', e.target.value)}
                    placeholder="https://tu-dominio.com/api/mercadopago/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Secreto del Webhook</Label>
                  <Input
                    value={settings.mercadoPago.webhookSecret}
                    onChange={(e) => handleNestedSettingChange('mercadoPago', 'webhookSecret', e.target.value)}
                    placeholder="webhook_secret_key"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Máximo de Cuotas</Label>
                  <Input
                    type="number"
                    value={settings.mercadoPago.maxInstallments}
                    onChange={(e) => handleNestedSettingChange('mercadoPago', 'maxInstallments', parseInt(e.target.value))}
                    min="1"
                    max="24"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descriptor de Estado de Cuenta</Label>
                  <Input
                    value={settings.mercadoPago.statementDescriptor}
                    onChange={(e) => handleNestedSettingChange('mercadoPago', 'statementDescriptor', e.target.value)}
                    placeholder="MI TIENDA"
                    maxLength={22}
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('mercadoPago')}
                  disabled={!validateConfiguration('mercadoPago')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
                <Button variant="outline">
                  <Webhook className="h-4 w-4 mr-2" />
                  Configurar Webhooks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Stripe Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Stripe
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('stripe')}
                  <Switch
                    checked={settings.stripe.enabled}
                    onCheckedChange={(checked) => handleNestedSettingChange('stripe', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entorno</Label>
                  <Select
                    value={settings.stripe.environment}
                    onValueChange={(value) => handleNestedSettingChange('stripe', 'environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="test">Test</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.stripe.currency}
                    onValueChange={(value) => handleNestedSettingChange('stripe', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="usd">USD</SelectItem>
                      <SelectItem value="eur">EUR</SelectItem>
                      <SelectItem value="gbp">GBP</SelectItem>
                      <SelectItem value="cad">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Publishable Key</Label>
                <Input
                  value={settings.stripe.publishableKey}
                  onChange={(e) => handleNestedSettingChange('stripe', 'publishableKey', e.target.value)}
                  placeholder="pk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Secret Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.stripeSecretKey ? 'text' : 'password'}
                    value={settings.stripe.secretKey}
                    onChange={(e) => handleNestedSettingChange('stripe', 'secretKey', e.target.value)}
                    placeholder="sk_test_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecretVisibility('stripeSecretKey')}
                  >
                    {showSecrets.stripeSecretKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.stripe.secretKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Webhook URL</Label>
                  <Input
                    value={settings.stripe.webhookUrl}
                    onChange={(e) => handleNestedSettingChange('stripe', 'webhookUrl', e.target.value)}
                    placeholder="https://tu-dominio.com/api/stripe/webhook"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Webhook Secret</Label>
                  <Input
                    value={settings.stripe.webhookSecret}
                    onChange={(e) => handleNestedSettingChange('stripe', 'webhookSecret', e.target.value)}
                    placeholder="whsec_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('stripe')}
                  disabled={!validateConfiguration('stripe')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
                <Button variant="outline">
                  <Webhook className="h-4 w-4 mr-2" />
                  Configurar Webhooks
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* PayPal Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  PayPal
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('paypal')}
                  <Switch
                    checked={settings.paypal.enabled}
                    onCheckedChange={(checked) => handleNestedSettingChange('paypal', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Entorno</Label>
                  <Select
                    value={settings.paypal.environment}
                    onValueChange={(value) => handleNestedSettingChange('paypal', 'environment', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sandbox">Sandbox</SelectItem>
                      <SelectItem value="live">Live</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Moneda</Label>
                  <Select
                    value={settings.paypal.currency}
                    onValueChange={(value) => handleNestedSettingChange('paypal', 'currency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="USD">USD</SelectItem>
                      <SelectItem value="EUR">EUR</SelectItem>
                      <SelectItem value="GBP">GBP</SelectItem>
                      <SelectItem value="CAD">CAD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Client ID</Label>
                <Input
                  value={settings.paypal.clientId}
                  onChange={(e) => handleNestedSettingChange('paypal', 'clientId', e.target.value)}
                  placeholder="AXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Client Secret</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.paypalClientSecret ? 'text' : 'password'}
                    value={settings.paypal.clientSecret}
                    onChange={(e) => handleNestedSettingChange('paypal', 'clientSecret', e.target.value)}
                    placeholder="EXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecretVisibility('paypalClientSecret')}
                  >
                    {showSecrets.paypalClientSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.paypal.clientSecret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('paypal')}
                  disabled={!validateConfiguration('paypal')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
                <Button variant="outline">
                  <Webhook className="h-4 w-4 mr-2" />
                  Configurar Webhooks
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Integrations Settings */}
        <TabsContent value="integrations" className="space-y-6">
          {/* Bank Transfer Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Transferencia Bancaria
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('bankTransfer')}
                  <Switch
                    checked={settings.bankTransfer.enabled}
                    onCheckedChange={(checked) => handleNestedSettingChange('bankTransfer', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Nombre del Banco</Label>
                  <Input
                    value={settings.bankTransfer.bankName}
                    onChange={(e) => handleNestedSettingChange('bankTransfer', 'bankName', e.target.value)}
                    placeholder="Banco Nacional"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Número de Cuenta</Label>
                  <Input
                    value={settings.bankTransfer.accountNumber}
                    onChange={(e) => handleNestedSettingChange('bankTransfer', 'accountNumber', e.target.value)}
                    placeholder="1234567890"
                  />
                </div>
              </div>
              
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>CBU/IBAN</Label>
                  <Input
                    value={settings.bankTransfer.cbu}
                    onChange={(e) => handleNestedSettingChange('bankTransfer', 'cbu', e.target.value)}
                    placeholder="1234567890123456789012"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Alias</Label>
                  <Input
                    value={settings.bankTransfer.alias}
                    onChange={(e) => handleNestedSettingChange('bankTransfer', 'alias', e.target.value)}
                    placeholder="MI.ALIAS.BANCO"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Instrucciones de Pago</Label>
                <Textarea
                  value={settings.bankTransfer.instructions}
                  onChange={(e) => handleNestedSettingChange('bankTransfer', 'instructions', e.target.value)}
                  placeholder="Instrucciones detalladas para realizar la transferencia..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Cryptocurrency Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bitcoin className="h-5 w-5" />
                  Criptomonedas
                </div>
                <div className="flex items-center gap-2">
                  {getStatusBadge('crypto')}
                  <Switch
                    checked={settings.crypto.enabled}
                    onCheckedChange={(checked) => handleNestedSettingChange('crypto', 'enabled', checked)}
                  />
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Red</Label>
                  <Select
                    value={settings.crypto.network}
                    onValueChange={(value) => handleNestedSettingChange('crypto', 'network', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mainnet">Mainnet</SelectItem>
                      <SelectItem value="testnet">Testnet</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select
                    value={settings.crypto.provider}
                    onValueChange={(value) => handleNestedSettingChange('crypto', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="coinbase">Coinbase</SelectItem>
                      <SelectItem value="binance">Binance</SelectItem>
                      <SelectItem value="custom">Personalizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Dirección de Wallet</Label>
                <Input
                  value={settings.crypto.walletAddress}
                  onChange={(e) => handleNestedSettingChange('crypto', 'walletAddress', e.target.value)}
                  placeholder="1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa"
                />
              </div>
              
              <div className="space-y-2">
                <Label>API Key</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.cryptoApiKey ? 'text' : 'password'}
                    value={settings.crypto.apiKey}
                    onChange={(e) => handleNestedSettingChange('crypto', 'apiKey', e.target.value)}
                    placeholder="xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecretVisibility('cryptoApiKey')}
                  >
                    {showSecrets.cryptoApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.crypto.apiKey)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('crypto')}
                  disabled={!validateConfiguration('crypto')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Probar Conexión
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* API Settings */}
        <TabsContent value="api" className="space-y-6">
          {/* Rate Limiting */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Límites de Velocidad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Requests por Minuto</Label>
                  <Input
                    type="number"
                    value={settings.api.rateLimit.requestsPerMinute}
                    onChange={(e) => handleDeepNestedSettingChange('api', 'rateLimit', 'requestsPerMinute', parseInt(e.target.value))}
                    min="1"
                    max="1000"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Requests por Hora</Label>
                  <Input
                    type="number"
                    value={settings.api.rateLimit.requestsPerHour}
                    onChange={(e) => handleDeepNestedSettingChange('api', 'rateLimit', 'requestsPerHour', parseInt(e.target.value))}
                    min="1"
                    max="10000"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Tiempo de Bloqueo (minutos)</Label>
                <Input
                  type="number"
                  value={settings.api.rateLimit.blockDuration}
                  onChange={(e) => handleDeepNestedSettingChange('api', 'rateLimit', 'blockDuration', parseInt(e.target.value))}
                  min="1"
                  max="1440"
                />
              </div>
            </CardContent>
          </Card>

          {/* CORS Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Configuración CORS
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Orígenes Permitidos</Label>
                <Textarea
                  value={settings.api.cors.allowedOrigins.join('\n')}
                  onChange={(e) => handleDeepNestedSettingChange('api', 'cors', 'allowedOrigins', e.target.value.split('\n').filter(Boolean))}
                  placeholder="https://mi-dominio.com\nhttps://otro-dominio.com"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Métodos Permitidos</Label>
                <Input
                  value={settings.api.cors.allowedMethods.join(', ')}
                  onChange={(e) => handleDeepNestedSettingChange('api', 'cors', 'allowedMethods', e.target.value.split(',').map(m => m.trim()).filter(Boolean))}
                  placeholder="GET, POST, PUT, DELETE"
                />
              </div>
              
              <div className="space-y-2">
                <Label>Headers Permitidos</Label>
                <Input
                  value={settings.api.cors.allowedHeaders.join(', ')}
                  onChange={(e) => handleDeepNestedSettingChange('api', 'cors', 'allowedHeaders', e.target.value.split(',').map(h => h.trim()).filter(Boolean))}
                  placeholder="Content-Type, Authorization"
                />
              </div>
            </CardContent>
          </Card>

          {/* Authentication */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Key className="h-5 w-5" />
                Autenticación API
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Tipo de Autenticación</Label>
                  <Select
                    value={settings.api.auth.type}
                    onValueChange={(value) => handleDeepNestedSettingChange('api', 'auth', 'type', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="jwt">JWT</SelectItem>
                      <SelectItem value="apikey">API Key</SelectItem>
                      <SelectItem value="oauth">OAuth 2.0</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Expiración del Token (horas)</Label>
                  <Input
                    type="number"
                    value={settings.api.auth.tokenExpiration}
                    onChange={(e) => handleDeepNestedSettingChange('api', 'auth', 'tokenExpiration', parseInt(e.target.value))}
                    min="1"
                    max="168"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label>Secreto JWT</Label>
                <div className="flex gap-2">
                  <Input
                    type={showSecrets.jwtSecret ? 'text' : 'password'}
                    value={settings.api.auth.jwtSecret}
                    onChange={(e) => handleDeepNestedSettingChange('api', 'auth', 'jwtSecret', e.target.value)}
                    placeholder="super-secret-jwt-key"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => toggleSecretVisibility('jwtSecret')}
                  >
                    {showSecrets.jwtSecret ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => copyToClipboard(settings.api.auth.jwtSecret)}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          {/* Email Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Mail className="h-5 w-5" />
                Configuración de Email
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select
                    value={settings.email.provider}
                    onValueChange={(value) => handleNestedSettingChange('email', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="smtp">SMTP</SelectItem>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Email de Remitente</Label>
                  <Input
                    type="email"
                    value={settings.email.fromEmail}
                    onChange={(e) => handleNestedSettingChange('email', 'fromEmail', e.target.value)}
                    placeholder="noreply@mi-dominio.com"
                  />
                </div>
              </div>
              
              {settings.email.provider === 'smtp' && (
                <>
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Servidor SMTP</Label>
                      <Input
                        value={settings.email.smtp.host}
                        onChange={(e) => handleDeepNestedSettingChange('email', 'smtp', 'host', e.target.value)}
                        placeholder="smtp.gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Puerto</Label>
                      <Input
                        type="number"
                        value={settings.email.smtp.port}
                        onChange={(e) => handleDeepNestedSettingChange('email', 'smtp', 'port', parseInt(e.target.value))}
                        placeholder="587"
                      />
                    </div>
                  </div>
                  
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Usuario</Label>
                      <Input
                        value={settings.email.smtp.username}
                        onChange={(e) => handleDeepNestedSettingChange('email', 'smtp', 'username', e.target.value)}
                        placeholder="usuario@gmail.com"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Contraseña</Label>
                      <div className="flex gap-2">
                        <Input
                          type={showSecrets.smtpPassword ? 'text' : 'password'}
                          value={settings.email.smtp.password}
                          onChange={(e) => handleDeepNestedSettingChange('email', 'smtp', 'password', e.target.value)}
                          placeholder="contraseña-de-aplicación"
                        />
                        <Button
                          variant="outline"
                          size="icon"
                          onClick={() => toggleSecretVisibility('smtpPassword')}
                        >
                          {showSecrets.smtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
                    </div>
                  </div>
                </>
              )}
              
              {settings.email.provider === 'sendgrid' && (
                <div className="space-y-2">
                  <Label>API Key de SendGrid</Label>
                  <div className="flex gap-2">
                    <Input
                      type={showSecrets.sendgridApiKey ? 'text' : 'password'}
                      value={settings.email.sendgrid.apiKey}
                      onChange={(e) => handleDeepNestedSettingChange('email', 'sendgrid', 'apiKey', e.target.value)}
                      placeholder="SG.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                    />
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => toggleSecretVisibility('sendgridApiKey')}
                    >
                      {showSecrets.sendgridApiKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button
                  onClick={() => testConnection('email')}
                  disabled={!validateConfiguration('email')}
                >
                  <TestTube className="h-4 w-4 mr-2" />
                  Probar Email
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Database Configuration */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="h-5 w-5" />
                Base de Datos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label>Proveedor</Label>
                  <Select
                    value={settings.database.provider}
                    onValueChange={(value) => handleNestedSettingChange('database', 'provider', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="postgresql">PostgreSQL</SelectItem>
                      <SelectItem value="mysql">MySQL</SelectItem>
                      <SelectItem value="mongodb">MongoDB</SelectItem>
                      <SelectItem value="sqlite">SQLite</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Frecuencia de Backup</Label>
                  <Select
                    value={settings.database.backupFrequency}
                    onValueChange={(value) => handleNestedSettingChange('database', 'backupFrequency', value)}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Diario</SelectItem>
                      <SelectItem value="weekly">Semanal</SelectItem>
                      <SelectItem value="monthly">Mensual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.database.encryption}
                  onCheckedChange={(checked) => handleNestedSettingChange('database', 'encryption', checked)}
                />
                <Label>Encriptación de Datos</Label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  checked={settings.database.autoBackup}
                  onCheckedChange={(checked) => handleNestedSettingChange('database', 'autoBackup', checked)}
                />
                <Label>Backup Automático</Label>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Seguridad
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Autenticación de Dos Factores</Label>
                  <p className="text-sm text-muted-foreground">
                    Agregar una capa extra de seguridad
                  </p>
                </div>
                <Switch
                  checked={settings.twoFactorAuth}
                  onCheckedChange={(checked) => handleSettingChange('twoFactorAuth', checked)}
                />
              </div>
              <div className="space-y-2">
                <Label>Tiempo de Sesión</Label>
                <Select
                  value={settings.sessionTimeout}
                  onValueChange={(value) => handleSettingChange('sessionTimeout', value)}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutos</SelectItem>
                    <SelectItem value="30">30 minutos</SelectItem>
                    <SelectItem value="60">1 hora</SelectItem>
                    <SelectItem value="120">2 horas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button variant="outline">
                <Key className="h-4 w-4 mr-2" />
                Cambiar Contraseña
              </Button>
            </CardContent>
          </Card>

          {/* Data Management */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Gestión de Datos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Exportar Datos</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Descarga tus datos financieros en varios formatos
                    </p>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4 mr-2" />
                        Exportar CSV
                      </Button>
                      <Button variant="outline" size="sm">
                        <FileText className="h-4 w-4 mr-2" />
                        Exportar PDF
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Eliminar Cuenta</h4>
                    <p className="text-sm text-muted-foreground mb-3">
                      Eliminar permanentemente tu cuenta y todos los datos
                    </p>
                    <div className="p-4 border border-destructive rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <AlertCircle className="h-4 w-4 text-destructive" />
                        <span className="text-sm font-medium text-destructive">Zona de Peligro</span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">
                        Esta acción no se puede deshacer. Todos tus datos serán eliminados permanentemente.
                      </p>
                      <Button variant="destructive" size="sm">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Eliminar Cuenta
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Save Settings */}
      <div className="flex justify-end mt-6">
        <Button size="lg" className="px-8">
          <Save className="h-4 w-4 mr-2" />
          Guardar Toda la Configuración
        </Button>
      </div>
    </div>
  );
}