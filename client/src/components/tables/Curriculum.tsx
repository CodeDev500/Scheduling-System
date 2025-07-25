import type { FC } from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaRegEdit, FaRegTrashAlt } from "react-icons/fa";
import { type AcademicProgram } from "../../types/types";
import { useAppDispatch } from "../../hooks/redux";
import { useToast } from "../../hooks/useToast";
import { deleteAcademicProgram } from "../../services/academicProgramSlice";
import UpdateProgram from "../../pages/Registrar/ProspectusManagement/UpdateProgram";

type CurriculumProps = {
  academicProgram: AcademicProgram[];
};

const Curriculum: FC<CurriculumProps> = ({ academicProgram }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [editOpenModal, setEditOpenModal] = useState(false);
  const [editProgram, setEditProgram] = useState<AcademicProgram | null>(null);

  const handleEdit = (id: number) => {
    const program = academicProgram.find((p) => p.id === id) || null;
    setEditProgram(program);
    setEditOpenModal(true);
  };

  const handleDelete = (id: number) => {
    dispatch(deleteAcademicProgram(id))
      .unwrap()
      .then(() => {
        toast.success("Academic Program deleted successfully");
      })
      .catch(() => {
        toast.error("Failed to delete academic program");
      });
  };

  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {["Program Code", "Program Name", "Actions"].map((header) => (
              <th
                key={header}
                className="border-y border-gray-200 px-4 py-2 text-left"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-white">
          {academicProgram.map((sched, idx) => (
            <tr
              key={idx}
              onClick={() => navigate(`/course/${sched.programCode}`)}
              className="hover:bg-gray-100 cursor-pointer transition-colors duration-150 text-gray-600"
            >
              <td className="border-t border-gray-200 px-4 py-3">
                {sched.programCode}
              </td>
              <td className="border-t border-gray-200 px-4 py-3">
                {sched.programName}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 text-center">
                <div className="flex justify-center gap-3">
                  <button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sched.id != null) {
                        handleEdit(sched.id);
                      }
                    }}
                    aria-label="Edit program"
                  >
                    <FaRegEdit className="text-lg text-green-600" />
                  </button>
                  <button
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (sched.id != null) {
                        handleDelete(sched.id);
                      }
                    }}
                    aria-label="Delete program"
                  >
                    <FaRegTrashAlt className="text-lg text-red-600" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {editOpenModal && (
        <UpdateProgram
          program={editProgram}
          isOpen={editOpenModal}
          onClose={() => {
            setEditOpenModal(false);
            setEditProgram(null);
          }}
        />
      )}
    </div>
  );
};

export default Curriculum;
