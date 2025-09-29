import React, { useState, useEffect } from "react";
import type { FC } from "react";
import { useToast } from "../../../hooks/useToast";
import api from "../../../api/axios";

interface Room {
  id: number;
  name: string;
  capacity: number;
  createdAt: string;
  updatedAt: string;
}

interface EditRoomModalProps {
  room: Room | null;
  onClose: () => void;
  onRoomUpdated: (room: Room) => void;
}

const EditRoomModal: FC<EditRoomModalProps> = ({ room, onClose, onRoomUpdated }) => {
  const toast = useToast();

  const [formData, setFormData] = useState({
    name: "",
    capacity: "",
  });
  const [formErrors, setFormErrors] = useState<{ name?: string; capacity?: string }>({});
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (room) {
      setFormData({
        name: room.name ?? "",
        capacity: room.capacity?.toString() ?? "",
      });
    }
  }, [room]);

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

  const handleUpdate = async () => {
    if (room?.id == null) return;
    if (!validateForm()) return;
    
    setSubmitting(true);
    
    try {
      const requestData = {
        name: formData.name.trim(),
        capacity: parseInt(formData.capacity)
      };
      
      const response = await api.put(`/rooms/${room.id}`, requestData);
      
      if (response.data.success) {
        toast.success('Room updated successfully');
        onRoomUpdated(response.data.data);
        onClose();
      } else {
        toast.error(response.data.message || 'Failed to update room');
      }
    } catch (error: any) {
      console.error('Error updating room:', error);
      toast.error(error.response?.data?.message || 'Failed to update room');
    } finally {
      setSubmitting(false);
    }
  };

  if (!room) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Update Room
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Room Name
            </label>
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
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Capacity
            </label>
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

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            disabled={submitting}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
          >
            {submitting ? 'Updating...' : 'Update'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditRoomModal;