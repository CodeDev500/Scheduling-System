import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Star, User, Clock, BookOpen, AlertTriangle } from "lucide-react";

interface FacultyRecommendation {
  id: string;
  name: string;
  specialization: string[];
  experience: number;
  currentLoad: number;
  maxLoad: number;
  matchScore: number;
  hasConflict: boolean;
  recommendationRank: number;
  availability: string[];
}

interface FacultyRecommendationsProps {
  recommendations: FacultyRecommendation[];
  subjectName: string;
  onSelectFaculty: (facultyId: string) => void;
}

export function FacultyRecommendations({ 
  recommendations, 
  subjectName, 
  onSelectFaculty 
}: FacultyRecommendationsProps) {
  const sortedRecommendations = recommendations.sort((a, b) => a.recommendationRank - b.recommendationRank);

  const getMatchScoreColor = (score: number) => {
    if (score >= 90) return "text-success";
    if (score >= 70) return "text-warning";
    return "text-muted-foreground";
  };

  const getMatchScoreBg = (score: number) => {
    if (score >= 90) return "bg-success-light";
    if (score >= 70) return "bg-warning-light";
    return "bg-secondary";
  };

  return (
    <Card className="p-6 bg-card border shadow-sm">
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-foreground">
            Faculty Recommendations for {subjectName}
          </h3>
          <Badge variant="secondary" className="text-sm">
            {recommendations.length} candidates
          </Badge>
        </div>
        
        <div className="space-y-3">
          {sortedRecommendations.map((faculty) => (
            <div
              key={faculty.id}
              className={`p-4 rounded-lg border transition-all hover:shadow-md ${
                faculty.hasConflict 
                  ? 'border-destructive bg-destructive-light/30' 
                  : 'border-border bg-card hover:bg-accent/30'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 space-y-3">
                  {/* Faculty Header */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <User className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-medium text-foreground flex items-center gap-2">
                          {faculty.name}
                          {faculty.recommendationRank <= 3 && (
                            <Star className={`h-4 w-4 ${
                              faculty.recommendationRank === 1 ? 'text-yellow-500 fill-yellow-500' :
                              faculty.recommendationRank === 2 ? 'text-yellow-400 fill-yellow-400' :
                              'text-yellow-300 fill-yellow-300'
                            }`} />
                          )}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {faculty.experience} years experience
                        </p>
                      </div>
                    </div>
                    
                    {faculty.hasConflict && (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="h-4 w-4" />
                        <span className="text-sm font-medium">Conflict</span>
                      </div>
                    )}
                  </div>

                  {/* Faculty Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Specializations */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <BookOpen className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Specializations</span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {faculty.specialization.map((spec) => (
                          <Badge key={spec} variant="outline" className="text-xs">
                            {spec}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    {/* Current Load */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Teaching Load</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-secondary rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full transition-all ${
                              faculty.currentLoad / faculty.maxLoad > 0.8 
                                ? 'bg-destructive' 
                                : faculty.currentLoad / faculty.maxLoad > 0.6 
                                ? 'bg-warning' 
                                : 'bg-success'
                            }`}
                            style={{ width: `${(faculty.currentLoad / faculty.maxLoad) * 100}%` }}
                          />
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {faculty.currentLoad}/{faculty.maxLoad}h
                        </span>
                      </div>
                    </div>

                    {/* Match Score */}
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Star className="h-4 w-4 text-muted-foreground" />
                        <span className="text-sm font-medium text-foreground">Match Score</span>
                      </div>
                      <div className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getMatchScoreBg(faculty.matchScore)}`}>
                        <span className={getMatchScoreColor(faculty.matchScore)}>
                          {faculty.matchScore}%
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <span className="text-sm font-medium text-foreground">Available Time Slots</span>
                    <div className="flex flex-wrap gap-1">
                      {faculty.availability.map((slot) => (
                        <Badge key={slot} variant="secondary" className="text-xs">
                          {slot}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Action Button */}
                <div className="ml-4">
                  <Button
                    onClick={() => onSelectFaculty(faculty.id)}
                    variant={faculty.hasConflict ? "outline" : "default"}
                    size="sm"
                    className={faculty.hasConflict ? "border-destructive text-destructive hover:bg-destructive-light" : ""}
                  >
                    {faculty.hasConflict ? "Assign (Override)" : "Assign"}
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}