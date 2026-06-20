import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { formatCurrency, formatNumber } from '@/lib/utils'
import { cn } from '@/lib/utils'

interface StatCardProps {
  label: string
  value: number | string
  unit?: string
  change?: number
  trend?: 'up' | 'down' | 'neutral'
  icon?: React.ReactNode
  color?: string
  isCurrency?: boolean
}

export default function StatCard({ label, value, unit, change, trend, icon, color = 'primary', isCurrency }: StatCardProps) {
  const displayValue = isCurrency
    ? formatCurrency(typeof value === 'string' ? parseFloat(value) : value)
    : typeof value === 'number' ? formatNumber(value) : value

  return (
    <div className="stat-card animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{label}</p>
          <p className="text-2xl font-bold text-gray-900 mt-1">{displayValue}</p>
          {unit && <span className="text-xs text-gray-400">{unit}</span>}
        </div>
        {icon && (
          <div className={cn(
            'w-11 h-11 rounded-xl flex items-center justify-center text-white shadow-sm flex-shrink-0',
            color === 'primary' && 'bg-gradient-to-br from-primary-500 to-primary-700',
            color === 'green' && 'bg-gradient-to-br from-emerald-500 to-emerald-700',
            color === 'orange' && 'bg-gradient-to-br from-orange-500 to-orange-700',
            color === 'red' && 'bg-gradient-to-br from-red-500 to-red-700',
            color === 'purple' && 'bg-gradient-to-br from-purple-500 to-purple-700',
            color === 'blue' && 'bg-gradient-to-br from-blue-500 to-blue-700',
          )}>
            {icon}
          </div>
        )}
      </div>
      {change !== undefined && (
        <div className={cn(
          'flex items-center gap-1 text-xs font-medium',
          trend === 'up' ? 'text-emerald-600' : trend === 'down' ? 'text-red-500' : 'text-gray-400'
        )}>
          {trend === 'up' ? <TrendingUp size={12} /> : trend === 'down' ? <TrendingDown size={12} /> : <Minus size={12} />}
          <span>{Math.abs(change).toFixed(1)}% vs last month</span>
        </div>
      )}
    </div>
  )
}
