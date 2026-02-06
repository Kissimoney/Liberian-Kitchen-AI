import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { NutrientData } from '../types';

interface NutrientBarChartProps {
  data: NutrientData[];
}

const COLORS = ['#eab308', '#22c55e', '#ef4444', '#3b82f6', '#8b5cf6', '#ec4899'];

export const NutrientBarChart: React.FC<NutrientBarChartProps> = ({ data }) => {
  // Filter out calories for the bar chart as it's an aggregate unit often much larger than grams
  const chartData = data.filter(d => d.name.toLowerCase() !== 'calories');

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          margin={{
            top: 10,
            right: 10,
            left: 0,
            bottom: 5,
          }}
        >
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e7e5e4" />
          <XAxis 
            dataKey="name" 
            tick={{ fill: '#78716c', fontSize: 12 }} 
            axisLine={{ stroke: '#e7e5e4' }}
            tickLine={false}
            interval={0}
          />
          <YAxis 
            tick={{ fill: '#78716c', fontSize: 12 }} 
            axisLine={{ stroke: '#e7e5e4' }}
            tickLine={false}
          />
          <Tooltip 
            contentStyle={{ backgroundColor: '#fffaf0', borderColor: '#e7e5e4', borderRadius: '8px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            itemStyle={{ color: '#44403c', fontWeight: 600 }}
            cursor={{ fill: '#f5f5f4' }}
            formatter={(value: number, name: string, props: any) => [`${value} ${props.payload.unit}`, name]}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Amount">
             {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};