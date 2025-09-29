import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  bgColor: string;
  textColor?: string;
  iconColor?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  bgColor,
  textColor = 'text-white',
  iconColor = 'text-white'
}) => {
  return (
    <div className={`${bgColor} rounded-lg p-6 shadow-lg`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-white/20 rounded-full">
            <Icon className={`w-8 h-8 ${iconColor}`} />
          </div>
          <div>
            <h3 className={`text-lg font-semibold ${textColor}`}>{title}</h3>
            <p className={`text-3xl font-bold ${textColor}`}>{value}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;