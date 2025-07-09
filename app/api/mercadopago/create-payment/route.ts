import { NextRequest, NextResponse } from 'next/server';

// Simulación de endpoint para Mercado Pago
// En producción, aquí integrarías con la SDK oficial de Mercado Pago

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { amount, description, paymentMethodId, payerEmail } = body;

    // Validación básica
    if (!amount || !description || !paymentMethodId || !payerEmail) {
      return NextResponse.json(
        { error: 'Faltan datos requeridos' },
        { status: 400 }
      );
    }

    // En producción, aquí usarías la SDK de Mercado Pago:
    /*
    import { MercadoPagoConfig, Payment } from 'mercadopago';
    
    const client = new MercadoPagoConfig({ 
      accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN 
    });
    const payment = new Payment(client);

    const requestOptions = {
      body: {
        transaction_amount: amount,
        description: description,
        payment_method_id: paymentMethodId,
        payer: {
          email: payerEmail,
        },
      }
    };

    const result = await payment.create(requestOptions);
    */

    // Simulación de respuesta exitosa
    const mockPayment = {
      id: `mp_${Date.now()}`,
      status: 'pending',
      status_detail: 'pending_waiting_payment',
      transaction_amount: amount,
      description: description,
      payment_method_id: paymentMethodId,
      date_created: new Date().toISOString(),
      payer: {
        email: payerEmail,
      },
      // Para PIX y Boleto, se incluirían datos adicionales
      ...(paymentMethodId === 'pix' && {
        point_of_interaction: {
          transaction_data: {
            qr_code: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
            qr_code_base64: 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
          }
        }
      }),
      ...(paymentMethodId === 'boleto' && {
        transaction_details: {
          external_resource_url: 'https://www.mercadopago.com.ar/payments/123456789/ticket?caller_id=123456&hash=abc123',
        }
      })
    };

    return NextResponse.json({
      success: true,
      payment: mockPayment,
    });

  } catch (error) {
    console.error('Error creating MercadoPago payment:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'MercadoPago API endpoint - Use POST to create payments'
  });
}