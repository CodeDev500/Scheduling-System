import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Users, Save, Edit, X, Calendar, Plus, Trash2, CheckCircle } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import { toast } from 'react-toastify';
import api from '../../../api/axios';

interface FacultyUnitsSettings {
  facultyMaxUnits: number;
}

interface AcademicYear {
  id: number;
  year: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

const Settings: React.FC = () => {
  const [facultySettings, setFacultySettings] = useState<FacultyUnitsSettings>({
    facultyMaxUnits: 18
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState<FacultyUnitsSettings>(facultySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Academic Year states
  const [academicYears, setAcademicYears] = useState<AcademicYear[]>([]);
  const [newYear, setNewYear] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [yearToDelete, setYearToDelete] = useState<AcademicYear | null>(null);

  // Load settings on component mount
  useEffect(() => {
    loadFacultySettings();
    loadAcademicYears();
  }, []);

  const loadFacultySettings = async () => {
    try {
      setIsLoading(true);
      
      // Fetch total units from API
      const response = await api.get('/total-units');
      
      const data = response.data;
      const totalUnits = data.success && data.data ? data.data.totalUnits : 18;
      
      const settings = {
        facultyMaxUnits: totalUnits
      };
      
      setFacultySettings(settings);
      setTempSettings(settings);
    } catch (error) {
      console.error('Error loading faculty settings:', error);
      toast.error('Failed to load faculty settings');
      
      // Fallback to default settings
      const defaultSettings = {
        facultyMaxUnits: 18
      };
      setFacultySettings(defaultSettings);
      setTempSettings(defaultSettings);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveSettings = async () => {
    try {
      setIsLoading(true);
      
      // Update total units via API
      await api.put('/total-units', {
        totalUnits: tempSettings.facultyMaxUnits
      });
      
      setFacultySettings(tempSettings);
      setIsEditing(false);
      setShowConfirmDialog(false);
      toast.success('Faculty units updated successfully!');
    } catch (error) {
      console.error('Error saving settings:', error);
      toast.error('Failed to update faculty units');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancelEdit = () => {
    setTempSettings(facultySettings);
    setIsEditing(false);
  };

  const handleInputChange = (value: number) => {
    setTempSettings({
      facultyMaxUnits: value
    });
  };

  // Academic Year functions
  const loadAcademicYears = async () => {
    try {
      const response = await api.get('/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data);
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
      toast.error('Failed to load academic years');
    }
  };

  const handleAddYear = async () => {
    if (!newYear.trim()) {
      toast.error('Please enter an academic year');
      return;
    }

    try {
      const response = await api.post('/academic-years', { year: newYear });
      if (response.data.success) {
        toast.success('Academic year added successfully');
        setNewYear('');
        setShowAddDialog(false);
        loadAcademicYears();
      }
    } catch (error: any) {
      console.error('Error adding academic year:', error);
      toast.error(error.response?.data?.message || 'Failed to add academic year');
    }
  };

  const handleSetActive = async (id: number) => {
    try {
      const response = await api.put(`/academic-years/${id}/activate`);
      if (response.data.success) {
        toast.success('Active academic year updated');
        loadAcademicYears();
      }
    } catch (error) {
      console.error('Error setting active year:', error);
      toast.error('Failed to set active academic year');
    }
  };

  const handleDeleteYear = async () => {
    if (!yearToDelete) return;

    try {
      const response = await api.delete(`/academic-years/${yearToDelete.id}`);
      if (response.data.success) {
        toast.success('Academic year deleted successfully');
        setShowDeleteDialog(false);
        setYearToDelete(null);
        loadAcademicYears();
      }
    } catch (error: any) {
      console.error('Error deleting academic year:', error);
      toast.error(error.response?.data?.message || 'Failed to delete academic year');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">

        {/* Faculty Units Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Users className="h-5 w-5 text-blue-600" />
                <CardTitle>Faculty Units Management</CardTitle>
              </div>
              {!isEditing ? (
                <Button 
                  onClick={() => setIsEditing(true)}
                  variant="outline"
                  size="sm"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Edit Settings
                </Button>
              ) : (
                <div className="flex space-x-2">
                  <Button 
                    onClick={() => setShowConfirmDialog(true)}
                    size="sm"
                    disabled={isLoading}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save Changes
                  </Button>
                  <Button 
                    onClick={handleCancelEdit}
                    variant="outline"
                    size="sm"
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4 mr-2" />
                    Cancel
                  </Button>
                </div>
              )}
            </div>
            <CardDescription>
              Set the maximum teaching units for all faculty members. This setting applies globally to all faculty.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="max-w-md space-y-6">
              {/* Faculty Max Units */}
              <div className="space-y-2">
                <Label htmlFor="facultyMaxUnits">Maximum Faculty Units</Label>
                <div className="flex items-center space-x-2">
                  <Input
                    id="facultyMaxUnits"
                    type="number"
                    min="1"
                    max="30"
                    value={isEditing ? tempSettings.facultyMaxUnits : facultySettings.facultyMaxUnits}
                    onChange={(e) => handleInputChange(parseInt(e.target.value))}
                    disabled={!isEditing || isLoading}
                    className="w-24"
                  />
                  <span className="text-sm text-gray-500">units per semester</span>
                </div>
                <p className="text-xs text-gray-500">
                  Standard teaching load limit for all faculty members
                </p>
              </div>

              {/* Current Setting Display */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">Current Setting</h4>
                <div className="text-sm">
                  <span className="text-blue-700 font-medium">Maximum Units:</span>
                  <span className="text-blue-900 ml-2 text-lg font-semibold">{facultySettings.facultyMaxUnits} units</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This limit applies to all faculty members across the system
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Academic Year Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Calendar className="h-5 w-5 text-green-600" />
                <CardTitle>Academic Year Management</CardTitle>
              </div>
              <Button 
                onClick={() => setShowAddDialog(true)}
                size="sm"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Academic Year
              </Button>
            </div>
            <CardDescription>
              Manage academic years and set the currently active year for the system.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {academicYears.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                  <p>No academic years added yet</p>
                  <p className="text-sm">Click "Add Academic Year" to get started</p>
                </div>
              ) : (
                <div className="grid gap-3">
                  {academicYears.map((year) => (
                    <div 
                      key={year.id}
                      className={`flex items-center justify-between p-4 rounded-lg border-2 ${
                        year.isActive 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 bg-white'
                      }`}
                    >
                      <div className="flex items-center space-x-3">
                        {year.isActive && (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        )}
                        <div>
                          <h4 className={`font-semibold ${
                            year.isActive ? 'text-green-900' : 'text-gray-900'
                          }`}>
                            {year.year}
                          </h4>
                          <p className="text-xs text-gray-500">
                            {year.isActive ? 'Currently Active' : 'Inactive'}
                          </p>
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        {!year.isActive && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetActive(year.id)}
                          >
                            Set Active
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => {
                            setYearToDelete(year);
                            setShowDeleteDialog(true);
                          }}
                          disabled={year.isActive}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add Academic Year Dialog */}
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Academic Year</DialogTitle>
              <DialogDescription>
                Enter the academic year in the format: YYYY-YYYY (e.g., 2024-2025)
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Label htmlFor="newYear">Academic Year</Label>
              <Input
                id="newYear"
                placeholder="e.g., 2024-2025"
                value={newYear}
                onChange={(e) => setNewYear(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleAddYear()}
              />
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowAddDialog(false);
                  setNewYear('');
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleAddYear}>
                Add Year
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Delete Academic Year</DialogTitle>
              <DialogDescription>
                Are you sure you want to delete the academic year "{yearToDelete?.year}"? This action cannot be undone.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => {
                  setShowDeleteDialog(false);
                  setYearToDelete(null);
                }}
              >
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={handleDeleteYear}
              >
                Delete
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Confirmation Dialog */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Confirm Faculty Units Update</DialogTitle>
              <DialogDescription>
                Are you sure you want to update the maximum faculty units? This will affect all faculty members and their unit assignments.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm">
                  <span className="text-blue-700 font-medium">New Maximum Faculty Units:</span>
                  <span className="text-blue-900 ml-2 text-lg font-semibold">{tempSettings.facultyMaxUnits} units</span>
                </div>
                <p className="text-xs text-blue-600 mt-1">
                  This change will apply to all faculty members across the system
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button 
                onClick={handleSaveSettings}
                disabled={isLoading}
              >
                {isLoading ? 'Updating...' : 'Confirm Update'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Settings;