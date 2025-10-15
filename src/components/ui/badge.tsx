import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-base border-2 px-2.5 py-0.5 text-xs font-heading transition-all focus:outline-none focus:ring-2 focus:ring-main",
  {
    variants: {
      variant: {
        default:
          "border-border bg-main text-black shadow-[2px_2px_0px_0px_#000]",
        secondary:
          "border-border bg-secondary text-secondary-foreground shadow-[2px_2px_0px_0px_#000]",
        destructive:
          "border-border bg-destructive text-destructive-foreground shadow-[2px_2px_0px_0px_#000]",
        outline: "text-foreground border-border",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
