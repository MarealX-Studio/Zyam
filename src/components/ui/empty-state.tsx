import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const emptyStateVariants = cva(
  "flex flex-col items-center justify-center text-center p-8 rounded-xl transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-muted/30 border border-dashed border-muted-foreground/20",
        modern: "bg-gradient-to-br from-muted/30 to-accent/20 border border-muted-foreground/10 shadow-lg",
        minimal: "bg-transparent",
        glass: "glass backdrop-blur-lg"
      },
      size: {
        sm: "p-6 min-h-32",
        default: "p-8 min-h-48",
        lg: "p-12 min-h-64"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
)

export interface EmptyStateProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof emptyStateVariants> {
  icon?: React.ComponentType<{ className?: string }>
  title?: string
  description?: string
  action?: React.ReactNode
}

const EmptyState = React.forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ className, variant, size, icon: Icon, title, description, action, children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(emptyStateVariants({ variant, size, className }))}
        {...props}
      >
        <div className="animate-fade-in space-y-4">
          {Icon && (
            <div className="animate-scale-in" style={{ animationDelay: '100ms' }}>
              <Icon className="size-16 text-muted-foreground/60 hover:text-muted-foreground transition-colors duration-300" />
            </div>
          )}
          
          {title && (
            <div className="animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-semibold text-foreground">{title}</h3>
            </div>
          )}
          
          {description && (
            <div className="animate-slide-up" style={{ animationDelay: '300ms' }}>
              <p className="text-sm text-muted-foreground max-w-md leading-relaxed">{description}</p>
            </div>
          )}
          
          {action && (
            <div className="animate-slide-up" style={{ animationDelay: '400ms' }}>
              {action}
            </div>
          )}
          
          {children && (
            <div className="animate-slide-up" style={{ animationDelay: '500ms' }}>
              {children}
            </div>
          )}
        </div>
      </div>
    )
  }
)
EmptyState.displayName = "EmptyState"

export { EmptyState, emptyStateVariants }