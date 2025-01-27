import React from 'react';
import { cn } from '@/lib/utils';
import { ShiftPattern } from '@/services/scheduler/types';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';

interface PatternVisualizerProps {
  pattern: ShiftPattern;
  className?: string;
}

const PatternVisualizer: React.FC<PatternVisualizerProps> = ({
  pattern,
  className,
}) => {
  // Convert pattern string to array of days (0 = off, 1 = on)
  const days = pattern.pattern.split('').map(Number);
  
  // Calculate number of weeks to display
  const weeks = Math.ceil(pattern.length / 7);
  
  return (
    <Card className={cn('p-4', className)}>
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">{pattern.name}</h3>
          <Badge variant={pattern.is_forbidden ? 'destructive' : 'default'}>
            {pattern.pattern_type}
          </Badge>
        </div>
        
        <div className="grid gap-2">
          {Array.from({ length: weeks }).map((_, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {Array.from({ length: 7 }).map((_, dayIndex) => {
                const dayNum = weekIndex * 7 + dayIndex;
                const isActive = dayNum < pattern.length && days[dayNum] === 1;
                
                return (
                  <div
                    key={dayIndex}
                    className={cn(
                      'h-8 rounded-md flex items-center justify-center text-sm',
                      isActive
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted text-muted-foreground',
                      dayNum >= pattern.length && 'opacity-25'
                    )}
                    aria-label={`Day ${dayNum + 1}: ${isActive ? 'On' : 'Off'}`}
                  >
                    {isActive ? pattern.shift_duration : '-'}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span>{pattern.days_on} days on</span>
          <span>{pattern.days_off} days off</span>
        </div>
      </div>
    </Card>
  );
};

export default PatternVisualizer; 