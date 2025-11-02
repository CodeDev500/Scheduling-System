import React from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Calendar,
  FileText,
  FileSpreadsheet,
  FileImage,
  Save
} from 'lucide-react';

interface ScheduleHeaderProps {
  isGenerating: boolean;
  onOpenGenerateModal: () => void;
  onExportSchedule: (format: 'pdf' | 'excel' | 'csv') => void;
  onSaveSchedule?: () => void;
  canSave?: boolean;
}

export const ScheduleHeader: React.FC<ScheduleHeaderProps> = ({
  isGenerating,
  onOpenGenerateModal,
  onExportSchedule,
  onSaveSchedule,
  canSave = true
}) => {
  return (
    <div className="space-y-8">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-100">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Schedule Generation</h1>
          </div>
          <div className="flex items-center space-x-4">
            {/* <Select onValueChange={(value) => onExportSchedule(value as 'pdf' | 'excel' | 'csv')}>
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
               
              </SelectContent>
            </Select> */}
            {/* <Select value={curriculumYear} onValueChange={onCurriculumYearChange}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Select Curriculum Year" />
              </SelectTrigger>
              <SelectContent>
                {academicYears.map(year => (
                  <SelectItem key={year.id} value={year.year}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select> */}
            <Button 
              onClick={onSaveSchedule}
              disabled={!canSave || isGenerating}
              variant="outline"
              className="border-blue-200 hover:bg-blue-50 text-blue-700"
            >
              <Save className="h-5 w-5 mr-2" />
              Save Schedule
            </Button>
            <Button 
              onClick={onOpenGenerateModal}
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
