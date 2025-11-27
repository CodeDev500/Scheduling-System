import React, { useState } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { createSubject } from "../../../services/subjectSlice";
import { useToast } from "../../../hooks/useToast";
import { type SubjectTypes } from "../../../types/types";
import MultiSelectField from "../../../components/input_field/MultiSelectField";
import { useSpecializations } from "../../../hooks/useSpecializations";

interface AddSubjectProps {
  onClose: () => void;
  onSubjectAdded: () => void;
}

const AddSubject: React.FC<AddSubjectProps> = ({ onClose, onSubjectAdded }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();
  const { specializations } = useSpecializations(true);

  const [formData, setFormData] = useState<Omit<SubjectTypes, "id">>({
    subjectCode: "",
    subjectDescription: "",
    lec: 0,
    lab: 0,
    units: 0,
    tags: [],
    prerequisite: [],
  });

  const [prerequisiteInput, setPrerequisiteInput] = useState("");

  const [errors, setErrors] = useState({
    subjectCode: "",
    subjectDescription: "",
    units: "",
  });
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    // Clear error for this field when user starts typing
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
    
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]:
          name === "subjectCode" || name === "subjectDescription"
            ? value
            : parseFloat(value) || 0,
      };
      
      // Auto-calculate total units when lec or lab changes
      if (name === "lec" || name === "lab") {
        const lecUnits = name === "lec" ? (parseFloat(value) || 0) : prev.lec;
        const labUnits = name === "lab" ? (parseFloat(value) || 0) : prev.lab;
        updatedData.units = Math.round((lecUnits + labUnits) * 100) / 100; // Round to 2 decimal places
        
        // Clear units error if total is now valid
        if (lecUnits + labUnits > 0) {
          setErrors((prev) => ({ ...prev, units: "" }));
        }
      }
      
      return updatedData;
    });
  };

  const handleMultiSelectChange = (name: string, value: string[]) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handlePrerequisiteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setPrerequisiteInput(value);
    
    // Split by comma and trim whitespace
    const prereqArray = value
      .split(',')
      .map(item => item.trim())
      .filter(item => item.length > 0);
    
    setFormData((prev) => ({
      ...prev,
      prerequisite: prereqArray,
    }));
  };

  const validateForm = (): boolean => {
    const newErrors = {
      subjectCode: "",
      subjectDescription: "",
      units: "",
    };

    let isValid = true;

    // Validate subject code
    if (!formData.subjectCode.trim()) {
      newErrors.subjectCode = "Subject code is required";
      isValid = false;
    }

    // Validate subject description
    if (!formData.subjectDescription.trim()) {
      newErrors.subjectDescription = "Subject description is required";
      isValid = false;
    }

    // Validate units (must be greater than 0)
    if (formData.units <= 0) {
      newErrors.units = "Total units must be greater than 0";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = () => {
    // Validate form before submission
    if (!validateForm()) {
      toast.error("Please fill in all required fields");
      return;
    }

    // Prepare form data for submission
    const submitData = {
      ...formData,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
      prerequisite: formData.prerequisite && formData.prerequisite.length > 0 ? formData.prerequisite : undefined,
    };

    dispatch(createSubject(submitData))
      .unwrap()
      .then(() => {
        toast.success("Subject added successfully");
        onSubjectAdded();
        onClose();
      })
      .catch((error) => {
        const errorMessage = typeof error === 'string' ? error : error?.message || 'Failed to add subject';
        toast.error(errorMessage);
        console.error('Error adding subject:', error);
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-lg shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New Subject</h2>

        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-600">
              Subject Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.subjectCode
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g., CS101"
            />
            {errors.subjectCode && (
              <p className="text-xs text-red-500 mt-1">{errors.subjectCode}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-600">
              Subject Description <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="subjectDescription"
              value={formData.subjectDescription}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 ${
                errors.subjectDescription
                  ? "border-red-500 focus:ring-red-500"
                  : "border-gray-300 focus:ring-blue-500"
              }`}
              placeholder="e.g., Introduction to Programming"
            />
            {errors.subjectDescription && (
              <p className="text-xs text-red-500 mt-1">{errors.subjectDescription}</p>
            )}
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm text-gray-600">Lec Units</label>
              <input
                type="number"
                name="lec"
                min="0"
                step="0.5"
                value={formData.lec}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Lab Units</label>
              <input
                type="number"
                name="lab"
                min="0"
                step="0.5"
                value={formData.lab}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">
                Total Units <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                name="units"
                value={formData.units}
                readOnly
                className={`w-full px-3 py-2 border rounded-lg bg-gray-100 text-gray-700 cursor-not-allowed ${
                  errors.units ? "border-red-500" : "border-gray-300"
                }`}
              />
            </div>
          </div>
          {errors.units && (
            <p className="text-xs text-red-500 -mt-2">{errors.units}</p>
          )}
          
          <div>
            <label className="text-sm text-gray-600">
              Prerequisite
            </label>
            <input
              type="text"
              value={prerequisiteInput}
              onChange={handlePrerequisiteChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g., CC 100, HIST 100, CC 102"
            />
            <p className="text-xs text-gray-500 mt-1">
              Separate multiple prerequisites with commas
            </p>
          </div>
          
          <MultiSelectField
            label="Tags"
            id="tags"
            name="tags"
            value={formData.tags || []}
            onChange={handleMultiSelectChange}
            placeholder="Select tags for this subject..."
            options={specializations.map((spec) => ({
              value: spec,
              label: spec,
            }))}
          />
        </div>

        <div className="flex justify-end gap-3 pt-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 rounded hover:bg-gray-300"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default AddSubject;
