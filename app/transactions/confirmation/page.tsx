'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function TransactionConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  // Obtener parámetros de la URL
  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'ARS'
  const category = searchParams.get('category') || 'General'
  const type = searchParams.get('type') || 'expense' // income, expense
  const description = searchParams.get('description') || 'Nueva transacción'
  const account = searchParams.get('account') || 'Cuenta Principal'
  const transactionId = searchParams.get('txn') || `TXN-DEMO-001`

  const getTitle = () => {
    switch (type) {
      case 'income':
        return '¡Ingreso Registrado!'
      case 'expense':
        return '¡Gasto Registrado!'
      default:
        return '¡Transacción Exitosa!'
    }
  }

  const getDescription = () => {
    switch (type) {
      case 'income':
        return `Ingreso de ${amount} ${currency} registrado en ${account}`
      case 'expense':
        return `Gasto de ${amount} ${currency} registrado en categoría ${category}`
      default:
        return description
    }
  }

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
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-emerald-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ConfirmationModal
        type="transaction"
        title={getTitle()}
        amount={amount}
        currency={currency}
        category={category}
        description={getDescription()}
        transactionId={transactionId}
        isOpen={showModal}
        onClose={handleClose}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}
