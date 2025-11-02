import React, { useState, useRef, useEffect } from 'react';
import { useAppSelector, useAppDispatch } from '../../hooks/redux';
import { 
  User as UserIcon, 
  Mail, 
  Briefcase, 
  Building2, 
  Shield, 
  Calendar,
  Edit,
  Camera,
  Save,
  X,
  Lock,
  Eye,
  EyeOff,
  Clock,
  BookOpen
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../hooks/useToast';
import { fetchUser } from '../../services/authSlice';
import SelectField from '../../components/input_field/SelectField';
import MultiSelectField from '../../components/input_field/MultiSelectField';
import { designationList, program } from '../../constants/constants';
import { useSpecializations } from '../../hooks/useSpecializations';

// Define User type to avoid conflict with Lucide icon
interface User {
  id: number;
  firstname: string;
  lastname: string;
  middleInitial?: string;
  email: string;
  designation?: string;
  department?: string;
  specialization?: string[];
  role: string;
  status: string;
  image?: string;
  createdAt?: Date;
  updatedAt?: Date;
  yearsOfExperience?: number;
  previousSubjects?: string[];
  availableDays?: string[];
  preferredTimeSlots?: string[];
}

const UserProfile: React.FC = () => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { specializations } = useSpecializations(true);
  const userData = useAppSelector((state) => state.auth.user);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [user, setUser] = useState<User | null>(null);
  
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string>('');
  
  const [editedData, setEditedData] = useState({
    firstname: userData?.firstname || '',
    lastname: userData?.lastname || '',
    middleInitial: userData?.middleInitial || '',
    email: userData?.email || '',
    designation: userData?.designation || '',
    department: userData?.department || '',
    specialization: userData?.specialization || [],
    yearsOfExperience: userData?.yearsOfExperience || 0,
    previousSubjects: userData?.previousSubjects || [],
    availableDays: userData?.availableDays || [],
    preferredTimeSlots: userData?.preferredTimeSlots || []
  });

  // Password change modal state
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  // Fetch user data from database when component mounts or userData.id changes
  useEffect(() => {
    const getUser = async () => {
      if (!userData?.id) return;
      
      try {
        const response = await api.get(`/user/id/${userData.id}`);
        console.log('Fetched user from DB:', response.data);
        setUser(response.data);
        
        // Update editedData with fresh data
        setEditedData({
          firstname: response.data.firstname || '',
          lastname: response.data.lastname || '',
          middleInitial: response.data.middleInitial || '',
          email: response.data.email || '',
          designation: response.data.designation || '',
          department: response.data.department || '',
          specialization: response.data.specialization || [],
          yearsOfExperience: response.data.yearsOfExperience || 0,
          previousSubjects: response.data.previousSubjects || [],
          availableDays: response.data.availableDays || [],
          preferredTimeSlots: response.data.preferredTimeSlots || []
        });
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };
    
    getUser();
  }, [userData?.id]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setImageFile(null);
    setImagePreview('');
    if (user) {
      setEditedData({
        firstname: user.firstname || '',
        lastname: user.lastname || '',
        middleInitial: user.middleInitial || '',
        email: user.email || '',
        designation: user.designation || '',
        department: user.department || '',
        specialization: user.specialization || [],
        yearsOfExperience: user.yearsOfExperience || 0,
        previousSubjects: user.previousSubjects || [],
        availableDays: user.availableDays || [],
        preferredTimeSlots: user.preferredTimeSlots || []
      });
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast.error('Please select a valid image file');
        return;
      }
      
      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }

      setImageFile(file);
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImagePreview(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);

      const formData = new FormData();
      formData.append('firstname', editedData.firstname);
      formData.append('lastname', editedData.lastname);
      formData.append('middleInitial', editedData.middleInitial);
      formData.append('email', editedData.email);
      formData.append('designation', editedData.designation);
      formData.append('department', editedData.department);
      formData.append('specialization', JSON.stringify(editedData.specialization));
      
      if (imageFile) {
        formData.append('image', imageFile);
      }

      // Use the existing /user/:id endpoint
      await api.put(`/user/${userData?.id}`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Fetch fresh user data directly from database by ID
      const response = await api.get(`/user/id/${userData?.id}`);
      const freshUserData = response.data;

      // Update user state with fresh data
      setUser(freshUserData);

      // Update Redux state with fresh data
      await dispatch(fetchUser()).unwrap();

      toast.success('Profile updated successfully!');
      setIsEditing(false);
      setImageFile(null);
      setImagePreview('');
      
      // Update editedData with fresh data immediately
      setEditedData({
        firstname: freshUserData.firstname || '',
        lastname: freshUserData.lastname || '',
        middleInitial: freshUserData.middleInitial || '',
        email: freshUserData.email || '',
        designation: freshUserData.designation || '',
        department: freshUserData.department || '',
        specialization: freshUserData.specialization || [],
        yearsOfExperience: freshUserData.yearsOfExperience || 0,
        previousSubjects: freshUserData.previousSubjects || [],
        availableDays: freshUserData.availableDays || [],
        preferredTimeSlots: freshUserData.preferredTimeSlots || []
      });
    } catch (error: any) {
      console.error('Error updating profile:', error);
      toast.error(error.response?.data?.message || 'Failed to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleMultiSelectChange = (name: string, value: string[]) => {
    setEditedData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleChangePassword = async () => {
    // Validation
    if (!passwordData.currentPassword || !passwordData.newPassword || !passwordData.confirmPassword) {
      toast.error('Please fill in all password fields');
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }

    if (passwordData.newPassword.length < 6) {
      toast.error('New password must be at least 6 characters long');
      return;
    }

    try {
      setIsChangingPassword(true);

      await api.put(`/user/change-password/${userData?.id}`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      toast.success('Password changed successfully!');
      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error: any) {
      console.error('Error changing password:', error);
      toast.error(error.response?.data?.message || 'Failed to change password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  const formatDate = (date: Date | undefined) => {
    if (!date) return 'N/A';
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role?.toLowerCase()) {
      case 'campus admin':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'department head':
      case 'program head':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'registrar':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'faculty':
        return 'bg-orange-100 text-orange-800 border-orange-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'active':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'on leave':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-800 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">My Profile</h1>
          <p className="text-gray-600">Manage your personal information and account settings</p>
        </div>

        {/* Profile Card */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          {/* Cover Image */}
          <div className="h-32 bg-gradient-to-r from-red-800 via-red-700 to-red-900 relative">
            <div className="absolute inset-0 bg-black opacity-10"></div>
          </div>

          {/* Profile Content */}
          <div className="relative px-6 pb-6">
            {/* Avatar */}
            <div className="flex flex-col sm:flex-row items-center sm:items-end -mt-16 mb-6">
              <div className="relative group">
                <div 
                  className={`w-32 h-32 rounded-full border-4 border-white shadow-xl bg-gradient-to-br from-red-100 to-red-50 flex items-center justify-center overflow-hidden ${isEditing ? 'cursor-pointer' : ''}`}
                  onClick={handleImageClick}
                >
                  {imagePreview ? (
                    <img 
                      src={imagePreview} 
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : user.image ? (
                    <img 
                      src={user.image.startsWith('http') ? user.image : `${api.defaults.baseURL}/${user.image}`}
                      alt={`${user.firstname} ${user.lastname}`}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-red-800" />
                  )}
                </div>
                {isEditing && (
                  <>
                    <button 
                      type="button"
                      onClick={handleImageClick}
                      className="absolute bottom-2 right-2 bg-white rounded-full p-2 shadow-lg hover:bg-gray-50 transition-colors group-hover:scale-110 transform duration-200"
                    >
                      <Camera className="w-4 h-4 text-gray-700" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </>
                )}
              </div>

              <div className="sm:ml-6 mt-4 sm:mt-0 text-center sm:text-left flex-1">
                <h2 className="text-2xl font-bold text-gray-900">
                  {user.firstname} {user.middleInitial && `${user.middleInitial}.`} {user.lastname}
                </h2>
                <p className="text-gray-600 mt-1">{user.designation || 'No designation'}</p>
                
                <div className="flex flex-wrap gap-2 mt-3 justify-center sm:justify-start">
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                    <Shield className="w-3 h-3 mr-1" />
                    {user.role}
                  </span>
                  <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(user.status)}`}>
                    <div className="w-2 h-2 rounded-full bg-current mr-1"></div>
                    {user.status}
                  </span>
                </div>
              </div>

              {/* Edit Button */}
              <div className="mt-4 sm:mt-0">
                {!isEditing ? (
                  <button
                    onClick={handleEdit}
                    className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors shadow-md hover:shadow-lg"
                  >
                    <Edit className="w-4 h-4 mr-2" />
                    Edit Profile
                  </button>
                ) : (
                  <div className="flex gap-2">
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSaving ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </>
                      ) : (
                        <>
                          <Save className="w-4 h-4 mr-2" />
                          Save
                        </>
                      )}
                    </button>
                    <button
                      onClick={handleCancel}
                      disabled={isSaving}
                      className="inline-flex items-center px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <X className="w-4 h-4 mr-2" />
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Information Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
              {/* Personal Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Personal Information</h3>
                
                <div className="space-y-4">
                  {/* First Name */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                      First Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="firstname"
                        value={editedData.firstname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.firstname}</p>
                    )}
                  </div>

                  {/* Middle Initial */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                      Middle Initial
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="middleInitial"
                        value={editedData.middleInitial}
                        onChange={handleInputChange}
                        maxLength={1}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.middleInitial || 'N/A'}</p>
                    )}
                  </div>

                  {/* Last Name */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <UserIcon className="w-4 h-4 mr-2 text-gray-500" />
                      Last Name
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        name="lastname"
                        value={editedData.lastname}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.lastname}</p>
                    )}
                  </div>

                  {/* Email */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Mail className="w-4 h-4 mr-2 text-gray-500" />
                      Email
                    </label>
                    {isEditing ? (
                      <input
                        type="email"
                        name="email"
                        value={editedData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      />
                    ) : (
                      <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.email}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Professional Information */}
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 border-b pb-2">Professional Information</h3>
                
                <div className="space-y-4">
                  {/* Designation */}
                  <div>
                    {isEditing ? (
                      <SelectField
                        label="Designation"
                        id="designation"
                        name="designation"
                        value={editedData.designation}
                        onChange={handleSelectChange}
                        options={designationList?.map((designation) => ({
                          value: designation.designation,
                          label: designation.designation,
                        }))}
                      />
                    ) : (
                      <>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                          Designation
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.designation || 'N/A'}</p>
                      </>
                    )}
                  </div>

                  {/* Department */}
                  <div>
                    {isEditing ? (
                      <SelectField
                        label="Program"
                        id="department"
                        name="department"
                        value={editedData.department}
                        onChange={handleSelectChange}
                        options={program?.map((prog) => ({
                          value: prog.programCode,
                          label: prog.programName,
                        }))}
                      />
                    ) : (
                      <>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Building2 className="w-4 h-4 mr-2 text-gray-500" />
                          Department
                        </label>
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.department || 'N/A'}</p>
                      </>
                    )}
                  </div>

                  {/* Specialization */}
                  <div>
                    {isEditing ? (
                      <MultiSelectField
                        label="Specialization"
                        id="specialization"
                        name="specialization"
                        value={editedData.specialization}
                        onChange={handleMultiSelectChange}
                        placeholder="Select your areas of specialization..."
                        options={specializations.map((spec) => ({
                          value: spec,
                          label: spec,
                        }))}
                      />
                    ) : (
                      <>
                        <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                          <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                          Specialization
                        </label>
                        <div className="bg-gray-50 px-4 py-2 rounded-lg">
                          {user.specialization && user.specialization.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {user.specialization.map((spec, index) => (
                                <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                  {spec}
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-gray-900">No specialization set</p>
                          )}
                        </div>
                      </>
                    )}
                  </div>

                  {/* Years of Experience */}
                  {user.role === 'FACULTY' && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
                        Years of Experience
                      </label>
                      {isEditing ? (
                        <input
                          type="number"
                          name="yearsOfExperience"
                          value={editedData.yearsOfExperience || 0}
                          onChange={handleInputChange}
                          min="0"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                        />
                      ) : (
                        <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.yearsOfExperience || 0} years</p>
                      )}
                    </div>
                  )}

                  {/* Preferred Time Slots */}
                  {user.role === 'FACULTY' && (
                    <div>
                      <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        Preferred Time Slots (7:00 AM - 7:00 PM)
                      </label>
                      {isEditing ? (
                        <div className="flex gap-2 items-center">
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">Start Time</label>
                            <input
                              type="time"
                              min="07:00"
                              max="19:00"
                              value={(() => {
                                const slots = editedData.preferredTimeSlots || [];
                                const startSlot = slots.find((s: string) => s.startsWith('start:'));
                                return startSlot ? startSlot.replace('start:', '') : '07:00';
                              })()}
                              onChange={(e) => {
                                const timeSlots = (editedData.preferredTimeSlots || []).filter((slot: string) => !slot.includes('start:'));
                                setEditedData(prev => ({ 
                                  ...prev, 
                                  preferredTimeSlots: [...timeSlots, `start:${e.target.value}`]
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                          <span className="text-gray-500 mt-6">to</span>
                          <div className="flex-1">
                            <label className="block text-xs text-gray-500 mb-1">End Time</label>
                            <input
                              type="time"
                              min="07:00"
                              max="19:00"
                              value={(() => {
                                const slots = editedData.preferredTimeSlots || [];
                                const endSlot = slots.find((s: string) => s.startsWith('end:'));
                                return endSlot ? endSlot.replace('end:', '') : '19:00';
                              })()}
                              onChange={(e) => {
                                const timeSlots = (editedData.preferredTimeSlots || []).filter((slot: string) => !slot.includes('end:'));
                                setEditedData(prev => ({ 
                                  ...prev, 
                                  preferredTimeSlots: [...timeSlots, `end:${e.target.value}`]
                                }));
                              }}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      ) : (
                        <div className="bg-gray-50 px-4 py-2 rounded-lg">
                          {(() => {
                            const slots = user.preferredTimeSlots || [];
                            if (Array.isArray(slots) && slots.length > 0) {
                              let start = '07:00', end = '19:00';
                              slots.forEach((slot: string) => {
                                if (slot.startsWith('start:')) start = slot.replace('start:', '');
                                if (slot.startsWith('end:')) end = slot.replace('end:', '');
                              });
                              return (
                                <span className="inline-flex items-center px-3 py-1 rounded-md text-sm font-medium bg-purple-100 text-purple-800">
                                  {start} - {end}
                                </span>
                              );
                            }
                            return <p className="text-gray-900">Not specified</p>;
                          })()}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Available Days */}
                  {user.role === 'FACULTY' && (
                    <div>
                      {isEditing ? (
                        <MultiSelectField
                          label="Available Days"
                          id="availableDays"
                          name="availableDays"
                          value={editedData.availableDays || []}
                          onChange={handleMultiSelectChange}
                          placeholder="Select days you are available to teach..."
                          options={[
                            { value: "Monday", label: "Monday" },
                            { value: "Tuesday", label: "Tuesday" },
                            { value: "Wednesday", label: "Wednesday" },
                            { value: "Thursday", label: "Thursday" },
                            { value: "Friday", label: "Friday" },
                            { value: "Saturday", label: "Saturday" },
                            { value: "Sunday", label: "Sunday" },
                          ]}
                        />
                      ) : (
                        <>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                            Available Days
                          </label>
                          <div className="bg-gray-50 px-4 py-2 rounded-lg">
                            {user.availableDays && user.availableDays.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.availableDays.map((day, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-green-100 text-green-800">
                                    {day}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-900">Not specified</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Previous Subjects */}
                  {user.role === 'FACULTY' && (
                    <div>
                      {isEditing ? (
                        <MultiSelectField
                          label="Previous Subjects Taught"
                          id="previousSubjects"
                          name="previousSubjects"
                          value={editedData.previousSubjects || []}
                          onChange={handleMultiSelectChange}
                          placeholder="Select subjects you have previously taught..."
                          options={[
                            { value: "Programming", label: "Programming" },
                            { value: "Database Systems", label: "Database Systems" },
                            { value: "Web Development", label: "Web Development" },
                            { value: "Data Structures", label: "Data Structures" },
                            { value: "Algorithms", label: "Algorithms" },
                            { value: "Computer Networks", label: "Computer Networks" },
                            { value: "Operating Systems", label: "Operating Systems" },
                            { value: "Software Engineering", label: "Software Engineering" },
                            { value: "Mathematics", label: "Mathematics" },
                            { value: "Physics", label: "Physics" },
                            { value: "English", label: "English" },
                            { value: "Artificial Intelligence", label: "Artificial Intelligence" },
                            { value: "Machine Learning", label: "Machine Learning" },
                            { value: "Mobile Development", label: "Mobile Development" },
                          ]}
                        />
                      ) : (
                        <>
                          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                            <BookOpen className="w-4 h-4 mr-2 text-gray-500" />
                            Previous Subjects Taught
                          </label>
                          <div className="bg-gray-50 px-4 py-2 rounded-lg">
                            {user.previousSubjects && user.previousSubjects.length > 0 ? (
                              <div className="flex flex-wrap gap-2">
                                {user.previousSubjects.map((subject, index) => (
                                  <span key={index} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                    {subject}
                                  </span>
                                ))}
                              </div>
                            ) : (
                              <p className="text-gray-900">Not specified</p>
                            )}
                          </div>
                        </>
                      )}
                    </div>
                  )}

                  {/* Role */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <Shield className="w-4 h-4 mr-2 text-gray-500" />
                      Role
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.role}</p>
                  </div>

                  {/* Status */}
                  <div>
                    <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                      <div className="w-4 h-4 mr-2 rounded-full bg-green-500"></div>
                      Status
                    </label>
                    <p className="text-gray-900 bg-gray-50 px-4 py-2 rounded-lg">{user.status}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Account Information */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Account Information</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Account Created
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(user.createdAt)}</p>
                </div>
                <div className="bg-gray-50 rounded-lg p-4">
                  <div className="flex items-center text-sm text-gray-600 mb-1">
                    <Calendar className="w-4 h-4 mr-2" />
                    Last Updated
                  </div>
                  <p className="text-gray-900 font-medium">{formatDate(user.updatedAt)}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="mt-8 pt-6 border-t">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Security</h3>
              <button 
                onClick={() => setShowPasswordModal(true)}
                className="inline-flex items-center px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors shadow-md hover:shadow-lg"
              >
                <Lock className="w-4 h-4 mr-2" />
                Change Password
              </button>
            </div>
          </div>
        </div>

        {/* Change Password Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[9999]">
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 relative z-[10000]">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Lock className="w-6 h-6 mr-2 text-red-800" />
                  Change Password
                </h3>
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                {/* Current Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Current Password
                  </label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? "text" : "password"}
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter current password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showCurrentPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? "text" : "password"}
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Enter new password (min 6 characters)"
                    />
                    <button
                      type="button"
                      onClick={() => setShowNewPassword(!showNewPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm New Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confirm New Password
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className="w-full px-4 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent transition-all"
                      placeholder="Confirm new password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Password Requirements */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <p className="text-xs text-blue-800 font-medium mb-1">Password Requirements:</p>
                  <ul className="text-xs text-blue-700 space-y-1">
                    <li>• At least 6 characters long</li>
                    <li>• Must match confirmation password</li>
                  </ul>
                </div>
              </div>

              {/* Modal Actions */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowPasswordModal(false);
                    setPasswordData({
                      currentPassword: '',
                      newPassword: '',
                      confirmPassword: ''
                    });
                  }}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="flex-1 px-4 py-2 bg-red-800 text-white rounded-lg hover:bg-red-900 transition-colors shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isChangingPassword ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Changing...
                    </span>
                  ) : (
                    'Change Password'
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
