import React from "react";
import type { FC } from "react";
import type { SubjectTypes } from "../../types/types";
import { X } from "lucide-react";

interface ViewSubjectModalProps {
  subject: SubjectTypes | null;
  onClose: () => void;
}

const ViewSubjectModal: FC<ViewSubjectModalProps> = ({ subject, onClose }) => {
  if (!subject) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-2xl shadow-xl w-[90%] max-w-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800">
            Subject Details
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Subject Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Code
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {subject.subjectCode || "N/A"}
            </div>
          </div>

          {/* Subject Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Subject Description
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-gray-800">
              {subject.subjectDescription || "N/A"}
            </div>
          </div>

          {/* Units Information */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Lecture Units
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-800">
                {subject.lec || 0}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Laboratory Units
              </label>
              <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-center text-gray-800">
                {subject.lab || 0}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Total Units
              </label>
              <div className="w-full px-4 py-3 bg-blue-50 border border-blue-200 rounded-lg text-center text-blue-800 font-semibold">
                {subject.units || 0}
              </div>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tags
            </label>
            <div className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg min-h-[50px]">
              {subject.tags && Array.isArray(subject.tags) && subject.tags.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {subject.tags.map((tag, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full border border-blue-200"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              ) : (
                <span className="text-gray-500 italic">No tags assigned</span>
              )}
            </div>
          </div>

        </div>

        <div className="mt-8 flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ViewSubjectModal;