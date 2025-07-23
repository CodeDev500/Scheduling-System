import React, { useState, useEffect } from "react";
import type { FC } from "react";
import type { AcademicProgram } from "../../../types/types";
import { useAppDispatch } from "../../../hooks/redux";
import { updateAcademicProgram } from "../../../services/academicProgramSlice";
import { useToast } from "../../../hooks/useToast";

interface UpdateProgramProps {
  program: AcademicProgram | null;
  isOpen: boolean;
  onClose: () => void;
}

const UpdateProgram: FC<UpdateProgramProps> = ({
  program,
  isOpen,
  onClose,
}) => {
  const dispatch = useAppDispatch();
  const toast = useToast();

  const [programCode, setProgramCode] = useState("");
  const [programName, setProgramName] = useState("");

  useEffect(() => {
    if (program) {
      setProgramCode(program.programCode || "");
      setProgramName(program.programName || "");
    }
  }, [program]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!program?.id) return;

    const updated = {
      ...program,
      programCode,
      programName,
    };

    dispatch(updateAcademicProgram({ id: program.id, data: updated }))
      .unwrap()
      .then(() => {
        toast.success("Academic Program updated successfully");
        onClose();
      })
      .catch(() => {
        toast.error("Failed to update academic program");
      });
  };

  if (!isOpen || !program) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 flex items-center justify-center z-50"
      onClick={onClose}
    >
      <div
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg relative"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-lg font-semibold mb-4">Update Academic Program</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium">Program Code</label>
            <input
              type="text"
              value={programCode}
              onChange={(e) => setProgramCode(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium">Program Name</label>
            <input
              type="text"
              value={programName}
              onChange={(e) => setProgramName(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md"
              required
            />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm border rounded-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md"
            >
              Update
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpdateProgram;
