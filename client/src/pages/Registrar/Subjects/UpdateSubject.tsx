import React, { useState, useEffect } from "react";
import type { FC } from "react";
import type { SubjectTypes } from "../../../types/types";
import { useAppDispatch } from "../../../hooks/redux";
import { updateSubject } from "../../../services/subjectSlice";
import { useToast } from "../../../hooks/useToast";
import MultiSelectField from "../../../components/input_field/MultiSelectField";
import { specializationOptions } from "../../../constants/constants";

interface UpdateSubjectProps {
  subject: SubjectTypes | null;
  onClose: () => void;
}

const UpdateSubject: FC<UpdateSubjectProps> = ({ subject, onClose }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [formData, setFormData] = useState({
    subjectCode: "",
    subjectDescription: "",
    lec: 0,
    lab: 0,
    units: 0,
    tags: [] as string[],
  });

  useEffect(() => {
    if (subject) {
      let parsedTags: string[] = [];
      
      // Handle tags field - parse if it's a string, otherwise use as array
      if (subject.tags) {
        if (typeof subject.tags === 'string') {
          try {
            parsedTags = JSON.parse(subject.tags);
          } catch (error) {
            console.error('Error parsing tags JSON:', error);
            parsedTags = [];
          }
        } else if (Array.isArray(subject.tags)) {
          parsedTags = subject.tags;
        }
      }

      const lecUnits = subject.lec ?? 0;
      const labUnits = subject.lab ?? 0;
      setFormData({
        subjectCode: subject.subjectCode ?? "",
        subjectDescription: subject.subjectDescription ?? "",
        lec: lecUnits,
        lab: labUnits,
        units: lecUnits + labUnits, // Auto-calculate total units
        tags: parsedTags,
      });
    }
  }, [subject]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      const updatedData = {
        ...prev,
        [name]:
          name === "subjectCode" || name === "subjectDescription"
            ? value
            : parseInt(value) || 0,
      };
      
      // Auto-calculate total units when lec or lab changes
      if (name === "lec" || name === "lab") {
        const lecUnits = name === "lec" ? (parseInt(value) || 0) : prev.lec;
        const labUnits = name === "lab" ? (parseInt(value) || 0) : prev.lab;
        updatedData.units = lecUnits + labUnits;
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

  const handleUpdate = () => {
    if (subject?.id == null) return;

    // Prepare form data for submission
    const submitData = {
      ...formData,
      id: subject.id,
      tags: formData.tags && formData.tags.length > 0 ? formData.tags : undefined,
    };

    dispatch(
      updateSubject({
        id: subject.id,
        data: submitData,
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Subject updated successfully");
        onClose();
      })
      .catch((error) => {
        const errorMessage = typeof error === 'string' ? error : 'Failed to update subject';
        toast.error(errorMessage);
      });
  };

  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-lg p-6">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Update Subject
        </h2>

        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Code
            </label>
            <input
              type="text"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Subject Description
            </label>
            <input
              type="text"
              name="subjectDescription"
              value={formData.subjectDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lec Units
              </label>
              <input
                type="number"
                name="lec"
                value={formData.lec}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Lab Units
              </label>
              <input
                type="number"
                name="lab"
                value={formData.lab}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Total Units
              </label>
              <input
                type="number"
                name="units"
                value={formData.units}
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center bg-gray-100 text-gray-700 cursor-not-allowed"
              />
            </div>
          </div>
          
          <MultiSelectField
            label="Tags"
            id="tags"
            name="tags"
            value={formData.tags || []}
            onChange={handleMultiSelectChange}
            placeholder="Select tags for this subject..."
            options={specializationOptions.map((spec) => ({
              value: spec,
              label: spec,
            }))}
          />
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleUpdate}
            className="px-4 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpdateSubject;
