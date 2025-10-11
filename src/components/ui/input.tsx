import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-11 w-full rounded-xl border-2 border-brand-base-300 bg-brand-base-100/80 backdrop-blur-sm px-4 py-3 text-sm text-brand-primary ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-brand-primary/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-primary/30 focus-visible:border-brand-primary disabled:cursor-not-allowed disabled:opacity-50 transition-all shadow-sm hover:shadow-md",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }
