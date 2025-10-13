import React, { useState, useEffect } from 'react';
import { Search, User, BookOpen, Download } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import api from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import { useAppSelector } from '../../../hooks/redux';

interface Faculty {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  department: string;
  designation: string;
  specialization?: any;
  maxUnits?: number;
  totalUnits?: number;
  totalSubjects?: number;
  currentSemesterLoad?: number;
  status: string;
  role: string;
  image?: string;
}

const TeachingLoad = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const userData = useAppSelector((state) => state.auth.user);

  // Fetch faculty with teaching load
  useEffect(() => {
    fetchFacultyLoad();
  }, []);

  const fetchFacultyLoad = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user/faculty/with-load');
      console.log('Fetched faculty with load:', response.data);
      
      // Filter only APPROVED faculty from the same department
      const departmentFaculty = response.data.filter((user: Faculty) => 
        user.status === 'APPROVED' && user.department === userData?.department
      );
      
      setFaculty(departmentFaculty);
    } catch (error) {
      console.error('Error fetching faculty load:', error);
      toast.error('Failed to fetch faculty teaching load');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(member => {
    const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getFullName = (member: Faculty) => {
    return `${member.firstname} ${member.middleInitial}. ${member.lastname}`;
  };

  const getLoadPercentage = (current: number = 0, max: number = 21) => {
    return Math.round((current / max) * 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 100) return 'text-red-600';
    if (percentage >= 80) return 'text-yellow-600';
    if (percentage >= 60) return 'text-blue-600';
    return 'text-green-600';
  };

  const getLoadBarColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  const exportToCSV = () => {
    const headers = ['Name', 'Email', 'Designation', 'Total Units', 'Max Units', 'Load %', 'Total Subjects'];
    const rows = filteredFaculty.map(member => [
      getFullName(member),
      member.email,
      member.designation,
      member.totalUnits || 0,
      member.maxUnits || 21,
      getLoadPercentage(member.totalUnits, member.maxUnits),
      member.totalSubjects || 0
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `teaching-load-${userData?.department}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Teaching Load Management" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search and Export */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Department Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {userData?.department} Teaching Load
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            <div className="flex gap-3">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Search faculty..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-64"
                />
              </div>

              {/* Export Button */}
              <button
                onClick={exportToCSV}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
            </div>
          </div>
        </div>

        {/* Teaching Load Table */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading teaching load...</p>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Designation
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Total Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Units
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load Percentage
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subjects
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaculty.map((member) => {
                    const loadPercentage = getLoadPercentage(member.totalUnits, member.maxUnits);
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-shrink-0 h-10 w-10">
                              {member.image ? (
                                <img
                                  className="h-10 w-10 rounded-full object-cover"
                                  src={member.image.startsWith('http') ? member.image : `${api.defaults.baseURL}/${member.image}`}
                                  alt={getFullName(member)}
                                />
                              ) : (
                                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                                  <User className="h-6 w-6 text-gray-500" />
                                </div>
                              )}
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">
                                {getFullName(member)}
                              </div>
                              <div className="text-sm text-gray-500">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.designation}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {member.totalUnits || 0} units
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-500">
                            {member.maxUnits || 21} units
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="flex-1 mr-2">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${getLoadBarColor(loadPercentage)}`}
                                  style={{ width: `${Math.min(loadPercentage, 100)}%` }}
                                ></div>
                              </div>
                            </div>
                            <span className={`text-sm font-medium ${getLoadColor(loadPercentage)}`}>
                              {loadPercentage}%
                            </span>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center text-sm text-gray-900">
                            <BookOpen className="w-4 h-4 mr-1 text-gray-400" />
                            {member.totalSubjects || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            loadPercentage >= 100 ? 'bg-red-100 text-red-800' :
                            loadPercentage >= 80 ? 'bg-yellow-100 text-yellow-800' :
                            loadPercentage >= 60 ? 'bg-blue-100 text-blue-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {loadPercentage >= 100 ? 'Overloaded' :
                             loadPercentage >= 80 ? 'High' :
                             loadPercentage >= 60 ? 'Moderate' :
                             'Light'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

           
          </div>
        )}

        {filteredFaculty.length === 0 && !isLoading && (
          <div className="text-center py-12 bg-white rounded-lg shadow-sm">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.' 
                : `No faculty members in ${userData?.department} department.`}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TeachingLoad;
