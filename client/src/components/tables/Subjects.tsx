import type { FC } from "react";
import { useState } from "react";
import { type SubjectTypes } from "../../types/types";
import { FaRegTrashAlt, FaRegEdit, FaRegEye } from "react-icons/fa";
import { useAppDispatch } from "../../hooks/redux";
import { deleteSubject } from "../../services/subjectSlice";
import { useToast } from "../../hooks/useToast";
import UpdateSubject from "../../pages/Registrar/Subjects/UpdateSubject";
import ViewSubjectModal from "../modals/ViewSubjectModal";
interface SubjectsProps {
  subjects: SubjectTypes[];
}

const Subjects: FC<SubjectsProps> = ({ subjects }) => {
  const toast = useToast();
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSubject, setEditSubject] = useState<SubjectTypes | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [viewSubject, setViewSubject] = useState<SubjectTypes | null>(null);
  const dispatch = useAppDispatch();

  const handleEdit = (id: number) => {
    const subject = subjects.find((s) => s.id === id) || null;
    setEditSubject(subject);
    setEditModalOpen(true);
  };

  const handleView = (id: number) => {
    const subject = subjects.find((s) => s.id === id) || null;
    setViewSubject(subject);
    setViewModalOpen(true);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteSubject(id)).unwrap();
    toast.success("Subject deleted successfully");
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Subject Code",
              "Subject Description",
              "Lec",
              "Lab",
              "Units",
              "Actions",
            ].map((header) => (
              <th
                key={header}
                className="border-y  border-gray-200 px-4 py-2 text-center"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {Array.isArray(subjects) && subjects.length > 0 ? (
            subjects.map((sched, idx) => (
              <tr
                key={idx}
                className="hover:bg-gray-100 transition-colors duration-150 text-gray-600"
              >
                <td className="border-t border-gray-200 px-4 py-3">
                  {sched.subjectCode}
                </td>
                <td className="border-t border-gray-200 px-4 py-3">
                  {sched.subjectDescription}
                </td>
                <td className="border-t border-gray-200 px-4 py-3 text-center">
                  {sched.lec}
                </td>
                <td className="border-t border-gray-200 px-4 py-3 text-center">
                  {sched.lab}
                </td>
                <td className="border-t border-gray-200 px-4 py-3 text-center">
                {sched.units}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 text-center">
                <div className="flex justify-center gap-3">
                  <button
                    className="cursor-pointer"
                    onClick={() => sched.id != null && handleView(sched.id)}
                    title="View Details"
                  >
                    <FaRegEye className="text-lg text-blue-600" />
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={() => sched.id != null && handleEdit(sched.id)}
                    title="Edit Subject"
                  >
                    <FaRegEdit className="text-lg text-green-600" />
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={() => sched.id != null && handleDelete(sched.id)}
                    title="Delete Subject"
                  >
                    <FaRegTrashAlt className="text-lg text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))
          ) : (
            <tr>
              <td colSpan={6} className="border-t border-gray-200 px-4 py-8 text-center text-gray-500">
                No subjects found
              </td>
            </tr>
          )}
        </tbody>
      </table>
      {editModalOpen && editSubject && (
        <UpdateSubject
          subject={editSubject}
          onClose={() => setEditModalOpen(false)}
        />
      )}

      {viewModalOpen && viewSubject && (
        <ViewSubjectModal
          subject={viewSubject}
          onClose={() => setViewModalOpen(false)}
        />
      )}
    </div>
  );
};

export default Subjects;
