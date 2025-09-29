import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  FileText,
  FileSpreadsheet,
  FileImage
} from 'lucide-react';

interface ScheduleHeaderProps {
  isGenerating: boolean;
  onGenerateSchedule: () => void;
  onExportSchedule: (format: 'pdf' | 'excel' | 'csv') => void;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  isGenerating,
  onGenerateSchedule,
  onExportSchedule
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Generation</h1>
          </div>
          <div className="flex items-center space-x-4">
            <Select onValueChange={(value) => onExportSchedule(value as 'pdf' | 'excel' | 'csv')}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Export as..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4 text-red-500" />
                    <span>PDF</span>
                  </div>
                </SelectItem>
                <SelectItem value="excel">
                  <div className="flex items-center space-x-2">
                    <FileSpreadsheet className="h-4 w-4 text-green-500" />
                    <span>Excel</span>
                  </div>
                </SelectItem>
                <SelectItem value="csv">
                  <div className="flex items-center space-x-2">
                    <FileImage className="h-4 w-4 text-blue-500" />
                    <span>CSV</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
            <Button 
              onClick={onGenerateSchedule}
              disabled={isGenerating}
              size="lg"
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 px-6 py-3"
            >
              {isGenerating ? (
                <>
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full mr-2" />
                  Generating...
                </>
              ) : (
                <>
                  <Calendar className="h-5 w-5 mr-2" />
                  Generate Schedule
                </>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
