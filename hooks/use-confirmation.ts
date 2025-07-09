'use client'

import { useRouter } from 'next/navigation'

interface ConfirmationParams {
  amount?: string
  currency?: string
  category?: string
  description?: string
  from?: string
  to?: string
  method?: string
  goal?: string
  action?: string
  period?: string
  type?: string
  account?: string
  id?: string
}

export function useConfirmation() {
  const router = useRouter()

  const showTransferConfirmation = (params: ConfirmationParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.amount) searchParams.set('amount', params.amount)
    if (params.currency) searchParams.set('currency', params.currency)
    if (params.from) searchParams.set('from', params.from)
    if (params.to) searchParams.set('to', params.to)
    if (params.description) searchParams.set('description', params.description)
    if (params.id) searchParams.set('txn', params.id)

    router.push(`/transfers/confirmation?${searchParams.toString()}`)
  }

  const showPaymentConfirmation = (params: ConfirmationParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.amount) searchParams.set('amount', params.amount)
    if (params.currency) searchParams.set('currency', params.currency)
    if (params.category) searchParams.set('category', params.category)
    if (params.description) searchParams.set('description', params.description)
    if (params.method) searchParams.set('method', params.method)
    if (params.id) searchParams.set('txn', params.id)

    router.push(`/payments/confirmation?${searchParams.toString()}`)
  }

  const showGoalConfirmation = (params: ConfirmationParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.amount) searchParams.set('amount', params.amount)
    if (params.currency) searchParams.set('currency', params.currency)
    if (params.goal) searchParams.set('goal', params.goal)
    if (params.action) searchParams.set('action', params.action)
    if (params.description) searchParams.set('description', params.description)
    if (params.id) searchParams.set('id', params.id)

    router.push(`/goals/confirmation?${searchParams.toString()}`)
  }

  const showBudgetConfirmation = (params: ConfirmationParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.amount) searchParams.set('amount', params.amount)
    if (params.currency) searchParams.set('currency', params.currency)
    if (params.category) searchParams.set('category', params.category)
    if (params.action) searchParams.set('action', params.action)
    if (params.period) searchParams.set('period', params.period)
    if (params.description) searchParams.set('description', params.description)
    if (params.id) searchParams.set('id', params.id)

    router.push(`/budget/confirmation?${searchParams.toString()}`)
  }

  const showTransactionConfirmation = (params: ConfirmationParams) => {
    const searchParams = new URLSearchParams()
    
    if (params.amount) searchParams.set('amount', params.amount)
    if (params.currency) searchParams.set('currency', params.currency)
    if (params.category) searchParams.set('category', params.category)
    if (params.type) searchParams.set('type', params.type)
    if (params.description) searchParams.set('description', params.description)
    if (params.account) searchParams.set('account', params.account)
    if (params.id) searchParams.set('txn', params.id)

    router.push(`/transactions/confirmation?${searchParams.toString()}`)
  }

  return {
    showTransferConfirmation,
    showPaymentConfirmation,
    showGoalConfirmation,
    showBudgetConfirmation,
    showTransactionConfirmation
  }
}
