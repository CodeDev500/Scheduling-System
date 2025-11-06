import React, { useState, useEffect } from "react";
import { Search, User, Mail, MapPin, Calendar, Eye, BookOpen } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";
import api from "../../../api/axios";
import { useToast } from "../../../hooks/useToast";
import { useAppSelector } from "../../../hooks/redux";

interface Faculty {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  designation: string;
  department: string;
  role: string;
  status: string;
  specialization?: any;
  createdAt: string;
  updatedAt: string;
  image?: string;
  totalSubjects?: number;
  totalUnits?: number;
  currentSemesterLoad?: number;
  maxUnits?: number;
  yearsOfExperience?: number;
  previousSubjects?: any;
  availableDays?: any;
  preferredTimeSlots?: any;
}

const FacultyProfile = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();
  const userData = useAppSelector((state) => state.auth.user);

  // Fetch faculty from API filtered by department
  useEffect(() => {
    fetchFaculty();
  }, []);

  const fetchFaculty = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user/faculty/with-load');
      console.log('Fetched faculty with load:', response.data);
      
      // Filter only APPROVED faculty from the same department as the logged-in user
      const departmentFaculty = response.data.filter((user: Faculty) => 
        user.status === 'APPROVED' && user.department === userData?.department
      );
      
      setFaculty(departmentFaculty);
    } catch (error) {
      console.error('Error fetching faculty:', error);
      toast.error('Failed to fetch faculty');
    } finally {
      setIsLoading(false);
    }
  };

  const filteredFaculty = faculty.filter(member => {
    const fullName = `${member.firstname} ${member.lastname}`.toLowerCase();
    const specializationStr = Array.isArray(member.specialization) ? member.specialization.join(', ') : '';
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         specializationStr.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "APPROVED":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "VERIFIED":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case "PENDING":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getFullName = (member: Faculty) => {
    return `${member.firstname} ${member.middleInitial}. ${member.lastname}`;
  };

  const getSpecialization = (spec: any) => {
    if (Array.isArray(spec)) {
      return spec.join(', ');
    }
    return spec || 'Not specified';
  };

  const getLoadPercentage = (current: number = 0, max: number = 21) => {
    return Math.round((current / max) * 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Faculty Profiles" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with Search and Department Info */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            {/* Department Info */}
            <div>
              <h2 className="text-lg font-semibold text-gray-900">
                {userData?.department} Faculty
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                {filteredFaculty.length} faculty member{filteredFaculty.length !== 1 ? 's' : ''}
              </p>
            </div>
            
            {/* Search */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search faculty by name, email, or specialization..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        </div>

        {/* Faculty Grid */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading faculty...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => {
              return (
                <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
                  {/* Faculty Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0">
                        {member.image ? (
                          <img
                            src={member.image.startsWith('http') ? member.image : `${api.defaults.baseURL}/${member.image}`}
                            alt={getFullName(member)}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full bg-blue-500 flex items-center justify-center">
                            <User className="w-6 h-6 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900">{getFullName(member)}</h3>
                        <p className="text-sm text-gray-500">{member.designation}</p>
                      </div>
                    </div>
                    <span className={getStatusBadge(member.status)}>
                      {member.status}
                    </span>
                  </div>

                  {/* Contact Information */}
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-gray-600">
                      <Mail className="w-4 h-4 mr-2" />
                      {member.email}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <MapPin className="w-4 h-4 mr-2" />
                      {member.department}
                    </div>
                    <div className="flex items-center text-sm text-gray-600">
                      <User className="w-4 h-4 mr-2" />
                      {member.role}
                    </div>
                  </div>

                  {/* Specialization */}
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-1">Specialization:</p>
                    <p className="text-sm text-gray-600">{getSpecialization(member.specialization)}</p>
                  </div>

                  {/* Teaching Load */}
                  {/* {member.totalUnits !== undefined && member.maxUnits && (
                    <div className="mb-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Teaching Load</span>
                        <span className={`text-sm font-medium ${getLoadColor(getLoadPercentage(member.totalUnits, member.maxUnits))}`}>
                          {member.totalUnits}/{member.maxUnits} units ({getLoadPercentage(member.totalUnits, member.maxUnits)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${
                            getLoadPercentage(member.totalUnits, member.maxUnits) >= 90 ? 'bg-red-500' : 
                            getLoadPercentage(member.totalUnits, member.maxUnits) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(getLoadPercentage(member.totalUnits, member.maxUnits), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  )} */}

                  {/* Subjects and Date Info */}
                  <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                    <div className="flex items-center">
                      <BookOpen className="w-4 h-4 mr-1" />
                      {member.totalSubjects || 0} subjects
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-4 h-4 mr-1" />
                      Since {new Date(member.createdAt).getFullYear()}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedFaculty(member);
                        setShowModal(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      View Details
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {filteredFaculty.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm 
                ? 'Try adjusting your search criteria.' 
                : `No faculty members in ${userData?.department} department.`}
            </p>
          </div>
        )}

        {/* Faculty Details Modal */}
        {showModal && selectedFaculty && (
          <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setShowModal(false)}>
            <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Faculty Details</h2>
                <button 
                  onClick={() => setShowModal(false)}
                  className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Basic Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Full Name</label>
                      <p className="text-sm font-medium text-gray-900">{getFullName(selectedFaculty)}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                      <p className="text-sm font-medium text-gray-900">{selectedFaculty.designation}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Department</label>
                      <p className="text-sm font-medium text-gray-900">{selectedFaculty.department}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                      <p className="text-sm font-medium text-gray-900">{selectedFaculty.role}</p>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</label>
                      <span className={getStatusBadge(selectedFaculty.status)}>
                        {selectedFaculty.status}
                      </span>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date Joined</label>
                      <p className="text-sm font-medium text-gray-900">{new Date(selectedFaculty.createdAt).toLocaleDateString()}</p>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                      <p className="text-sm font-medium text-gray-900">{selectedFaculty.email}</p>
                    </div>
                  </div>
                </div>

                {/* Specialization */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialization</h3>
                  <p className="text-sm font-medium text-gray-900">{getSpecialization(selectedFaculty.specialization)}</p>
                </div>

                {/* Years of Experience */}
                {selectedFaculty.yearsOfExperience !== undefined && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Experience</h3>
                    <p className="text-sm font-medium text-gray-900">
                      {selectedFaculty.yearsOfExperience ? selectedFaculty.yearsOfExperience : 'Not Specified'}
                    </p>
                  </div>
                )}

                {/* Previous Subjects */}
                {selectedFaculty.previousSubjects && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Previous Subjects Taught</h3>
                    <div className="flex flex-wrap gap-2">
                      {(() => {
                        const subjects = typeof selectedFaculty.previousSubjects === 'string' 
                          ? JSON.parse(selectedFaculty.previousSubjects)
                          : selectedFaculty.previousSubjects;
                        
                        if (Array.isArray(subjects) && subjects.length > 0) {
                          return subjects.map((subject: string, index: number) => (
                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                              {subject}
                            </span>
                          ));
                        }
                        return <p className="text-sm text-gray-500">No previous subjects recorded</p>;
                      })()}
                    </div>
                  </div>
                )}

                {/* Time Availability */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">Time Availability</h3>
                  <div className="space-y-3">
                    {/* Available Days */}
                    {selectedFaculty.availableDays && (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Available Days</label>
                        <div className="flex flex-wrap gap-2">
                          {(() => {
                            const days = typeof selectedFaculty.availableDays === 'string' 
                              ? JSON.parse(selectedFaculty.availableDays)
                              : selectedFaculty.availableDays;
                            
                            if (Array.isArray(days) && days.length > 0) {
                              return days.map((day: string, index: number) => (
                                <span key={index} className="px-3 py-1 bg-green-100 text-green-800 rounded-lg text-sm font-medium">
                                  {day}
                                </span>
                              ));
                            }
                            return <p className="text-sm text-gray-500">Not specified</p>;
                          })()}
                        </div>
                      </div>
                    )}
                    
                    {/* Preferred Time Slots */}
                    {selectedFaculty.preferredTimeSlots ? (
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-2">Preferred Time Slots</label>
                        <div className="flex items-center gap-2">
                          {(() => {
                            // Ensure we have a string to work with
                            const timeString = String(selectedFaculty.preferredTimeSlots || '');
                            
                            // Parse the time string format: "start:07:00end:20:00"
                            const startMatch = timeString.match(/start:(\d{2}):(\d{2})/);
                            const endMatch = timeString.match(/end:(\d{2}):(\d{2})/);
                            
                            if (startMatch && endMatch) {
                              // Convert 24-hour to 12-hour format
                              const formatTime = (hours: string, minutes: string) => {
                                const hour = parseInt(hours);
                                const ampm = hour >= 12 ? 'PM' : 'AM';
                                const hour12 = hour % 12 || 12;
                                return `${hour12}:${minutes} ${ampm}`;
                              };
                              
                              const startTime = formatTime(startMatch[1], startMatch[2]);
                              const endTime = formatTime(endMatch[1], endMatch[2]);
                              
                              return (
                                <span className="px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-semibold">
                                  {startTime} - {endTime}
                                </span>
                              );
                            }
                            
                            return <p className="text-sm text-gray-500">{timeString}</p>;
                          })()}
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500">Not specified</p>
                    )}
                  </div>
                </div>

                {/* Teaching Load Information */}
                {/* {selectedFaculty.totalUnits !== undefined && (
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Load</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Units</label>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.totalUnits || 0} units</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Maximum Units</label>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.maxUnits || 21} units</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Total Subjects</label>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.totalSubjects || 0} subjects</p>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Hours/Week</label>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.currentSemesterLoad || 0} hours</p>
                      </div>
                    </div>
                    <div className="mt-4">
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Load Percentage</span>
                        <span className={`text-sm font-medium ${getLoadColor(getLoadPercentage(selectedFaculty.totalUnits, selectedFaculty.maxUnits))}`}>
                          {getLoadPercentage(selectedFaculty.totalUnits, selectedFaculty.maxUnits)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${
                            getLoadPercentage(selectedFaculty.totalUnits, selectedFaculty.maxUnits) >= 90 ? 'bg-red-500' : 
                            getLoadPercentage(selectedFaculty.totalUnits, selectedFaculty.maxUnits) >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${Math.min(getLoadPercentage(selectedFaculty.totalUnits, selectedFaculty.maxUnits), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )} */}
              </div>

              <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                <button 
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FacultyProfile;
