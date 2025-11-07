import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Star, 
  AlertTriangle, 
  CheckCircle, 
  Brain, 
  TrendingUp, 
  Clock,
  Award,
  User,
  BookOpen,
  Zap,
  Target
} from 'lucide-react';
import type { FacultyRecommendation, Subject, Faculty } from '../../../../types';

interface FacultyRecommendationsProps {
  subjects: Subject[];
  facultyRecommendations: FacultyRecommendation[];
  onAssignFaculty: (subjectId: string, facultyId: string) => void;
  onViewConflicts: (facultyId: string) => void;
}

const FacultyRecommendations: React.FC<FacultyRecommendationsProps> = ({
  subjects,
  facultyRecommendations,
  onAssignFaculty,
  onViewConflicts
}) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'by-subject' | 'by-faculty'>('by-subject');

  // Group recommendations by subject
  const recommendationsBySubject = subjects.reduce((acc, subject) => {
    acc[subject.id] = facultyRecommendations
      .filter(rec => rec.subjectId === subject.id)
      .sort((a, b) => (a.rank || 0) - (b.rank || 0));
    return acc;
  }, {} as Record<string, FacultyRecommendation[]>);

  // Group recommendations by faculty
  const recommendationsByFaculty = facultyRecommendations.reduce((acc, rec) => {
    const facultyId = rec.faculty?.id;
    if (!facultyId) return acc;
    if (!acc[facultyId]) {
      acc[facultyId] = [];
    }
    acc[facultyId].push(rec);
    return acc;
  }, {} as Record<string, FacultyRecommendation[]>);

  const getConfidenceColor = (confidence: string) => {
    switch (confidence) {
      case 'High': return 'bg-green-100 text-green-800 border-green-200';
      case 'Medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Low': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getRankColor = (rank: number) => {
    if (rank === 1) return 'bg-gold text-yellow-900 border-yellow-300';
    if (rank === 2) return 'bg-silver text-gray-700 border-gray-300';
    if (rank === 3) return 'bg-bronze text-orange-700 border-orange-300';
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          AI Faculty Recommendations
        </CardTitle>
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'by-subject' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('by-subject')}
          >
            <BookOpen className="h-4 w-4 mr-2" />
            By Subject
          </Button>
          <Button
            variant={viewMode === 'by-faculty' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('by-faculty')}
          >
            <Users className="h-4 w-4 mr-2" />
            By Faculty
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {viewMode === 'by-subject' ? (
          <div className="space-y-6">
            {subjects.map(subject => {
              const recommendations = recommendationsBySubject[subject.id] || [];
              const hasConflicts = recommendations.some(rec => (rec.potentialConflicts?.length || 0) > 0);
              
              return (
                <div key={subject.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">{subject.subjectCode}</h3>
                      <p className="text-sm text-muted-foreground">{subject.subjectDescription}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">{subject.type}</Badge>
                        <Badge variant="outline">{subject.units} units</Badge>
                        {hasConflicts && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Conflicts detected
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {recommendations.slice(0, 3).map((rec, index) => (
                      <div
                        key={rec.faculty?.id || rec.facultyId}
                        className={`border rounded-lg p-3 ${
                          (rec.potentialConflicts?.length || 0) > 0 
                            ? 'border-red-200 bg-red-50' 
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <Badge className={getRankColor(rec.rank || 0)}>
                                #{rec.rank}
                              </Badge>
                              <span className="font-medium">{rec.faculty?.name || 'Unknown'}</span>
                              <Badge className={getConfidenceColor(rec.confidence || 'Low')}>
                                {rec.confidence} Confidence
                              </Badge>
                            </div>
                            
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm mb-2">
                              <div>
                                <span className="text-muted-foreground">Match:</span>
                                <span className="ml-1 font-medium">{rec.faculty?.matchScore || 0}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Experience:</span>
                                <span className="ml-1 font-medium">{rec.faculty?.experienceScore || 0}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Availability:</span>
                                <span className="ml-1 font-medium">{rec.faculty?.availabilityScore || 0}%</span>
                              </div>
                              <div>
                                <span className="text-muted-foreground">Overall:</span>
                                <span className="ml-1 font-medium text-primary">{rec.faculty?.overallScore || 0}%</span>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-1 mb-2">
                              {rec.reasons.map((reason, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {reason}
                                </Badge>
                              ))}
                            </div>

                            {(rec.potentialConflicts?.length || 0) > 0 && (
                              <Alert className="mt-2">
                                <AlertTriangle className="h-4 w-4" />
                                <AlertDescription className="text-sm">
                                  <strong>Potential Conflicts:</strong> {rec.potentialConflicts?.join(', ') || 'None'}
                                </AlertDescription>
                              </Alert>
                            )}
                          </div>

                          <div className="flex flex-col gap-2 ml-4">
                            <Button
                              size="sm"
                              onClick={() => onAssignFaculty(subject.id, rec.faculty?.id || '')}
                              disabled={(rec.potentialConflicts?.length || 0) > 0}
                            >
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Assign
                            </Button>
                            {(rec.potentialConflicts?.length || 0) > 0 && (
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onViewConflicts(rec.faculty?.id || '')}
                              >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                View Conflicts
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="space-y-6">
            {Object.entries(recommendationsByFaculty).map(([facultyId, recommendations]) => {
              const faculty = recommendations[0].faculty;
              const totalConflicts = recommendations.reduce((sum, rec) => sum + (rec.potentialConflicts?.length || 0), 0);
              
              return (
                <div key={facultyId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg flex items-center gap-2">
                        <User className="h-5 w-5" />
                        {faculty?.name || 'Unknown'}
                      </h3>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline">
                          {faculty?.specializations?.join(', ') || 'N/A'}
                        </Badge>
                        <Badge variant="outline">
                          {faculty?.experienceYears || 0} years experience
                        </Badge>
                        {totalConflicts > 0 && (
                          <Badge variant="destructive" className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {totalConflicts} conflicts
                          </Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-primary">
                        {Math.round(faculty?.overallScore || 0)}%
                      </div>
                      <div className="text-sm text-muted-foreground">Overall Score</div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <h4 className="font-medium text-sm text-muted-foreground">Recommended for:</h4>
                    {recommendations.map(rec => {
                      const subject = subjects.find(s => s.id === rec.subjectId);
                      if (!subject) return null;
                      
                      return (
                        <div
                          key={rec.subjectId}
                          className={`flex items-center justify-between p-2 rounded border ${
                            (rec.potentialConflicts?.length || 0) > 0 ? 'border-red-200 bg-red-50' : 'border-gray-200'
                          }`}
                        >
                          <div>
                            <span className="font-medium">{subject.subjectCode}</span>
                            <span className="text-sm text-muted-foreground ml-2">
                              Rank #{rec.rank} • {rec.confidence} confidence
                            </span>
                          </div>
                          <Button
                            size="sm"
                            onClick={() => onAssignFaculty(subject.id, faculty?.id || '')}
                            disabled={(rec.potentialConflicts?.length || 0) > 0}
                          >
                            Assign
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default FacultyRecommendations;
