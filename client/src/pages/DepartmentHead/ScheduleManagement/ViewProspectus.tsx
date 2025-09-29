import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { useAppSelector } from '../../../hooks/redux';
import { useParams } from "react-router-dom";
import YearLevelsTable from "../../../components/tables/YearLevel";
import { programDescription } from "../../../utils/getProgramDescription";
import { Badge } from '../../../components/ui/badge';
import { Separator } from '../../../components/ui/separator';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { Eye, GraduationCap, Calendar, BookOpen } from 'lucide-react';

interface Subject {
  id: string;
  code: string;
  name: string;
  units: number;
  yearLevel: number;
  semester: number;
  prerequisite?: string;
}

interface Program {
  id: string;
  code: string;
  name: string;
  subjects: Subject[];
}

const ViewProspectus: React.FC = () => {
  const userData = useAppSelector((state) => state.auth.user);
  const [programCode, setProgramCode] = useState(userData?.department ?? '');
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);

  const programName = programDescription(programCode ?? "", academicPrograms ?? []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 ">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header Section */}
        <Card className="border-0 shadow-lg bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white">
          <CardHeader className="pb-8">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-white/20 rounded-full">
                <GraduationCap className="h-8 w-8" />
              </div>
              <div>
                <CardTitle className="text-3xl lg:text-4xl font-bold tracking-tight">
                  Academic Prospectus
                </CardTitle>
                <CardDescription className="text-blue-100 text-lg mt-2">
                  {programName}
                </CardDescription>
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <BookOpen className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Program Code</span>
                </div>
                <p className="text-xl font-bold mt-1">{programCode}</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Academic Year</span>
                </div>
                <p className="text-xl font-bold mt-1">2024-2025</p>
              </div>
              
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="flex items-center space-x-2">
                  <Eye className="h-5 w-5 text-blue-200" />
                  <span className="text-sm font-medium text-blue-100">Department</span>
                </div>
                <p className="text-xl font-bold mt-1">{userData?.department}</p>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Content Section */}
         <Card className="shadow-md border-0">
           <CardHeader className="pb-4">
             <div>
               <CardTitle className="text-xl font-semibold text-gray-800">Year Levels Overview</CardTitle>
               <CardDescription className="text-gray-600">
                 Browse and manage academic year levels and their corresponding subjects
               </CardDescription>
             </div>
           </CardHeader>
           
           <Separator className="mx-6" />
           
           <CardContent className="pt-6">
             <YearLevelsTable 
               programCode={programCode ?? ""} 
               basePath="/schedule-management/view-prospectus"
             />
           </CardContent>
         </Card>
      </div>
    </div>
  );
};

export default ViewProspectus;