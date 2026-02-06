import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { NutrientData } from '../types';

interface NutrientChartProps {
  data: NutrientData[];
}

const COLORS = ['#eab308', '#22c55e', '#ef4444', '#3b82f6'];

export const NutrientChart: React.FC<NutrientChartProps> = ({ data }) => {
  // Filter out calories for the pie chart as it's an aggregate unit
  const chartData = data.filter(d => d.name.toLowerCase() !== 'calories');

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ backgroundColor: '#fffaf0', borderColor: '#e7e5e4', borderRadius: '8px' }}
            itemStyle={{ color: '#44403c' }}
          />
          <Legend verticalAlign="bottom" height={36} />
        </PieChart>
      </ResponsiveContainer>
      <div className="text-center text-sm text-stone-500 mt-2">
        {data.find(d => d.name.toLowerCase() === 'calories')?.value} kCal Total
      </div>
    </div>
  );
};