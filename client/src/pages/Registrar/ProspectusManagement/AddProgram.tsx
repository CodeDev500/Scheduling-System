import React, { useState } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { createAcademicProgram } from "../../../services/academicProgramSlice";
import { useToast } from "../../../hooks/useToast";

interface AddProgramModalProps {
  onClose: () => void;
}

const AddProgramModal: React.FC<AddProgramModalProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [formData, setFormData] = useState({
    programCode: "",
    programName: "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData.programCode.trim() || !formData.programName.trim()) {
      toast.error("Please fill out all fields");
      return;
    }

    dispatch(createAcademicProgram(formData))
      .unwrap()
      .then(() => {
        toast.success("Program added successfully");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to add program");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-lg space-y-5">
        <h2 className="text-xl font-semibold text-gray-800">Add New Program</h2>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Code
            </label>
            <input
              type="text"
              name="programCode"
              value={formData.programCode}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter program code"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Program Name
            </label>
            <input
              type="text"
              name="programName"
              value={formData.programName}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-600"
              placeholder="Enter program name"
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-4">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded bg-gray-200 hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddProgramModal;
