import { useParams } from "react-router-dom";
import YearLevelsTable from "../../../components/tables/YearLevel";
import { programDescription } from "../../../utils/getProgramDescription";
import { useAppSelector } from "../../../hooks/redux";
const CourseOffering = () => {
  const { programCode } = useParams<{ programCode: string }>();
  const { academicPrograms } = useAppSelector((state) => state.academicProgram);

  return (
    <div>
      <h1 className="text-lg lg:text-3xl font-extrabold text-primary tracking-tight mb-4">
        {programDescription(programCode ?? "", academicPrograms ?? [])}
      </h1>

      <YearLevelsTable programCode={programCode ?? ""} />
    </div>
  );
};

export default CourseOffering;
