import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Settings, BookOpen } from 'lucide-react';
import type { Department, Program, OptimizationConstraints } from '../../../../types';

interface SettingsTabProps {
  departments: Department[];
  programs: Program[];
  selectedDepartment: string;
  selectedProgram: string;
  selectedYearLevel: string;
  constraints: OptimizationConstraints;
  onDepartmentChange: (value: string) => void;
  onProgramChange: (value: string) => void;
  onYearLevelChange: (value: string) => void;
  onConstraintsChange: (constraints: OptimizationConstraints) => void;
}

const SettingsTab: React.FC<SettingsTabProps> = ({
  departments,
  programs,
  selectedDepartment,
  selectedProgram,
  selectedYearLevel,
  constraints,
  onDepartmentChange,
  onProgramChange,
  onYearLevelChange,
  onConstraintsChange
}) => {
  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5 text-primary" />
            Schedule Configuration
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Department</label>
              <Select value={selectedDepartment} onValueChange={onDepartmentChange}>
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder="Select department" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(dept => (
                    <SelectItem key={dept.id} value={dept.id.toString()}>
                      {dept.name} ({dept.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Program</label>
              <Select 
                value={selectedProgram} 
                onValueChange={onProgramChange}
                disabled={!selectedDepartment}
              >
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder="Select program" />
                </SelectTrigger>
                <SelectContent>
                  {programs.map(program => (
                    <SelectItem key={program.id} value={program.id.toString()}>
                      {program.name} ({program.code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Year Level</label>
              <Select 
                value={selectedYearLevel} 
                onValueChange={onYearLevelChange}
                disabled={!selectedProgram}
              >
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue placeholder="Select year level" />
                </SelectTrigger>
                <SelectContent>
                  {['1', '2', '3', '4'].map(year => (
                    <SelectItem key={year} value={year}>
                      Year {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5 text-primary" />
            Optimization Constraints
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Max Consecutive Hours</label>
              <Select 
                value={constraints.maxConsecutiveHours.toString()} 
                onValueChange={(value) => onConstraintsChange({...constraints, maxConsecutiveHours: parseInt(value)})}
              >
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5].map(hours => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} hour{hours !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="text-sm font-medium mb-2 block text-foreground">Max Daily Hours</label>
              <Select 
                value={(constraints as any).maxDailyHours?.toString() || '6'}
                onValueChange={(value) => onConstraintsChange({ ...constraints, maxDailyHours: parseInt(value) } as OptimizationConstraints)}
              >
                <SelectTrigger className="border-border/50 bg-background/50">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[6, 7, 8, 9, 10].map(hours => (
                    <SelectItem key={hours} value={hours.toString()}>
                      {hours} hours
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="mt-4 space-y-2">
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="prioritizeCore"
                checked={(constraints as any).prioritizeCore ?? false}
                onChange={(e) => onConstraintsChange({ ...constraints, prioritizeCore: e.target.checked } as OptimizationConstraints)}
                className="rounded border-border/50 text-primary focus:ring-primary"
              />
              <label htmlFor="prioritizeCore" className="text-sm text-foreground">Prioritize core subjects</label>
            </div>
            
            <div className="flex items-center gap-2">
              <input 
                type="checkbox" 
                id="balanceWorkload"
                checked={(constraints as any).balanceWorkload ?? false}
                onChange={(e) => onConstraintsChange({ ...constraints, balanceWorkload: e.target.checked } as OptimizationConstraints)}
                className="rounded border-border/50 text-primary focus:ring-primary"
              />
              <label htmlFor="balanceWorkload" className="text-sm text-foreground">Balance faculty workload</label>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsTab;
