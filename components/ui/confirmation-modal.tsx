"use client";

import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  CheckCircle2, 
  ArrowRight, 
  Calendar, 
  Clock,
  CreditCard,
  Banknote,
  DollarSign,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  X
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CheckmarkProps {
  size?: number;
  strokeWidth?: number;
  color?: string;
  className?: string;
}

export function AnimatedCheckmark({ 
  size = 100, 
  strokeWidth = 2, 
  color = "rgb(16 185 129)", 
  className = "" 
}: CheckmarkProps) {
  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        viewBox="0 0 100 100"
        className="animate-zoom-in-bounce"
      >
        <title>Animated Checkmark</title>
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          fill="transparent"
          className="animate-circle-draw"
          style={{
            strokeDasharray: "251",
            strokeDashoffset: "251"
          }}
        />
        <path
          d="M30 50L45 65L70 35"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="transparent"
          className="animate-check-draw"
          style={{
            strokeDasharray: "50",
            strokeDashoffset: "50",
            animationDelay: "0.5s"
          }}
        />
      </svg>
    </div>
  );
}

interface ConfirmationModalProps {
  type: "transfer" | "payment" | "transaction" | "goal" | "budget";
  title: string;
  amount: string;
  currency: string;
  fromAccount?: string;
  toAccount?: string;
  category?: string;
  description?: string;
  transactionId?: string;
  onClose?: () => void;
  onViewDetails?: () => void;
  isOpen?: boolean;
}

export function ConfirmationModal({
  type,
  title,
  amount,
  currency,
  fromAccount,
  toAccount,
  category,
  description,
  transactionId,
  onClose,
  onViewDetails,
  isOpen = true
}: ConfirmationModalProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => setIsVisible(true), 100);
    }
  }, [isOpen]);

  const getIcon = () => {
    switch (type) {
      case "transfer":
        return <ArrowRight className="w-5 h-5" />;
      case "payment":
        return <CreditCard className="w-5 h-5" />;
      case "transaction":
        return <Banknote className="w-5 h-5" />;
      case "goal":
        return <TrendingUp className="w-5 h-5" />;
      case "budget":
        return <DollarSign className="w-5 h-5" />;
      default:
        return <CheckCircle2 className="w-5 h-5" />;
    }
  };

  const getTypeColor = () => {
    switch (type) {
      case "transfer":
        return "text-blue-600";
      case "payment":
        return "text-purple-600";
      case "transaction":
        return "text-green-600";
      case "goal":
        return "text-orange-600";
      case "budget":
        return "text-indigo-600";
      default:
        return "text-green-600";
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(() => {
      onClose?.();
    }, 200);
  };

  if (!isOpen) return null;

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm transition-all duration-300",
      isVisible ? "opacity-100" : "opacity-0"
    )}>
      <Card className={cn(
        "w-full max-w-md mx-4 p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-2xl transition-all duration-500 ease-out",
        isVisible ? "scale-100 translate-y-0" : "scale-95 translate-y-4"
      )}>
        <CardContent className="space-y-6 flex flex-col items-center justify-center p-0">
          {/* Close Button */}
          <div className="absolute top-4 right-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="h-8 w-8 p-0 hover:bg-slate-100 dark:hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Animated Checkmark */}
          <div className="flex justify-center animate-zoom-in-bounce">
            <div className="relative">
              <div className="absolute inset-0 blur-xl bg-emerald-500/20 dark:bg-emerald-500/30 rounded-full animate-success-glow" />
              <AnimatedCheckmark
                size={80}
                strokeWidth={4}
                color="rgb(16 185 129)"
                className="relative z-10"
              />
            </div>
          </div>

          {/* Title and Success Message */}
          <div className="space-y-2 text-center w-full animate-slide-up-fade animation-delay-300">
            <h2 className="text-xl font-semibold text-slate-900 dark:text-slate-100 tracking-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Operación completada exitosamente
            </p>
          </div>

          {/* Transaction Details */}
          <div className="w-full bg-slate-50 dark:bg-slate-800/50 rounded-xl p-4 border border-slate-200 dark:border-slate-700 backdrop-blur-md animate-slide-up-fade animation-delay-450">
            <div className="space-y-3">
              {/* Amount */}
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-slate-600 dark:text-slate-400">
                  Monto
                </span>
                <div className="flex items-center gap-2">
                  <span className={cn("text-lg font-bold", getTypeColor())}>
                    {amount} {currency}
                  </span>
                  {type === "transaction" && (
                    <ArrowUpRight className="w-4 h-4 text-green-500" />
                  )}
                </div>
              </div>

              {/* Transfer specific details */}
              {type === "transfer" && fromAccount && toAccount && (
                <>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3 h-3" />
                        Desde
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {fromAccount}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                        <ArrowDownLeft className="w-3 h-3" />
                        Hacia
                      </span>
                      <span className="text-sm font-medium text-slate-900 dark:text-slate-100">
                        {toAccount}
                      </span>
                    </div>
                  </div>
                </>
              )}

              {/* Category for payments/transactions */}
              {category && (
                <>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Categoría
                    </span>
                    <Badge variant="outline" className="text-xs">
                      {category}
                    </Badge>
                  </div>
                </>
              )}

              {/* Description */}
              {description && (
                <>
                  <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm text-slate-600 dark:text-slate-400">
                      Descripción
                    </span>
                    <span className="text-sm text-slate-900 dark:text-slate-100 text-right max-w-[60%]">
                      {description}
                    </span>
                  </div>
                </>
              )}

              {/* Timestamp */}
              <div className="w-full h-px bg-slate-200 dark:bg-slate-700" />
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 dark:text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Fecha
                </span>
                <span className="text-sm text-slate-900 dark:text-slate-100">
                  {new Date().toLocaleDateString('es-ES', {
                    day: '2-digit',
                    month: '2-digit',
                    year: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Transaction ID */}
              {transactionId && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    ID
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded">
                    {transactionId}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 w-full animate-slide-up-fade" style={{ animationDelay: '600ms' }}>
            {onViewDetails && (
              <Button 
                variant="outline" 
                onClick={onViewDetails}
                className="flex-1"
              >
                Ver Detalles
              </Button>
            )}
            <Button 
              onClick={handleClose}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              Continuar
            </Button>
          </div>

          {/* Type indicator */}
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 animate-slide-up-fade" style={{ animationDelay: '750ms' }}>
            {getIcon()}
            <span className="capitalize">{type}</span>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

export default ConfirmationModal;
