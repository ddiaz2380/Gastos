export interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string;
  date: string;
  tags: string[];
  recurring?: boolean;
  recurringFrequency?: 'weekly' | 'monthly' | 'yearly';
  receiptUrl?: string;
}

export interface Budget {
  id: string;
  category: string;
  allocated: number;
  spent: number;
  period: 'monthly' | 'yearly';
  color: string;
}

export interface Goal {
  id: string;
  title: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'low' | 'medium' | 'high';
  category: string;
}

export interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit' | 'investment';
  balance: number;
  currency: string;
}

export const mockTransactions: Transaction[] = [
  {
    id: '1',
    type: 'expense',
    amount: 85.50,
    category: 'Food & Dining',
    description: 'Grocery shopping at Whole Foods',
    date: '2024-01-15',
    tags: ['groceries', 'essential'],
  },
  {
    id: '2',
    type: 'income',
    amount: 3500.00,
    category: 'Salary',
    description: 'Monthly salary',
    date: '2024-01-01',
    tags: ['salary', 'primary-income'],
    recurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: '3',
    type: 'expense',
    amount: 1200.00,
    category: 'Housing',
    description: 'Monthly rent payment',
    date: '2024-01-01',
    tags: ['rent', 'housing'],
    recurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: '4',
    type: 'expense',
    amount: 45.99,
    category: 'Entertainment',
    description: 'Netflix subscription',
    date: '2024-01-10',
    tags: ['streaming', 'subscription'],
    recurring: true,
    recurringFrequency: 'monthly',
  },
  {
    id: '5',
    type: 'expense',
    amount: 120.00,
    category: 'Transportation',
    description: 'Gas and car maintenance',
    date: '2024-01-12',
    tags: ['car', 'fuel'],
  },
  {
    id: '6',
    type: 'income',
    amount: 500.00,
    category: 'Freelance',
    description: 'Web development project',
    date: '2024-01-08',
    tags: ['freelance', 'side-income'],
  },
];

export const mockBudgets: Budget[] = [
  {
    id: '1',
    category: 'Food & Dining',
    allocated: 600,
    spent: 385.50,
    period: 'monthly',
    color: '#3B82F6',
  },
  {
    id: '2',
    category: 'Housing',
    allocated: 1500,
    spent: 1200,
    period: 'monthly',
    color: '#10B981',
  },
  {
    id: '3',
    category: 'Transportation',
    allocated: 300,
    spent: 120,
    period: 'monthly',
    color: '#8B5CF6',
  },
  {
    id: '4',
    category: 'Entertainment',
    allocated: 200,
    spent: 145.99,
    period: 'monthly',
    color: '#F59E0B',
  },
  {
    id: '5',
    category: 'Healthcare',
    allocated: 250,
    spent: 0,
    period: 'monthly',
    color: '#EF4444',
  },
];

export const mockGoals: Goal[] = [
  {
    id: '1',
    title: 'Emergency Fund',
    targetAmount: 10000,
    currentAmount: 6500,
    deadline: '2024-12-31',
    priority: 'high',
    category: 'Savings',
  },
  {
    id: '2',
    title: 'Vacation to Europe',
    targetAmount: 5000,
    currentAmount: 2300,
    deadline: '2024-08-15',
    priority: 'medium',
    category: 'Travel',
  },
  {
    id: '3',
    title: 'New Laptop',
    targetAmount: 2500,
    currentAmount: 1800,
    deadline: '2024-06-01',
    priority: 'low',
    category: 'Technology',
  },
];

export const mockAccounts: Account[] = [
  {
    id: '1',
    name: 'Main Checking',
    type: 'checking',
    balance: 4250.75,
    currency: 'USD',
  },
  {
    id: '2',
    name: 'High Yield Savings',
    type: 'savings',
    balance: 12500.00,
    currency: 'USD',
  },
  {
    id: '3',
    name: 'Credit Card',
    type: 'credit',
    balance: -850.25,
    currency: 'USD',
  },
  {
    id: '4',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 25000.00,
    currency: 'USD',
  },
];

export const categories = [
  'Food & Dining',
  'Housing',
  'Transportation',
  'Entertainment',
  'Healthcare',
  'Shopping',
  'Utilities',
  'Education',
  'Travel',
  'Insurance',
  'Investments',
  'Salary',
  'Freelance',
  'Business',
  'Other',
];

export const getMonthlySpending = () => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  return months.map(month => ({
    month,
    income: Math.floor(Math.random() * 2000) + 3000,
    expenses: Math.floor(Math.random() * 1500) + 2000,
  }));
};

export const getCategorySpending = () => {
  return [
    { category: 'Housing', amount: 1200, color: '#3B82F6' },
    { category: 'Food & Dining', amount: 385, color: '#10B981' },
    { category: 'Transportation', amount: 120, color: '#8B5CF6' },
    { category: 'Entertainment', amount: 146, color: '#F59E0B' },
    { category: 'Healthcare', amount: 85, color: '#EF4444' },
    { category: 'Shopping', amount: 230, color: '#06B6D4' },
  ];
};