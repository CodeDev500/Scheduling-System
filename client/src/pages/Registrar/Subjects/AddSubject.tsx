import React, { useState } from "react";
import { useAppDispatch } from "../../../hooks/redux";
import { createSubject } from "../../../services/subjectSlice";
import { useToast } from "../../../hooks/useToast";
import { type SubjectTypes } from "../../../types/types";

interface AddSubjectProps {
  onClose: () => void;
}

const AddSubject: React.FC<AddSubjectProps> = ({ onClose }) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [formData, setFormData] = useState<Omit<SubjectTypes, "id">>({
    subjectCode: "",
    subjectDescription: "",
    lec: 0,
    lab: 0,
    units: 0,
  });
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "subjectCode" || name === "subjectDescription"
          ? value
          : parseInt(value),
    }));
  };

  const handleSubmit = () => {
    dispatch(createSubject(formData))
      .unwrap()
      .then(() => {
        toast.success("Subject added successfully");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to add subject");
      });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl space-y-4">
        <h2 className="text-xl font-semibold text-gray-800">Add New Subject</h2>

        <div className="grid gap-3">
          <div>
            <label className="text-sm text-gray-600">Subject Code</label>
            <input
              type="text"
              name="subjectCode"
              value={formData.subjectCode}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="text-sm text-gray-600">Subject Description</label>
            <input
              type="text"
              name="subjectDescription"
              value={formData.subjectDescription}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-sm text-gray-600">Lec Units</label>
              <input
                type="number"
                name="lec"
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
                value={formData.lab}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="text-sm text-gray-600">Total Units</label>
              <input
                type="number"
                name="units"
                value={formData.units}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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
