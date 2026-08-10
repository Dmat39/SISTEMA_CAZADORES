import * as React from "react"
import { cva } from "class-variance-authority"

import { cn } from "../../lib/utils"

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2",
  {
    variants: {
      variant: {
        default:
          "border-transparent bg-gray-900 dark:bg-orange-500 text-white hover:bg-gray-700 dark:hover:bg-orange-400",
        secondary:
          "border-transparent bg-[#f0e6d0] dark:bg-gray-800 text-[#7a6a52] dark:text-gray-300 hover:bg-[#e8dfc8] dark:hover:bg-gray-700",
        destructive:
          "border-transparent bg-red-500 text-white hover:bg-red-600",
        outline:
          "border-[#e8dfc8] dark:border-gray-700 text-[#3d2f1f] dark:text-white",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
)

function Badge({ className, variant, ...props }) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  )
}

export { Badge, badgeVariants }
