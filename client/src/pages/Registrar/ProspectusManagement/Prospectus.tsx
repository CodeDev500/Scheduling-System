import { useState } from "react";
import Button from "../../../components/buttons/Button";
import { AiFillPlusCircle } from "react-icons/ai";
import CurriculumTable from "../../../components/tables/Curriculum";
import { useAppSelector } from "../../../hooks/redux";
import AddProgramModal from "./AddProgram"; // import the modal component

const Prospectus = () => {
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);
  const [isModalOpen, setIsModalOpen] = useState(false);

  return (
    <div>
      <div className="flex justify-between gap-4 flex-col md:flex-row mb-4">
        <div className="flex items-center ">
          <h1 className="text-2xl font-bold text-gray-700">
            Academic Programs
          </h1>
        </div>

        <Button
          label="New Program"
          type="button"
          className="bg-primary w-fit"
          icon={<AiFillPlusCircle />}
          onClick={() => setIsModalOpen(true)}
        />
      </div>

      <CurriculumTable academicProgram={academicPrograms} />

      {isModalOpen && <AddProgramModal onClose={() => setIsModalOpen(false)} />}
    </div>
  );
};

export default Prospectus;
