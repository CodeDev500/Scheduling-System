import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '../../../components/ui/dialog';
import { Users, Save, Edit, X } from 'lucide-react';
import DashboardHeader from '../../../components/dashboard/DashboardHeader';
import { toast } from 'react-toastify';
import api from '../../../api/axios';

interface FacultyUnitsSettings {
  facultyMaxUnits: number;
}

const Settings: React.FC = () => {
  const [facultySettings, setFacultySettings] = useState<FacultyUnitsSettings>({
    facultyMaxUnits: 18
  });
  
  const [isEditing, setIsEditing] = useState(false);
  const [tempSettings, setTempSettings] = useState<FacultyUnitsSettings>(facultySettings);
  const [isLoading, setIsLoading] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Load settings on component mount
  useEffect(() => {
    loadFacultySettings();
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

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <DashboardHeader 
          title="Faculty Units Settings" 
          subtitle="Configure maximum teaching units for faculty members"
        />

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