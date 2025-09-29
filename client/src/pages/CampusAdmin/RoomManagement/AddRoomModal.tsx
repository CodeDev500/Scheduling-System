import React, { useState } from "react";
import { useToast } from "../../../hooks/useToast";
import api from "../../../api/axios";

interface Room {
  id: number;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

interface AddRoomModalProps {
  onClose: () => void;
  onRoomAdded: (room: Room) => void;
}

const AddRoomModal: React.FC<AddRoomModalProps> = ({ onClose, onRoomAdded }) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; capacity?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear error when user starts typing
    if (formErrors[name as keyof typeof formErrors]) {
      setFormErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const validateForm = (): boolean => {
    const errors: { name?: string; capacity?: string } = {};
    
    if (!formData.name.trim()) {
      errors.name = 'Room name is required';
    }
    
    if (!formData.capacity.trim()) {
      errors.capacity = 'Capacity is required';
    } else if (isNaN(Number(formData.capacity)) || Number(formData.capacity) <= 0) {
      errors.capacity = 'Capacity must be a positive number';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const requestData = {
        name: formData.name.trim(),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await api.post('/rooms', requestData);
      
      if (response.data.success) {
        toast.success('Room added successfully');
        onRoomAdded(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to add room');
      }
    } catch (error: any) {
      console.error('Error adding room:', error);
      toast.error(error.response?.data?.message || 'Failed to add room');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New Room</h2>

        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-600">Room Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter room name"
            />
            {formErrors.name && (
              <p className="text-red-500 text-xs mt-1">{formErrors.name}</p>
            )}
          </div>
          
          <div>
            <label className="text-sm text-gray-600">Capacity</label>
            <input
              type="number"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                formErrors.capacity ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Enter room capacity"
              min="1"
            />
            {formErrors.capacity && (
              <p className="text-red-500 text-xs mt-1">{formErrors.capacity}</p>
            )}
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
          >
            {submitting ? 'Adding...' : 'Add Room'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddRoomModal;