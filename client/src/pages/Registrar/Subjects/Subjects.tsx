import { useEffect, useState } from "react";
import Button from "../../../components/buttons/Button";
import SearchField from "../../../components/input_field/SearchField";
import SubjectsTable from "../../../components/tables/Subjects";
import { useAppSelector } from "../../../hooks/redux";
import AddSubject from "./AddSubject";
import { fetchSubjects, searchSubject } from "../../../services/subjectSlice";
import { useAppDispatch } from "../../../hooks/redux";

const Subjects = () => {
  const subjects = useAppSelector((state) => state.subject.subjects);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dispatch = useAppDispatch();

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
  };

  useEffect(() => {
    dispatch(fetchSubjects());
    if (searchTerm) {
      dispatch(searchSubject(searchTerm));
    } else {
      dispatch(fetchSubjects());
    }
  }, [searchTerm, dispatch]);

  return (
    <div>
      <div className="flex justify-between gap-4 flex-col md:flex-row mb-4">
        <Button
          label="Add Subject"
          type="button"
          className="bg-primary"
          onClick={() => setIsAddModalOpen(true)}
        />
        <SearchField onChange={handleSearch} />
      </div>

      <SubjectsTable subjects={subjects} />

      {isAddModalOpen && (
        <AddSubject onClose={() => setIsAddModalOpen(false)} />
      )}
    </div>
  );
};

export default Subjects;
