'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function BudgetConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  // Obtener parámetros de la URL
  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'ARS'
  const category = searchParams.get('category') || 'General'
  const action = searchParams.get('action') || 'updated' // created, updated, exceeded
  const period = searchParams.get('period') || 'Mensual'
  const description = searchParams.get('description') || 'Presupuesto actualizado'
  const budgetId = searchParams.get('id') || `BUDGET-DEMO-001`

  const getTitle = () => {
    switch (action) {
      case 'created':
        return '¡Presupuesto Creado!'
      case 'updated':
        return '¡Presupuesto Actualizado!'
      case 'exceeded':
        return '⚠️ Presupuesto Excedido'
      default:
        return '¡Presupuesto Actualizado!'
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'created':
        return `Nuevo presupuesto para ${category} creado exitosamente`
      case 'updated':
        return `Presupuesto de ${category} actualizado para el período ${period}`
      case 'exceeded':
        return `El presupuesto de ${category} ha sido excedido. Revisa tus gastos.`
      default:
        return description
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push('/budget')
    }, 300)
  }

  const handleViewDetails = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push(`/budget?highlight=${budgetId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ConfirmationModal
        type="budget"
        title={getTitle()}
        amount={amount}
        currency={currency}
        category={category}
        description={getDescription()}
        transactionId={budgetId}
        isOpen={showModal}
        onClose={handleClose}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}
