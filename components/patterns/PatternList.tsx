'use client';

import React, { useState } from 'react';
import { ShiftPattern } from '@/services/scheduler/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Plus, Edit, Trash2 } from 'lucide-react';
import PatternEditor from './PatternEditor';
import PatternVisualizer from './PatternVisualizer';

interface PatternListProps {
  patterns: ShiftPattern[];
  onPatternCreate: (pattern: ShiftPattern) => void;
  onPatternUpdate: (pattern: ShiftPattern) => void;
  onPatternDelete: (patternId: string) => void;
}

type SortField = 'name' | 'days_on' | 'shift_duration';
type SortOrder = 'asc' | 'desc';

const PatternList: React.FC<PatternListProps> = ({
  patterns,
  onPatternCreate,
  onPatternUpdate,
  onPatternDelete,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [sortField, setSortField] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');
  const [selectedPattern, setSelectedPattern] = useState<ShiftPattern | null>(null);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  
  const filteredPatterns = patterns
    .filter((pattern) => {
      const matchesSearch = pattern.name.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || pattern.pattern_type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aValue = a[sortField];
      const bValue = b[sortField];
      const order = sortOrder === 'asc' ? 1 : -1;
      return aValue < bValue ? -1 * order : aValue > bValue ? 1 * order : 0;
    });
  
  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };
  
  const handlePatternSave = (pattern: ShiftPattern) => {
    if (selectedPattern) {
      onPatternUpdate(pattern);
    } else {
      onPatternCreate(pattern);
    }
    setIsEditorOpen(false);
    setSelectedPattern(null);
  };
  
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold">Shift Patterns</h2>
        <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setSelectedPattern(null)}>
              <Plus className="w-4 h-4 mr-2" />
              New Pattern
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <PatternEditor
              initialPattern={selectedPattern || undefined}
              onSave={handlePatternSave}
              onCancel={() => {
                setIsEditorOpen(false);
                setSelectedPattern(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="flex space-x-4">
        <div className="flex-1">
          <Input
            placeholder="Search patterns..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="4x10">4x10</SelectItem>
            <SelectItem value="3x12_1x4">3x12 + 1x4</SelectItem>
            <SelectItem value="Custom">Custom</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[300px]">
              <Button
                variant="ghost"
                onClick={() => handleSort('name')}
                className="font-semibold"
              >
                Pattern Name
              </Button>
            </TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('days_on')}
                className="font-semibold"
              >
                Days On/Off
              </Button>
            </TableHead>
            <TableHead className="text-center">
              <Button
                variant="ghost"
                onClick={() => handleSort('shift_duration')}
                className="font-semibold"
              >
                Duration
              </Button>
            </TableHead>
            <TableHead>Preview</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredPatterns.map((pattern) => (
            <TableRow key={pattern.id}>
              <TableCell className="font-medium">{pattern.name}</TableCell>
              <TableCell>{pattern.pattern_type}</TableCell>
              <TableCell className="text-center">
                {pattern.days_on}/{pattern.days_off}
              </TableCell>
              <TableCell className="text-center">{pattern.shift_duration}h</TableCell>
              <TableCell className="w-[300px]">
                <PatternVisualizer pattern={pattern} className="h-16" />
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setSelectedPattern(pattern);
                      setIsEditorOpen(true);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <Trash2 className="w-4 h-4 text-destructive" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Pattern</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete this pattern? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => onPatternDelete(pattern.id)}
                          className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                        >
                          Delete
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default PatternList; 