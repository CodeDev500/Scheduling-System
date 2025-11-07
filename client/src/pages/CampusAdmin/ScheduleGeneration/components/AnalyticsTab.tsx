import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { AlertTriangle, RefreshCw, TrendingUp, BarChart3, PieChart, Activity } from 'lucide-react';
import type { GeneratedSchedule } from '../../../../types';

interface AnalyticsTabProps {
  selectedSchedule: GeneratedSchedule | null;
  setActiveTab: (tab: string) => void;
  onResolveConflict: (conflictId: string) => void;
}

const AnalyticsTab: React.FC<AnalyticsTabProps> = ({
  selectedSchedule,
  setActiveTab,
  onResolveConflict
}) => {
  if (!selectedSchedule) {
    return (
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardContent className="text-center py-12">
          <BarChart3 className="h-16 w-16 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2 text-foreground">No Schedule Selected</h3>
          <p className="text-muted-foreground mb-4">
            Generate a schedule first to view detailed analytics and optimization insights.
          </p>
          <Button onClick={() => setActiveTab('generation')}>
            <TrendingUp className="h-4 w-4 mr-2" />
            Go to Generation
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Optimization Scores */}
      <Card className="bg-gradient-to-br from-background to-muted/20 border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Optimization Scores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <div className="text-center">
              <Badge 
                variant={
                  (selectedSchedule.optimizationScore?.overall || 0) >= 80 ? 'default' : 
                  (selectedSchedule.optimizationScore?.overall || 0) >= 60 ? 'secondary' : 'destructive'
                }
                className="mb-2"
              >
                Overall: {selectedSchedule.optimizationScore?.overall || 0}%
              </Badge>
              <Progress value={selectedSchedule.optimizationScore?.overall || 0} className="h-2" />
            </div>
            <div className="text-center">
              <Badge 
                variant={
                  (selectedSchedule.optimizationScore?.roomUtilization || 0) >= 80 ? 'default' : 
                  (selectedSchedule.optimizationScore?.roomUtilization || 0) >= 60 ? 'secondary' : 'destructive'
                }
                className="mb-2"
              >
                Room: {selectedSchedule.optimizationScore?.roomUtilization || 0}%
              </Badge>
              <Progress value={selectedSchedule.optimizationScore?.roomUtilization || 0} className="h-2" />
            </div>
            <div className="text-center">
              <Badge 
                variant={
                  (selectedSchedule.optimizationScore?.facultyWorkload || 0) >= 80 ? 'default' : 
                  (selectedSchedule.optimizationScore?.facultyWorkload || 0) >= 60 ? 'secondary' : 'destructive'
                }
                className="mb-2"
              >
                Faculty: {selectedSchedule.optimizationScore?.facultyWorkload || 0}%
              </Badge>
              <Progress value={selectedSchedule.optimizationScore?.facultyWorkload || 0} className="h-2" />
            </div>
            <div className="text-center">
              <Badge 
                variant={
                  (selectedSchedule.optimizationScore?.breakdown?.timeDistribution || 0) >= 80 ? 'default' : 
                  (selectedSchedule.optimizationScore?.breakdown?.timeDistribution || 0) >= 60 ? 'secondary' : 'destructive'
                }
                className="mb-2"
              >
                Time: {selectedSchedule.optimizationScore?.breakdown?.timeDistribution || 0}%
              </Badge>
              <Progress value={selectedSchedule.optimizationScore?.breakdown?.timeDistribution || 0} className="h-2" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-border/50 rounded-lg bg-background/50">
              <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
              <div className="text-2xl font-bold text-green-600">
                {selectedSchedule.subjects.length - selectedSchedule.conflicts.length}
              </div>
              <div className="text-sm text-muted-foreground">Successfully Scheduled</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-600" />
              <div className="text-2xl font-bold text-yellow-600">
                {selectedSchedule.conflicts.length}
              </div>
              <div className="text-sm text-muted-foreground">Conflicts Detected</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <PieChart className="h-8 w-8 mx-auto mb-2 text-blue-600" />
              <div className="text-2xl font-bold text-blue-600">
                {Math.round((selectedSchedule.subjects.length - selectedSchedule.conflicts.length) / selectedSchedule.subjects.length * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">Success Rate</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Conflicts Analysis */}
      {selectedSchedule.conflicts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-600" />
              Conflicts Analysis
              <Badge variant="secondary">{selectedSchedule.conflicts.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {selectedSchedule.conflicts.map(conflict => (
                <div key={conflict.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant={
                          conflict.severity === 'High' ? 'destructive' : 
                          conflict.severity === 'Medium' ? 'secondary' : 'outline'
                        }
                      >
                        {conflict.severity}
                      </Badge>
                      <Badge variant="outline">{conflict.type}</Badge>
                    </div>
                    {conflict.autoResolvable && (
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => onResolveConflict(conflict.id)}
                      >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Auto Resolve
                      </Button>
                    )}
                  </div>
                  <h4 className="font-medium mb-1">{conflict.description}</h4>
                  <p className="text-sm text-muted-foreground mb-2">{conflict.details}</p>
                  {conflict.suggestions.length > 0 && (
                    <div>
                      <div className="text-sm font-medium mb-1">Suggestions:</div>
                      <ul className="text-sm text-muted-foreground list-disc list-inside">
                        {conflict.suggestions.map((suggestion, index) => (
                          <li key={index}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Performance Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Performance Metrics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">Room Utilization</h4>
              <div className="space-y-2">
                {selectedSchedule.roomUtilization?.map(room => (
                  <div key={room.roomId} className="flex items-center justify-between">
                    <span className="text-sm">{room.roomName}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={room.utilizationRate} className="w-20 h-2" />
                      <span className="text-sm font-medium">{room.utilizationRate}%</span>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No room utilization data available</p>}
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-3">Faculty Workload</h4>
              <div className="space-y-2">
                {selectedSchedule.facultyWorkload?.map(faculty => (
                  <div key={faculty.facultyId} className="flex items-center justify-between">
                    <span className="text-sm">{faculty.facultyName}</span>
                    <div className="flex items-center gap-2">
                      <Progress value={faculty.workloadPercentage} className="w-20 h-2" />
                      <span className="text-sm font-medium">{faculty.workloadPercentage}%</span>
                    </div>
                  </div>
                )) || <p className="text-sm text-muted-foreground">No faculty workload data available</p>}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default AnalyticsTab;
