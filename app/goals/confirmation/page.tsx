'use client'

import { useSearchParams } from 'next/navigation'
import { useState, useEffect } from 'react'
import { ConfirmationModal } from '@/components/ui/confirmation-modal'
import { useRouter } from 'next/navigation'

export default function GoalConfirmation() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const [showModal, setShowModal] = useState(true)

  // Obtener parámetros de la URL
  const amount = searchParams.get('amount') || '0'
  const currency = searchParams.get('currency') || 'ARS'
  const goalName = searchParams.get('goal') || 'Meta de Ahorro'
  const action = searchParams.get('action') || 'created' // created, updated, achieved
  const description = searchParams.get('description') || 'Progreso en meta financiera'
  const goalId = searchParams.get('id') || `GOAL-DEMO-001`

  const getTitle = () => {
    switch (action) {
      case 'created':
        return '¡Meta Creada!'
      case 'updated':
        return '¡Meta Actualizada!'
      case 'achieved':
        return '¡Meta Alcanzada!'
      default:
        return '¡Meta Actualizada!'
    }
  }

  const getDescription = () => {
    switch (action) {
      case 'created':
        return `Nueva meta "${goalName}" creada exitosamente`
      case 'updated':
        return `Progreso actualizado en "${goalName}"`
      case 'achieved':
        return `¡Felicitaciones! Has alcanzado "${goalName}"`
      default:
        return description
    }
  }

  const handleClose = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push('/goals')
    }, 300)
  }

  const handleViewDetails = () => {
    setShowModal(false)
    setTimeout(() => {
      router.push(`/goals?highlight=${goalId}`)
    }, 300)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-yellow-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 flex items-center justify-center p-4">
      <ConfirmationModal
        type="goal"
        title={getTitle()}
        amount={amount}
        currency={currency}
        category={goalName}
        description={getDescription()}
        transactionId={goalId}
        isOpen={showModal}
        onClose={handleClose}
        onViewDetails={handleViewDetails}
      />
    </div>
  )
}
