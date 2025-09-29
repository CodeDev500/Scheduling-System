import React, { useState, useEffect } from 'react';
import { Search, Filter, User, Mail, Phone, MapPin, Calendar, BookOpen, Award, Clock, Eye, Edit, Plus, X, ChevronDown, ChevronUp } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';

interface Faculty {
  id: string;
  name: string;
  email: string;
  phone: string;
  department: string;
  position: string;
  employmentType: 'Full-time' | 'Part-time' | 'Adjunct';
  status: 'Active' | 'On Leave' | 'Inactive';
  hireDate: string;
  specialization: string[];
  education: EducationRecord[];
  experience: ExperienceRecord[];
  currentLoad: {
    units: number;
    maxUnits: number;
    courses: number;
  };
  contactInfo: {
    office: string;
    officeHours: string;
    emergencyContact: string;
  };
  achievements: Achievement[];
  avatar?: string;
}

interface EducationRecord {
  degree: string;
  institution: string;
  year: string;
  field: string;
}

interface ExperienceRecord {
  position: string;
  institution: string;
  duration: string;
  description: string;
}

interface Achievement {
  title: string;
  date: string;
  type: 'Award' | 'Certification' | 'Publication' | 'Research';
  description: string;
}

const FacultyProfile = () => {
  const [faculty, setFaculty] = useState<Faculty[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterEmploymentType, setFilterEmploymentType] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState<Faculty | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [expandedSections, setExpandedSections] = useState<string[]>(['basic']);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  useEffect(() => {
    // Mock faculty data
    const mockFaculty: Faculty[] = [
      {
        id: 'FAC001',
        name: 'Dr. Maria Santos',
        email: 'maria.santos@university.edu',
        phone: '+63 912 345 6789',
        department: 'Computer Science',
        position: 'Associate Professor',
        employmentType: 'Full-time',
        status: 'Active',
        hireDate: '2018-08-15',
        specialization: ['Data Structures', 'Algorithms', 'Software Engineering', 'Database Systems'],
        education: [
          {
            degree: 'Ph.D. in Computer Science',
            institution: 'University of the Philippines',
            year: '2017',
            field: 'Software Engineering'
          },
          {
            degree: 'M.S. in Computer Science',
            institution: 'Ateneo de Manila University',
            year: '2013',
            field: 'Computer Science'
          },
          {
            degree: 'B.S. in Computer Science',
            institution: 'De La Salle University',
            year: '2011',
            field: 'Computer Science'
          }
        ],
        experience: [
          {
            position: 'Senior Software Engineer',
            institution: 'Accenture Philippines',
            duration: '2017-2018',
            description: 'Led development teams in enterprise software solutions'
          },
          {
            position: 'Assistant Professor',
            institution: 'Mapua University',
            duration: '2013-2017',
            description: 'Taught undergraduate computer science courses'
          }
        ],
        currentLoad: {
          units: 18,
          maxUnits: 21,
          courses: 6
        },
        contactInfo: {
          office: 'Room 302, CS Building',
          officeHours: 'MWF 2:00-4:00 PM',
          emergencyContact: '+63 917 123 4567'
        },
        achievements: [
          {
            title: 'Outstanding Faculty Award',
            date: '2023-05-15',
            type: 'Award',
            description: 'Recognized for excellence in teaching and research'
          },
          {
            title: 'Machine Learning Certification',
            date: '2022-11-20',
            type: 'Certification',
            description: 'Advanced certification in Machine Learning from Coursera'
          },
          {
            title: 'Research on AI in Education',
            date: '2023-03-10',
            type: 'Research',
            description: 'Published research paper on AI applications in educational systems'
          }
        ]
      },
      {
        id: 'FAC002',
        name: 'Prof. John Dela Cruz',
        email: 'john.delacruz@university.edu',
        phone: '+63 918 765 4321',
        department: 'Information Technology',
        position: 'Professor',
        employmentType: 'Full-time',
        status: 'Active',
        hireDate: '2015-06-01',
        specialization: ['Database Systems', 'Web Development', 'Network Administration', 'Programming'],
        education: [
          {
            degree: 'Ph.D. in Information Technology',
            institution: 'Technological University of the Philippines',
            year: '2014',
            field: 'Information Systems'
          },
          {
            degree: 'M.S. in Information Technology',
            institution: 'Polytechnic University of the Philippines',
            year: '2010',
            field: 'Information Technology'
          },
          {
            degree: 'B.S. in Information Technology',
            institution: 'Technological University of the Philippines',
            year: '2008',
            field: 'Information Technology'
          }
        ],
        experience: [
          {
            position: 'IT Manager',
            institution: 'Globe Telecom',
            duration: '2012-2015',
            description: 'Managed IT infrastructure and database systems'
          },
          {
            position: 'Database Administrator',
            institution: 'Smart Communications',
            duration: '2008-2012',
            description: 'Maintained and optimized database systems'
          }
        ],
        currentLoad: {
          units: 21,
          maxUnits: 21,
          courses: 7
        },
        contactInfo: {
          office: 'Room 205, IT Building',
          officeHours: 'TTH 1:00-3:00 PM',
          emergencyContact: '+63 919 876 5432'
        },
        achievements: [
          {
            title: 'Best Research Paper Award',
            date: '2022-12-05',
            type: 'Award',
            description: 'Best paper in Database Systems conference'
          },
          {
            title: 'Oracle Database Certification',
            date: '2021-08-15',
            type: 'Certification',
            description: 'Oracle Certified Professional Database Administrator'
          }
        ]
      },
      {
        id: 'FAC003',
        name: 'Ms. Ana Rodriguez',
        email: 'ana.rodriguez@university.edu',
        phone: '+63 920 123 4567',
        department: 'Information Technology',
        position: 'Assistant Professor',
        employmentType: 'Part-time',
        status: 'Active',
        hireDate: '2020-01-15',
        specialization: ['Mobile Development', 'UI/UX Design', 'Programming', 'Human-Computer Interaction'],
        education: [
          {
            degree: 'M.S. in Computer Science',
            institution: 'University of Santo Tomas',
            year: '2019',
            field: 'Human-Computer Interaction'
          },
          {
            degree: 'B.S. in Information Technology',
            institution: 'Far Eastern University',
            year: '2017',
            field: 'Information Technology'
          }
        ],
        experience: [
          {
            position: 'Mobile App Developer',
            institution: 'Thinking Machines Data Science',
            duration: '2019-2020',
            description: 'Developed mobile applications for data visualization'
          },
          {
            position: 'UI/UX Designer',
            institution: 'Freelance',
            duration: '2017-2019',
            description: 'Designed user interfaces for various web and mobile applications'
          }
        ],
        currentLoad: {
          units: 9,
          maxUnits: 12,
          courses: 3
        },
        contactInfo: {
          office: 'Room 108, IT Building',
          officeHours: 'MW 10:00-12:00 PM',
          emergencyContact: '+63 921 234 5678'
        },
        achievements: [
          {
            title: 'Mobile App Design Award',
            date: '2023-01-20',
            type: 'Award',
            description: 'Best mobile app design in university competition'
          },
          {
            title: 'Google UX Design Certificate',
            date: '2022-06-30',
            type: 'Certification',
            description: 'Professional certificate in UX Design from Google'
          }
        ]
      },
      {
        id: 'FAC004',
        name: 'Dr. Robert Kim',
        email: 'robert.kim@university.edu',
        phone: '+63 922 345 6789',
        department: 'Computer Science',
        position: 'Associate Professor',
        employmentType: 'Full-time',
        status: 'Active',
        hireDate: '2019-09-01',
        specialization: ['Machine Learning', 'Artificial Intelligence', 'Data Science', 'Neural Networks'],
        education: [
          {
            degree: 'Ph.D. in Computer Science',
            institution: 'Stanford University',
            year: '2018',
            field: 'Machine Learning'
          },
          {
            degree: 'M.S. in Computer Science',
            institution: 'Massachusetts Institute of Technology',
            year: '2014',
            field: 'Artificial Intelligence'
          },
          {
            degree: 'B.S. in Computer Engineering',
            institution: 'University of California, Berkeley',
            year: '2012',
            field: 'Computer Engineering'
          }
        ],
        experience: [
          {
            position: 'Research Scientist',
            institution: 'Google AI',
            duration: '2018-2019',
            description: 'Conducted research on neural network architectures'
          },
          {
            position: 'Machine Learning Engineer',
            institution: 'Facebook',
            duration: '2014-2018',
            description: 'Developed ML models for recommendation systems'
          }
        ],
        currentLoad: {
          units: 15,
          maxUnits: 21,
          courses: 5
        },
        contactInfo: {
          office: 'Room 401, CS Building',
          officeHours: 'MWF 3:00-5:00 PM',
          emergencyContact: '+63 923 456 7890'
        },
        achievements: [
          {
            title: 'AI Research Excellence Award',
            date: '2023-08-10',
            type: 'Award',
            description: 'Outstanding contribution to AI research'
          },
          {
            title: 'Deep Learning Specialization',
            date: '2022-04-15',
            type: 'Certification',
            description: 'Deep Learning Specialization from deeplearning.ai'
          },
          {
            title: 'Neural Networks in Education',
            date: '2023-06-20',
            type: 'Publication',
            description: 'Published paper on neural network applications in education'
          }
        ]
      },
      {
        id: 'FAC005',
        name: 'Prof. Lisa Chen',
        email: 'lisa.chen@university.edu',
        phone: '+63 924 567 8901',
        department: 'Information Technology',
        position: 'Professor',
        employmentType: 'Full-time',
        status: 'On Leave',
        hireDate: '2012-03-01',
        specialization: ['Network Security', 'Cybersecurity', 'Information Security', 'Ethical Hacking'],
        education: [
          {
            degree: 'Ph.D. in Information Security',
            institution: 'Carnegie Mellon University',
            year: '2011',
            field: 'Cybersecurity'
          },
          {
            degree: 'M.S. in Computer Science',
            institution: 'Georgia Institute of Technology',
            year: '2007',
            field: 'Network Security'
          },
          {
            degree: 'B.S. in Computer Science',
            institution: 'University of California, Los Angeles',
            year: '2005',
            field: 'Computer Science'
          }
        ],
        experience: [
          {
            position: 'Security Consultant',
            institution: 'Deloitte Consulting',
            duration: '2011-2012',
            description: 'Provided cybersecurity consulting for enterprise clients'
          },
          {
            position: 'Security Analyst',
            institution: 'Symantec Corporation',
            duration: '2007-2011',
            description: 'Analyzed security threats and developed countermeasures'
          }
        ],
        currentLoad: {
          units: 0,
          maxUnits: 18,
          courses: 0
        },
        contactInfo: {
          office: 'Room 301, IT Building',
          officeHours: 'On Leave',
          emergencyContact: '+63 925 678 9012'
        },
        achievements: [
          {
            title: 'Cybersecurity Excellence Award',
            date: '2022-10-15',
            type: 'Award',
            description: 'Recognition for outstanding work in cybersecurity education'
          },
          {
            title: 'CISSP Certification',
            date: '2020-12-01',
            type: 'Certification',
            description: 'Certified Information Systems Security Professional'
          },
          {
            title: 'Security Framework Research',
            date: '2022-07-30',
            type: 'Research',
            description: 'Research on advanced security frameworks for educational institutions'
          }
        ]
      }
    ];

    setFaculty(mockFaculty);
  }, []);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const openFacultyModal = (facultyMember: Faculty) => {
    setSelectedFaculty(facultyMember);
    setIsModalOpen(true);
    setExpandedSections(['basic', 'contact', 'load']);
  };

  const closeFacultyModal = () => {
    setSelectedFaculty(null);
    setIsModalOpen(false);
  };

  const filteredFaculty = faculty.filter(member => {
    const matchesSearch = member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         member.specialization.some(spec => spec.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = filterDepartment === 'all' || member.department === filterDepartment;
    const matchesStatus = filterStatus === 'all' || member.status === filterStatus;
    const matchesEmploymentType = filterEmploymentType === 'all' || member.employmentType === filterEmploymentType;
    
    return matchesSearch && matchesDepartment && matchesStatus && matchesEmploymentType;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'On Leave': return 'bg-yellow-100 text-yellow-800';
      case 'Inactive': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getEmploymentTypeColor = (type: string) => {
    switch (type) {
      case 'Full-time': return 'bg-blue-100 text-blue-800';
      case 'Part-time': return 'bg-purple-100 text-purple-800';
      case 'Adjunct': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'Award': return <Award className="w-4 h-4 text-yellow-500" />;
      case 'Certification': return <BookOpen className="w-4 h-4 text-blue-500" />;
      case 'Publication': return <BookOpen className="w-4 h-4 text-green-500" />;
      case 'Research': return <BookOpen className="w-4 h-4 text-purple-500" />;
      default: return <Award className="w-4 h-4 text-gray-500" />;
    }
  };

  const getWorkloadPercentage = (current: number, max: number) => {
    return max > 0 ? (current / max) * 100 : 0;
  };

  const getWorkloadColor = (percentage: number) => {
    if (percentage >= 100) return 'bg-red-500';
    if (percentage >= 80) return 'bg-yellow-500';
    if (percentage >= 60) return 'bg-blue-500';
    return 'bg-green-500';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader title="Faculty Profiles" />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Controls */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-4 flex-1">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search faculty..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full sm:w-64"
              />
            </div>
            
            {/* Filters */}
            <div className="flex gap-2">
              <select
                value={filterDepartment}
                onChange={(e) => setFilterDepartment(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Departments</option>
                <option value="Computer Science">Computer Science</option>
                <option value="Information Technology">Information Technology</option>
              </select>
              
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="On Leave">On Leave</option>
                <option value="Inactive">Inactive</option>
              </select>
              
              <select
                value={filterEmploymentType}
                onChange={(e) => setFilterEmploymentType(e.target.value)}
                className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Types</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Adjunct">Adjunct</option>
              </select>
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="flex gap-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'grid' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Grid
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-3 py-1 text-sm rounded-md transition-colors ${
                  viewMode === 'list' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                List
              </button>
            </div>
          </div>
        </div>

        {/* Faculty Grid/List */}
        {viewMode === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFaculty.map((member) => {
              const workloadPercentage = getWorkloadPercentage(member.currentLoad.units, member.currentLoad.maxUnits);
              
              return (
                <div key={member.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow">
                  <div className="p-6">
                    {/* Header */}
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center">
                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-6 h-6 text-blue-600" />
                        </div>
                        <div className="ml-3">
                          <h3 className="text-lg font-medium text-gray-900">{member.name}</h3>
                          <p className="text-sm text-gray-500">{member.position}</p>
                        </div>
                      </div>
                      <div className="flex flex-col gap-1">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                          {member.status}
                        </span>
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getEmploymentTypeColor(member.employmentType)}`}>
                          {member.employmentType}
                        </span>
                      </div>
                    </div>
                    
                    {/* Department */}
                    <div className="mb-4">
                      <p className="text-sm text-gray-600">{member.department}</p>
                      <p className="text-xs text-gray-500">{member.email}</p>
                    </div>
                    
                    {/* Specialization */}
                    <div className="mb-4">
                      <p className="text-xs font-medium text-gray-700 mb-2">Specialization</p>
                      <div className="flex flex-wrap gap-1">
                        {member.specialization.slice(0, 3).map((spec, index) => (
                          <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                        {member.specialization.length > 3 && (
                          <span className="text-xs text-gray-500">+{member.specialization.length - 3} more</span>
                        )}
                      </div>
                    </div>
                    
                    {/* Current Load */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-medium text-gray-700">Current Load</span>
                        <span className="text-xs text-gray-600">
                          {member.currentLoad.units}/{member.currentLoad.maxUnits} units
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getWorkloadColor(workloadPercentage)}`}
                          style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-500 mt-1">{member.currentLoad.courses} courses</p>
                    </div>
                    
                    {/* Actions */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => openFacultyModal(member)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg text-sm flex items-center justify-center gap-2 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                        View Profile
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Faculty
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Department
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Load
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Specialization
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFaculty.map((member) => {
                    const workloadPercentage = getWorkloadPercentage(member.currentLoad.units, member.currentLoad.maxUnits);
                    
                    return (
                      <tr key={member.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                              <User className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900">{member.name}</div>
                              <div className="text-sm text-gray-500">{member.position}</div>
                              <div className="text-xs text-gray-400">{member.email}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{member.department}</div>
                          <div className="text-xs text-gray-500">{member.employmentType}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(member.status)}`}>
                            {member.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">
                            {member.currentLoad.units}/{member.currentLoad.maxUnits} units
                          </div>
                          <div className="w-20 bg-gray-200 rounded-full h-2 mt-1">
                            <div 
                              className={`h-2 rounded-full ${getWorkloadColor(workloadPercentage)}`}
                              style={{ width: `${Math.min(workloadPercentage, 100)}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-gray-500">{member.currentLoad.courses} courses</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1">
                            {member.specialization.slice(0, 2).map((spec, index) => (
                              <span key={index} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                                {spec}
                              </span>
                            ))}
                            {member.specialization.length > 2 && (
                              <span className="text-xs text-gray-500">+{member.specialization.length - 2}</span>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <button
                            onClick={() => openFacultyModal(member)}
                            className="text-blue-600 hover:text-blue-900 flex items-center gap-1"
                          >
                            <Eye className="w-4 h-4" />
                            View
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {filteredFaculty.length === 0 && (
          <div className="text-center py-12">
            <User className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No faculty found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || filterDepartment !== 'all' || filterStatus !== 'all' || filterEmploymentType !== 'all'
                ? 'Try adjusting your search or filters.'
                : 'No faculty data available.'}
            </p>
          </div>
        )}
      </div>

      {/* Faculty Detail Modal */}
      {isModalOpen && selectedFaculty && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-gray-900">Faculty Profile</h3>
              <button
                onClick={closeFacultyModal}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            
            <div className="max-h-96 overflow-y-auto">
              {/* Basic Information */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('basic')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Basic Information</h4>
                  {expandedSections.includes('basic') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('basic') && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <User className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.name}</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.position}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">{selectedFaculty.department}</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.employmentType}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Calendar className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Hire Date</p>
                        <p className="text-sm text-gray-500">{new Date(selectedFaculty.hireDate).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <div className="w-5 h-5 mr-3 flex items-center justify-center">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedFaculty.status)}`}>
                          {selectedFaculty.status}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Contact Information */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('contact')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Contact Information</h4>
                  {expandedSections.includes('contact') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('contact') && (
                  <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center">
                      <Mail className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Email</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.email}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Phone className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Phone</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.phone}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <MapPin className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Office</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.contactInfo.office}</p>
                      </div>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-5 h-5 text-gray-400 mr-3" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">Office Hours</p>
                        <p className="text-sm text-gray-500">{selectedFaculty.contactInfo.officeHours}</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Current Load */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('load')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Current Teaching Load</h4>
                  {expandedSections.includes('load') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('load') && (
                  <div className="mt-4">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div className="bg-blue-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-blue-900">Current Units</p>
                        <p className="text-2xl font-bold text-blue-600">{selectedFaculty.currentLoad.units}</p>
                      </div>
                      <div className="bg-green-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-green-900">Max Units</p>
                        <p className="text-2xl font-bold text-green-600">{selectedFaculty.currentLoad.maxUnits}</p>
                      </div>
                      <div className="bg-purple-50 p-4 rounded-lg">
                        <p className="text-sm font-medium text-purple-900">Courses</p>
                        <p className="text-2xl font-bold text-purple-600">{selectedFaculty.currentLoad.courses}</p>
                      </div>
                    </div>
                    <div className="mb-2">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium text-gray-700">Workload</span>
                        <span className="text-sm text-gray-600">
                          {getWorkloadPercentage(selectedFaculty.currentLoad.units, selectedFaculty.currentLoad.maxUnits).toFixed(1)}%
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-3">
                        <div 
                          className={`h-3 rounded-full ${getWorkloadColor(getWorkloadPercentage(selectedFaculty.currentLoad.units, selectedFaculty.currentLoad.maxUnits))}`}
                          style={{ width: `${Math.min(getWorkloadPercentage(selectedFaculty.currentLoad.units, selectedFaculty.currentLoad.maxUnits), 100)}%` }}
                        ></div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Education */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('education')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Education</h4>
                  {expandedSections.includes('education') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('education') && (
                  <div className="mt-4 space-y-3">
                    {selectedFaculty.education.map((edu, index) => (
                      <div key={index} className="border-l-4 border-blue-500 pl-4">
                        <p className="text-sm font-medium text-gray-900">{edu.degree}</p>
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                        <p className="text-xs text-gray-500">{edu.year} • {edu.field}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Experience */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('experience')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Professional Experience</h4>
                  {expandedSections.includes('experience') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('experience') && (
                  <div className="mt-4 space-y-3">
                    {selectedFaculty.experience.map((exp, index) => (
                      <div key={index} className="border-l-4 border-green-500 pl-4">
                        <p className="text-sm font-medium text-gray-900">{exp.position}</p>
                        <p className="text-sm text-gray-600">{exp.institution}</p>
                        <p className="text-xs text-gray-500 mb-1">{exp.duration}</p>
                        <p className="text-sm text-gray-700">{exp.description}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Specialization */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('specialization')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Specialization</h4>
                  {expandedSections.includes('specialization') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('specialization') && (
                  <div className="mt-4">
                    <div className="flex flex-wrap gap-2">
                      {selectedFaculty.specialization.map((spec, index) => (
                        <span key={index} className="text-sm bg-blue-100 text-blue-800 px-3 py-1 rounded-full">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Achievements */}
              <div className="mb-6">
                <button
                  onClick={() => toggleSection('achievements')}
                  className="flex items-center justify-between w-full p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <h4 className="text-md font-medium text-gray-900">Achievements</h4>
                  {expandedSections.includes('achievements') ? 
                    <ChevronUp className="w-5 h-5 text-gray-500" /> : 
                    <ChevronDown className="w-5 h-5 text-gray-500" />
                  }
                </button>
                
                {expandedSections.includes('achievements') && (
                  <div className="mt-4 space-y-3">
                    {selectedFaculty.achievements.map((achievement, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                        {getAchievementIcon(achievement.type)}
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium text-gray-900">{achievement.title}</p>
                            <span className="text-xs text-gray-500">{new Date(achievement.date).toLocaleDateString()}</span>
                          </div>
                          <p className="text-xs text-gray-600 mb-1">{achievement.type}</p>
                          <p className="text-sm text-gray-700">{achievement.description}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default FacultyProfile;