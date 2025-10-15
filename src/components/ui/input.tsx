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
          "flex h-11 w-full rounded-base border-2 border-border bg-bg px-4 py-3 text-sm text-text font-base shadow-shadow placeholder:text-text/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-main focus-visible:border-main disabled:cursor-not-allowed disabled:opacity-50 transition-all file:border-0 file:bg-transparent file:text-sm file:font-medium dark:bg-darkBg dark:text-darkText",
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
