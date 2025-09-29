import React from 'react';
import { useAppSelector } from '../../hooks/redux';

interface DashboardHeaderProps {
  title: string;
  subtitle?: string;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({ title, subtitle }) => {
  const user = useAppSelector((state) => state.auth.user);

  return (
    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
          {subtitle && (
            <p className="text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center space-x-4">
          <div className="text-right">
            <p className="text-sm text-gray-500">Welcome back,</p>
            <p className="font-semibold text-gray-800">{user?.firstname} {user?.lastname}</p>
            <p className="text-sm text-gray-500 capitalize">{user?.role?.toLowerCase().replace('_', ' ')}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardHeader;