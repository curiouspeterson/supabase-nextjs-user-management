'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { format, subDays, subHours, startOfDay, endOfDay } from 'date-fns';
import { Calendar as CalendarIcon } from 'lucide-react';

interface DateRangeFilterProps {
  onRangeChange: (start: Date, end: Date) => void;
}

const presetRanges = [
  { label: 'Last 24 Hours', value: '24h' },
  { label: 'Last 7 Days', value: '7d' },
  { label: 'Last 30 Days', value: '30d' }
];

export default function DateRangeFilter({ onRangeChange }: DateRangeFilterProps) {
  const [startDate, setStartDate] = useState<Date>(subDays(new Date(), 7));
  const [endDate, setEndDate] = useState<Date>(new Date());
  const [isStartOpen, setIsStartOpen] = useState(false);
  const [isEndOpen, setIsEndOpen] = useState(false);

  const handlePresetChange = (value: string) => {
    const end = new Date();
    let start: Date;

    switch (value) {
      case '24h':
        start = subHours(end, 24);
        break;
      case '7d':
        start = subDays(end, 7);
        break;
      case '30d':
        start = subDays(end, 30);
        break;
      default:
        return;
    }

    setStartDate(start);
    setEndDate(end);
    onRangeChange(startOfDay(start), endOfDay(end));
  };

  const handleStartDateChange = (date: Date | undefined) => {
    if (date) {
      const newStart = startOfDay(date);
      if (newStart <= endDate) {
        setStartDate(newStart);
        onRangeChange(newStart, endOfDay(endDate));
      }
      setIsStartOpen(false);
    }
  };

  const handleEndDateChange = (date: Date | undefined) => {
    if (date) {
      const newEnd = endOfDay(date);
      if (newEnd >= startDate) {
        setEndDate(newEnd);
        onRangeChange(startOfDay(startDate), newEnd);
      }
      setIsEndOpen(false);
    }
  };

  return (
    <Card className="p-4">
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <Select onValueChange={handlePresetChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            {presetRanges.map((range) => (
              <SelectItem key={range.value} value={range.value}>
                {range.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="flex items-center gap-2">
          <Popover open={isStartOpen} onOpenChange={setIsStartOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(startDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={startDate}
                onSelect={handleStartDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>

          <span className="text-sm text-gray-500">to</span>

          <Popover open={isEndOpen} onOpenChange={setIsEndOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-[180px] justify-start text-left font-normal"
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {format(endDate, 'PPP')}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={endDate}
                onSelect={handleEndDateChange}
                initialFocus
              />
            </PopoverContent>
          </Popover>
        </div>
      </div>

      <div className="mt-2 text-sm text-gray-500">
        Showing data from{' '}
        <span className="font-medium">
          {format(startDate, 'PPP')}
        </span>{' '}
        to{' '}
        <span className="font-medium">
          {format(endDate, 'PPP')}
        </span>
      </div>
    </Card>
  );
} 