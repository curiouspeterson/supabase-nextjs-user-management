"use client"

import * as React from "react"
import * as CheckboxPrimitive from "@radix-ui/react-checkbox"
import { Check, Minus } from "lucide-react"

import { cn } from "@/lib/utils"

type CheckedState = boolean | 'indeterminate'

const Checkbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
    indeterminate?: boolean
  }
>(({ className, indeterminate, checked, defaultChecked, ...props }, ref) => {
  const [isIndeterminate, setIsIndeterminate] = React.useState(indeterminate)
  const [isChecked, setIsChecked] = React.useState<CheckedState>(checked ?? defaultChecked ?? false)

  React.useEffect(() => {
    setIsIndeterminate(indeterminate)
  }, [indeterminate])

  React.useEffect(() => {
    if (checked === undefined && defaultChecked === undefined) {
      setIsChecked(false)
    } else {
      setIsChecked(checked ?? defaultChecked ?? false)
    }
  }, [checked, defaultChecked])

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (checked === undefined) {
      setIsChecked(!isChecked)
    }
    props.onClick?.(e)
  }

  return (
    <CheckboxPrimitive.Root
      ref={ref}
      className={cn(
        "peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground",
        className
      )}
      checked={isChecked === true}
      onCheckedChange={(checked) => {
        if (props.onCheckedChange) {
          props.onCheckedChange(checked)
        }
        if (checked !== undefined && checked !== null) {
          setIsChecked(checked)
        }
      }}
      onClick={handleClick}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          e.currentTarget.click()
        }
        props.onKeyDown?.(e)
      }}
      data-state={isIndeterminate ? 'indeterminate' : isChecked ? 'checked' : 'unchecked'}
      aria-checked={isIndeterminate ? 'mixed' : isChecked ? 'true' : 'false'}
      {...props}
    >
      <CheckboxPrimitive.Indicator
        className={cn("flex items-center justify-center text-current")}
      >
        {isIndeterminate ? (
          <Minus className="h-4 w-4" />
        ) : (
          <Check className="h-4 w-4" />
        )}
      </CheckboxPrimitive.Indicator>
    </CheckboxPrimitive.Root>
  )
})
Checkbox.displayName = CheckboxPrimitive.Root.displayName

export { Checkbox } 