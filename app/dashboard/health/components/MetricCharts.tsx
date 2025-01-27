'use client';

import { Card } from '@/components/ui/card';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  Legend
} from 'recharts';
import { format } from 'date-fns';

interface MetricHistory {
  timestamp: string;
  coverage_deficit: number;
  pattern_errors: number;
  overtime_violations: number;
  schedule_generation_time: number;
}

interface MetricChartsProps {
  history: MetricHistory[];
}

export default function MetricCharts({ history }: MetricChartsProps) {
  const formatDate = (timestamp: string) => {
    return format(new Date(timestamp), 'MMM d, HH:mm');
  };

  return (
    <div className="space-y-6">
      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Coverage Deficit Trend</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => [value, 'Coverage Deficit']}
              />
              <Line
                type="monotone"
                dataKey="coverage_deficit"
                stroke="#ef4444"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Pattern and Overtime Violations</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={history}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number, name: string) => [
                  value,
                  name === 'pattern_errors' ? 'Pattern Violations' : 'Overtime Violations'
                ]}
              />
              <Legend />
              <Bar
                dataKey="pattern_errors"
                name="Pattern Violations"
                fill="#f59e0b"
              />
              <Bar
                dataKey="overtime_violations"
                name="Overtime Violations"
                fill="#3b82f6"
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Generation Time History</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
              data={history}
              margin={{
                top: 5,
                right: 30,
                left: 20,
                bottom: 5
              }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="timestamp"
                tickFormatter={formatDate}
                angle={-45}
                textAnchor="end"
              />
              <YAxis />
              <Tooltip
                labelFormatter={formatDate}
                formatter={(value: number) => [`${value}ms`, 'Generation Time']}
              />
              <Line
                type="monotone"
                dataKey="schedule_generation_time"
                stroke="#10b981"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card className="p-4">
        <h2 className="text-lg font-semibold mb-4">Metric Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Average Generation Time
            </h3>
            <p className="text-2xl font-bold">
              {Math.round(
                history.reduce((acc, curr) => acc + curr.schedule_generation_time, 0) /
                  history.length
              )}
              ms
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Total Violations
            </h3>
            <p className="text-2xl font-bold">
              {history.reduce(
                (acc, curr) =>
                  acc + curr.pattern_errors + curr.overtime_violations,
                0
              )}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Peak Coverage Deficit
            </h3>
            <p className="text-2xl font-bold">
              {Math.max(...history.map(h => h.coverage_deficit))}
            </p>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-500 mb-2">
              Current Trend
            </h3>
            <p className="text-2xl font-bold">
              {history[history.length - 1].coverage_deficit <
              history[history.length - 2].coverage_deficit
                ? 'Improving'
                : 'Degrading'}
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
} 