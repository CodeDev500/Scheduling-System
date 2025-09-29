import React, { useState, useEffect } from "react";
import { Search, User, Mail, Phone, MapPin, Calendar, Edit, Eye, Plus, Award, BookOpen } from "lucide-react";
import DashboardHeader from "../../../components/dashboard/DashboardHeader";

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  specialization: string;
  employmentStatus: 'Full-time' | 'Part-time' | 'Contractual';
  dateHired: string;
  totalSubjects: number;
  totalUnits: number;
  maxUnits: number;
  currentSemesterLoad: number;
  avatar?: string;
  education: string;
  experience: string;
}

const FacultyProfile = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterDepartment, setFilterDepartment] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Mock data for faculty
    const mockFaculty: Faculty[] = [
      {
        id: "FAC001",
        name: "Dr. Maria Santos",
        email: "maria.santos@university.edu",
        phone: "+63 912 345 6789",
        department: "Computer Science",
        position: "Professor",
        specialization: "Data Structures, Algorithms",
        employmentStatus: "Full-time",
        dateHired: "2018-08-15",
        totalSubjects: 4,
        totalUnits: 18,
        maxUnits: 21,
        currentSemesterLoad: 18,
        education: "PhD in Computer Science",
        experience: "6 years"
      },
      {
        id: "FAC002",
        name: "Prof. John Dela Cruz",
        email: "john.delacruz@university.edu",
        phone: "+63 917 234 5678",
        department: "Information Technology",
        position: "Associate Professor",
        specialization: "Database Systems, Web Development",
        employmentStatus: "Full-time",
        dateHired: "2020-01-10",
        totalSubjects: 3,
        totalUnits: 15,
        maxUnits: 21,
        currentSemesterLoad: 15,
        education: "MS in Information Technology",
        experience: "4 years"
      },
      {
        id: "FAC003",
        name: "Ms. Ana Rodriguez",
        email: "ana.rodriguez@university.edu",
        phone: "+63 918 345 6789",
        department: "Information Technology",
        position: "Assistant Professor",
        specialization: "Mobile Development, UI/UX",
        employmentStatus: "Part-time",
        dateHired: "2021-06-01",
        totalSubjects: 2,
        totalUnits: 9,
        maxUnits: 12,
        currentSemesterLoad: 9,
        education: "BS in Information Technology",
        experience: "3 years"
      },
      {
        id: "FAC004",
        name: "Dr. Robert Garcia",
        email: "robert.garcia@university.edu",
        phone: "+63 919 456 7890",
        department: "Computer Science",
        position: "Professor",
        specialization: "Software Engineering, Project Management",
        employmentStatus: "Full-time",
        dateHired: "2015-03-20",
        totalSubjects: 3,
        totalUnits: 15,
        maxUnits: 21,
        currentSemesterLoad: 15,
        education: "PhD in Software Engineering",
        experience: "9 years"
      },
      {
        id: "FAC005",
        name: "Prof. Lisa Chen",
        email: "lisa.chen@university.edu",
        phone: "+63 920 567 8901",
        department: "Information Technology",
        position: "Assistant Professor",
        specialization: "Mobile Apps, Cross-platform Development",
        employmentStatus: "Contractual",
        dateHired: "2022-08-01",
        totalSubjects: 2,
        totalUnits: 6,
        maxUnits: 15,
        currentSemesterLoad: 6,
        education: "MS in Computer Science",
        experience: "2 years"
      }
    ];
    setFaculty(mockFaculty);
  }, []);

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment = filterDepartment === "all" || member.department === filterDepartment;
    const matchesStatus = filterStatus === "all" || member.employmentStatus === filterStatus;
    
    return matchesSearch && matchesDepartment && matchesStatus;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = "px-2 py-1 text-xs font-medium rounded-full";
    switch (status) {
      case "Full-time":
        return `${baseClasses} bg-green-100 text-green-800`;
      case "Part-time":
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      case "Contractual":
        return `${baseClasses} bg-blue-100 text-blue-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getLoadPercentage = (current: number, max: number) => {
    return Math.round((current / max) * 100);
  };

  const getLoadColor = (percentage: number) => {
    if (percentage >= 90) return "text-red-600";
    if (percentage >= 75) return "text-yellow-600";
    return "text-green-600";
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Filters and Search */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search by name, email, or specialization..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Department Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterDepartment}
              onChange={(e) => setFilterDepartment(e.target.value)}
            >
              <option value="all">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Information Technology">Information Technology</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contractual">Contractual</option>
            </select>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap gap-3 mt-4">
          <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            Add Faculty
          </button>
          <button className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
            <Award className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Faculty Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredFaculty.map((member) => {
          const loadPercentage = getLoadPercentage(member.currentSemesterLoad, member.maxUnits);
          return (
            <div key={member.id} className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow">
              {/* Faculty Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">{member.name}</h3>
                    <p className="text-sm text-gray-500">{member.position}</p>
                  </div>
                </div>
                <span className={getStatusBadge(member.employmentStatus)}>
                  {member.employmentStatus}
                </span>
              </div>

              {/* Contact Information */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="w-4 h-4 mr-2" />
                  {member.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="w-4 h-4 mr-2" />
                  {member.phone}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="w-4 h-4 mr-2" />
                  {member.department}
                </div>
              </div>

              {/* Specialization */}
              <div className="mb-4">
                <p className="text-sm font-medium text-gray-700 mb-1">Specialization:</p>
                <p className="text-sm text-gray-600">{member.specialization}</p>
              </div>

              {/* Teaching Load */}
              <div className="mb-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm font-medium text-gray-700">Teaching Load</span>
                  <span className={`text-sm font-medium ${getLoadColor(loadPercentage)}`}>
                    {member.currentSemesterLoad}/{member.maxUnits} units ({loadPercentage}%)
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      loadPercentage >= 90 ? 'bg-red-500' : 
                      loadPercentage >= 75 ? 'bg-yellow-500' : 'bg-green-500'
                    }`}
                    style={{ width: `${loadPercentage}%` }}
                  ></div>
                </div>
              </div>

              {/* Subjects Count */}
              <div className="flex items-center justify-between text-sm text-gray-600 mb-4">
                <div className="flex items-center">
                  <BookOpen className="w-4 h-4 mr-1" />
                  {member.totalSubjects} subjects
                </div>
                <div className="flex items-center">
                  <Calendar className="w-4 h-4 mr-1" />
                  Since {new Date(member.dateHired).getFullYear()}
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
                <button className="flex items-center justify-center gap-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm">
                  <Edit className="w-4 h-4" />
                  Edit
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {filteredFaculty.length === 0 && (
        <div className="text-center py-12">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
          <p className="mt-1 text-sm text-gray-500">
            Try adjusting your search or filter criteria.
          </p>
        </div>
      )}

      {/* Faculty Details Modal */}
      {showModal && selectedFaculty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-start mb-6">
              <h2 className="text-2xl font-bold text-gray-900">Faculty Details</h2>
              <button 
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Basic Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Name</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.name}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Position</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.position}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Department</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.department}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Employment Status</label>
                    <span className={getStatusBadge(selectedFaculty.employmentStatus)}>
                      {selectedFaculty.employmentStatus}
                    </span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Education</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.education}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Experience</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.experience}</p>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Contact Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Email</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.email}</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Phone</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.phone}</p>
                  </div>
                </div>
              </div>

              {/* Teaching Load Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Teaching Load</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Current Load</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.currentSemesterLoad} units</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Maximum Load</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.maxUnits} units</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">Total Subjects</label>
                    <p className="text-sm text-gray-900">{selectedFaculty.totalSubjects} subjects</p>
                  </div>
                </div>
              </div>

              {/* Specialization */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">Specialization</h3>
                <p className="text-sm text-gray-900">{selectedFaculty.specialization}</p>
              </div>
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button 
                onClick={() => setShowModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
              <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfile;
