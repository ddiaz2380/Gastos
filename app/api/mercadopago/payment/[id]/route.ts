import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: paymentId } = await params;

    if (!paymentId) {
      return NextResponse.json(
        { error: 'ID de pago requerido' },
        { status: 400 }
      );
    }

    // En producción, aquí consultarías el estado real del pago:
    /*
    import { MercadoPagoConfig, Payment } from 'mercadopago';
    
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    const result = await payment.get({ id: paymentId });
    */

    // Simulación de respuesta
    const mockPaymentStatus = {
      id: paymentId,
      status: Math.random() > 0.5 ? 'approved' : 'pending',
      status_detail: 'accredited',
      transaction_amount: 100.00,
      description: 'Pago de prueba',
      date_created: new Date().toISOString(),
      date_approved: new Date().toISOString(),
      payer: {
        email: 'user@example.com',
      },
      payment_method: {
        id: 'visa',
        type: 'credit_card',
      }
    };

    return NextResponse.json({
      success: true,
      payment: mockPaymentStatus,
    });

  } catch (error) {
    console.error('Error getting MercadoPago payment status:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}