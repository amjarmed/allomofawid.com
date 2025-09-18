'use client'

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Icon, IconName } from "@/components/ui/icon";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

interface StatsCardProps {
  title: string
  value: number | string
  icon: IconName
  trend?: {
    value: number
    isPositive: boolean
  }
  isLoading?: boolean
  colorVariant?: 'default' | 'success' | 'warning' | 'error'
  formatter?: (value: number) => string
}

export function StatsCard({
  title,
  value,
  icon,
  trend,
  isLoading = false,
  colorVariant = 'default',
  formatter = (val) => val.toLocaleString()
}: StatsCardProps) {
  const variantStyles = {
    default: 'text-foreground',
    success: 'text-green-600',
    warning: 'text-yellow-600',
    error: 'text-red-600'
  }

  if (isLoading) {
    return (
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">
            <Skeleton className="h-4 w-[100px]" />
          </CardTitle>
          <Skeleton className="h-4 w-4" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-7 w-[120px]" />
          {trend && <Skeleton className="mt-2 h-4 w-[80px]" />}
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        <Icon
          name={icon}
          className={cn("h-4 w-4", variantStyles[colorVariant])}
        />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {typeof value === 'number' ? formatter(value) : value}
        </div>
        {trend && (
          <p className={cn(
            "mt-2 text-xs",
            trend.isPositive ? "text-green-600" : "text-red-600"
          )}>
            <span className="flex items-center gap-1">
              <Icon
                name={trend.isPositive ? "trending-up" : "trending-down"}
                className="h-3 w-3"
              />
              {trend.value}% from last period
            </span>
          </p>
        )}
      </CardContent>
    </Card>
  )
}
