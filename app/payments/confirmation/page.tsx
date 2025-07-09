'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function PaymentConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  // Obtener parámetros de la URL
  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'ARS'
  const category = searchParams.get('category') || 'Servicios'
  const description = searchParams.get('description') || 'Pago de servicio'
  const paymentMethod = searchParams.get('method') || 'Tarjeta de Crédito'
  const transactionId = searchParams.get('txn') || `PAY-DEMO-001`

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push('/payments')
    }, 300)
  }

  const handleViewDetails = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push(`/payments?highlight=${transactionId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-pink-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ConfirmationModal
        type="payment"
        title="¡Pago Procesado!"
        amount={amount}
        currency={currency}
        category={category}
        description={description}
        transactionId={transactionId}
        isOpen={showModal}
        onClose={handleClose}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}
