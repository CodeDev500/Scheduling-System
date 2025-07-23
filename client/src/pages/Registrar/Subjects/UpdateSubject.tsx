import React, { useState, useEffect } from "react";
import type { FC } from "react";
import type { SubjectTypes } from "../../../types/types";
import { useAppDispatch } from "../../../hooks/redux";
import { updateSubject } from "../../../services/subjectSlice";
import { useToast } from "../../../hooks/useToast";

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
  });

  useEffect(() => {
    if (subject) {
      setFormData({
        subjectCode: subject.subjectCode ?? "",
        subjectDescription: subject.subjectDescription ?? "",
        lec: subject.lec ?? 0,
        lab: subject.lab ?? 0,
        units: subject.units ?? 0,
      });
    }
  }, [subject]);

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

  const handleUpdate = () => {
    if (subject?.id == null) return;

    dispatch(
      updateSubject({
        id: subject.id,
        data: {
          ...formData,
          id: subject.id,
        },
      })
    )
      .unwrap()
      .then(() => {
        toast.success("Subject updated successfully");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to update subject");
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
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg text-center focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
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
