import React, { useState, useEffect } from 'react';
import { Search, Plus, Edit, Trash2, Eye, UserX, UserCheck, CheckCircle, X, User as UserIcon } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import api from '../../../api/axios';
import { useToast } from '../../../hooks/useToast';
import InputField from '../../../components/input_field/InputField';
import SelectField from '../../../components/input_field/SelectField';
import MultiSelectField from '../../../components/input_field/MultiSelectField';
import Button from '../../../components/buttons/Button';
import { designationList, program, specializationOptions } from '../../../constants/constants';

interface User {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial: string;
  email: string;
  role: string;
  designation: string;
  department: string;
  status: 'PENDING' | 'VERIFIED' | 'APPROVED';
  createdAt: string;
  updatedAt: string;
  image?: string;
  specialization?: any;
}

const ManageUser = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const toast = useToast();

  // Fetch users from API
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      const response = await api.get('/user');
      console.log('Fetched users:', response.data);
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to fetch users');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter users based on search
  const filteredUsers = users.filter(user => {
    const fullName = `${user.firstname} ${user.lastname}`.toLowerCase();
    const matchesSearch = fullName.includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.role.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const getStatusBadge = (status: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (status) {
      case 'APPROVED':
        return `${baseClasses} bg-green-100 text-green-800`;
      case 'VERIFIED':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'PENDING':
        return `${baseClasses} bg-yellow-100 text-yellow-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const getRoleBadge = (role: string) => {
    const baseClasses = 'px-2 py-1 rounded-full text-xs font-medium';
    switch (role) {
      case 'Faculty':
        return `${baseClasses} bg-blue-100 text-blue-800`;
      case 'Registrar':
        return `${baseClasses} bg-purple-100 text-purple-800`;
      case 'Campus Admin':
        return `${baseClasses} bg-indigo-100 text-indigo-800`;
      case 'Department Head':
        return `${baseClasses} bg-orange-100 text-orange-800`;
      default:
        return `${baseClasses} bg-gray-100 text-gray-800`;
    }
  };

  const handleViewUser = (user: User) => {
    setSelectedUser(user);
    setShowViewModal(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = async (userId: number) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await api.delete(`/user/${userId}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        console.error('Error deleting user:', error);
        toast.error('Failed to delete user');
      }
    }
  };

  const handleToggleStatus = async (userId: number, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'APPROVED' ? 'PENDING' : 'APPROVED';
      await api.put(`/user/${userId}`, { status: newStatus });
      toast.success(`User status updated to ${newStatus}`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const handleApproveUser = async (userId: number) => {
    try {
      await api.put(`/user/${userId}`, { status: 'APPROVED' });
      toast.success('User approved successfully');
      fetchUsers();
    } catch (error) {
      console.error('Error approving user:', error);
      toast.error('Failed to approve user');
    }
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;

    try {
      await api.put(`/user/${selectedUser.id}`, {
        firstname: selectedUser.firstname,
        lastname: selectedUser.lastname,
        middleInitial: selectedUser.middleInitial,
        email: selectedUser.email,
        role: selectedUser.role,
        designation: selectedUser.designation,
        department: selectedUser.department,
      });
      toast.success('User updated successfully');
      setShowEditModal(false);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update user');
    }
  };

  return (
    <div className="p-6 bg-gray-50 min-h-screen">

      {/* Controls */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <input
              type="text"
              placeholder="Search users by name, email, or role..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent w-full"
            />
          </div>

        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-sm border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date Created
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        {user.image ? (
                          <img
                            className="h-10 w-10 rounded-full object-cover"
                            src={user.image.startsWith('http') ? user.image : `${api.defaults.baseURL}/${user.image}`}
                            alt={`${user.firstname} ${user.lastname}`}
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                            <UserIcon className="h-6 w-6 text-gray-500" />
                          </div>
                        )}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {user.firstname} {user.middleInitial}. {user.lastname}
                        </div>
                        <div className="text-sm text-gray-500">{user.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getRoleBadge(user.role)}>
                      {user.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {user.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={getStatusBadge(user.status)}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleViewUser(user)}
                        className="flex items-center gap-1 px-3 py-1.5 text-blue-600 hover:bg-blue-50 rounded-md transition-colors"
                        title="View Details"
                      >
                        <Eye className="h-4 w-4" />
                        <span className="text-xs font-medium">View</span>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="flex items-center gap-1 px-3 py-1.5 text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                        title="Edit User"
                      >
                        <Edit className="h-4 w-4" />
                        <span className="text-xs font-medium">Edit</span>
                      </button>
                      {user.status === 'VERIFIED' && (
                        <button
                          onClick={() => handleApproveUser(user.id)}
                          className="flex items-center gap-1 px-3 py-1.5 text-green-600 hover:bg-green-50 rounded-md transition-colors"
                          title="Approve User"
                        >
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-xs font-medium">Approve</span>
                        </button>
                      )}
                     
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="flex items-center gap-1 px-3 py-1.5 text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Delete User"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span className="text-xs font-medium">Delete</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <UserX className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No users found</h3>
            <p className="mt-1 text-sm text-gray-500">Try adjusting your search or filter criteria.</p>
          </div>
        )}
      </div>

      {/* View User Modal */}
      {showViewModal && selectedUser && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center p-4 z-50" onClick={() => setShowViewModal(false)}>
          <div className="bg-white rounded-xl max-w-2xl w-full shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center p-6 border-b border-gray-200">
              <h3 className="text-xl font-semibold text-gray-900">User Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full p-1 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">First Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.firstname}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Name</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.lastname}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Middle Initial</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.middleInitial}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Email</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.email}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Role</label>
                  <span className={getRoleBadge(selectedUser.role)}>{selectedUser.role}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Status</label>
                  <span className={getStatusBadge(selectedUser.status)}>{selectedUser.status}</span>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Department</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.department}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Designation</label>
                  <p className="text-sm font-medium text-gray-900">{selectedUser.designation}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Date Created</label>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedUser.createdAt).toLocaleDateString()}</p>
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">Last Updated</label>
                  <p className="text-sm font-medium text-gray-900">{new Date(selectedUser.updatedAt).toLocaleDateString()}</p>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit User Modal */}
      {showEditModal && selectedUser && (
        <div className="fixed inset-0 z-50 overflow-y-auto flex justify-center items-center bg-black/40">
          <div className="absolute top-2 p-4 w-full max-w-xl">
            <div className="relative bg-white rounded-lg shadow">
              {/* Header */}
              <div className="flex items-center justify-between p-4 md:p-5 border-b rounded-t border-gray-200">
                <h3 className="text-xl font-semibold text-gray-900">
                  Edit User
                </h3>
                <button
                  onClick={() => setShowEditModal(false)}
                  type="button"
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm w-8 h-8 inline-flex justify-center items-center"
                >
                  <svg
                    className="w-3 h-3"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 14 14"
                    fill="none"
                  >
                    <path
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M1 1l6 6m0 0l6 6M7 7l6-6M7 7l-6 6"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>

              {/* Body */}
              <div className="p-4 md:p-5">
                <form onSubmit={handleUpdateUser} className="space-y-4 w-full">
                  <div className="w-full m-0 flex sm:flex-row flex-col items-center justify-center sm:gap-2">
                    <div className="w-full">
                      <InputField
                        label="First Name"
                        id="firstname"
                        name="firstname"
                        value={selectedUser.firstname}
                        onChange={(e) => setSelectedUser({...selectedUser, firstname: e.target.value})}
                        placeholder="Enter first name"
                        error=""
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        label="Last Name"
                        id="lastname"
                        name="lastname"
                        value={selectedUser.lastname}
                        onChange={(e) => setSelectedUser({...selectedUser, lastname: e.target.value})}
                        placeholder="Enter last name"
                        error=""
                      />
                    </div>
                    <div className="w-full">
                      <InputField
                        label="Middle Initial"
                        id="middleInitial"
                        name="middleInitial"
                        value={selectedUser.middleInitial}
                        onChange={(e) => setSelectedUser({...selectedUser, middleInitial: e.target.value})}
                        placeholder="M"
                        error=""
                      />
                    </div>
                  </div>

                  <InputField
                    label="Email"
                    id="email"
                    name="email"
                    type="email"
                    value={selectedUser.email}
                    onChange={(e) => setSelectedUser({...selectedUser, email: e.target.value})}
                    placeholder="Enter email"
                    error=""
                  />

                  <SelectField
                    label="Program"
                    id="department"
                    name="department"
                    value={selectedUser.department}
                    onChange={(e) => setSelectedUser({...selectedUser, department: e.target.value})}
                    options={program?.map((program) => ({
                      value: program.programCode,
                      label: program.programName,
                    }))}
                  />

                  <MultiSelectField
                    label="Specialization"
                    id="specialization"
                    name="specialization"
                    value={selectedUser.specialization ? (Array.isArray(selectedUser.specialization) ? selectedUser.specialization : []) : []}
                    onChange={(name, value) => setSelectedUser({...selectedUser, specialization: value})}
                    placeholder="Select areas of specialization..."
                    options={specializationOptions.map((spec) => ({
                      value: spec,
                      label: spec,
                    }))}
                  />

                  <Button
                    type="submit"
                    label="Save Changes"
                    className="w-full"
                  />

                  <button
                    type="button"
                    onClick={() => setShowEditModal(false)}
                    className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors font-medium"
                  >
                    Cancel
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageUser;
