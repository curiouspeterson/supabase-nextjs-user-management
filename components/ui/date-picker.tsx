import { forwardRef } from 'react'
import { format } from 'date-fns'
import { Calendar as CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'

export interface DatePickerProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string
}

export const DatePicker = forwardRef<HTMLInputElement, DatePickerProps>(
  ({ className, error, ...props }, ref) => {
    const [date, setDate] = React.useState<Date>()

    return (
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            className={cn(
              'w-full justify-start text-left font-normal',
              !date && 'text-muted-foreground',
              error && 'border-red-500',
              className
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date ? format(date, 'PPP') : <span>Pick a date</span>}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={date}
            onSelect={setDate}
            initialFocus
          />
        </PopoverContent>
        {error && (
          <p className="mt-1 text-sm text-red-500">{error}</p>
        )}
      </Popover>
    )
  }
)

DatePicker.displayName = 'DatePicker' 