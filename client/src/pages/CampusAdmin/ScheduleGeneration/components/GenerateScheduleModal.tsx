import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Calendar, Loader2 } from 'lucide-react';
import api from '@/api/axios';

interface GenerateScheduleModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onGenerate: (curriculumYear: string, semester: string) => void;
  isGenerating: boolean;
}

export const GenerateScheduleModal: React.FC<GenerateScheduleModalProps> = ({
  open,
  onOpenChange,
  onGenerate,
  isGenerating
}) => {
  const [curriculumYear, setCurriculumYear] = useState('');
  const [semester, setSemester] = useState('');
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch academic years when modal opens
  useEffect(() => {
    if (open) {
      fetchAcademicYears();
    }
  }, [open]);

  const fetchAcademicYears = async () => {
    setLoading(true);
    try {
      const response = await api.get('/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching academic years:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerate = () => {
    if (!curriculumYear || !semester) {
      return;
    }
    onGenerate(curriculumYear, semester);
  };

  const handleClose = () => {
    if (!isGenerating) {
      onOpenChange(false);
      // Reset form
      setCurriculumYear('');
      setSemester('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl">
            <Calendar className="h-6 w-6 text-blue-600" />
            Generate Schedule
          </DialogTitle>
          <DialogDescription>
            Select the curriculum year and semester to generate the schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 p-4">
          {/* Curriculum Year Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Curriculum Year <span className="text-red-500">*</span>
            </label>
            <Select 
              value={curriculumYear} 
              onValueChange={setCurriculumYear}
              disabled={loading || isGenerating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder={loading ? "Loading..." : "Select curriculum year"} />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                {academicYears.map((year) => (
                  <SelectItem key={year.id} value={year.year}>
                    {year.year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Semester Selection */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">
              Semester <span className="text-red-500">*</span>
            </label>
            <Select 
              value={semester} 
              onValueChange={setSemester}
              disabled={isGenerating}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select semester" />
              </SelectTrigger>
              <SelectContent className='bg-white'>
                <SelectItem value="1st Semester">1st Semester</SelectItem>
                <SelectItem value="2nd Semester">2nd Semester</SelectItem>
                <SelectItem value="Summer">Summer</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Info Message */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm text-blue-800">
              <strong>Note:</strong> The system will generate schedules only for courses within the maximum unit limit. 
              Overload courses must be assigned by the Program Head.
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isGenerating}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={handleGenerate}
            disabled={!curriculumYear || !semester || isGenerating}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
          >
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Calendar className="h-4 w-4 mr-2" />
                Generate Schedule
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
