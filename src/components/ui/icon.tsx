import {
    Activity,
    CheckCircle,
    LayoutDashboard,
    LogOut,
    LucideIcon, LucideProps,
    MessageSquare,
    Settings,
    TrendingDown,
    TrendingUp,
    Upload,
    Users
} from 'lucide-react'

export type IconName = 'dashboard' | 'check-circle' | 'users' | 'settings' | 'logout' | 'trending-up' | 'trending-down' | 'upload' | 'message' | 'activity'

interface IconProps extends LucideProps {
  name: IconName
}

const iconMap: Record<IconName, LucideIcon> = {
  'dashboard': LayoutDashboard,
  'check-circle': CheckCircle,
  'users': Users,
  'settings': Settings,
  'logout': LogOut,
  'trending-up': TrendingUp,
  'trending-down': TrendingDown,
  'upload': Upload,
  'message': MessageSquare,
  'activity': Activity
}

export function Icon({ name, ...props }: IconProps) {
  const IconComponent = iconMap[name]
  return <IconComponent {...props} />
}
