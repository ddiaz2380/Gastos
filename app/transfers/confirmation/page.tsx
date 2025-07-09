'use client'

import { useSearchParams } from 'next/navigation'
import { useState } from 'react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function TransferConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  // Obtener parámetros de la URL
  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'ARS'
  const fromAccount = searchParams.get('from') || 'Cuenta Principal'
  const toAccount = searchParams.get('to') || 'Cuenta Destino'
  const description = searchParams.get('description') || 'Transferencia bancaria'
  const transactionId = searchParams.get('txn') || `TXN-DEMO-001`

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push('/transactions')
    }, 300)
  }

  const handleViewDetails = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push(`/transactions?highlight=${transactionId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ConfirmationModal
        type="transfer"
        title="¡Transferencia Exitosa!"
        amount={amount}
        currency={currency}
        fromAccount={fromAccount}
        toAccount={toAccount}
        description={description}
        transactionId={transactionId}
        isOpen={showModal}
        onClose={handleClose}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}
