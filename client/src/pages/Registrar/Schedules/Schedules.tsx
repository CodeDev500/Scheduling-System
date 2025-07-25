import Dropdown from "../../../components/dropdown/Dropdown";
import { useState } from "react";
import { MdSearch } from "react-icons/md";
import ScheduleTable from "../../../components/tables/Schedules";

const Schedules = () => {
  const courses = ["BSIT", "BSCS", "BSBA", "BEED"];
  const years = ["1st Year", "2nd Year", "3rd Year", "4th Year"];
  const [search, setSearch] = useState("");

  const [selectedCourse, setSelectedCourse] = useState("Search Course");
  const [selectedYear, setSelectedYear] = useState("Select Year");

  const handleCourseFilter = (course: string) => {
    setSelectedCourse(course);
    console.log("Selected Course:", course);
  };

  const handleYearFilter = (year: string) => {
    setSelectedYear(year);
    console.log("Selected Year Level:", year);
  };

  return (
    <div className="flex w-full justify-between flex-col">
      <div className="flex justify-between gap-4 flex-col lg:flex-row">
        <div className="flex items-center gap-4">
          <h1 className="text-lg font-bold whitespace-nowrap">
            Filter Schedule by:
          </h1>
          <Dropdown
            data={courses}
            option={selectedCourse}
            handleFilter={handleCourseFilter}
          />
          <Dropdown
            data={years}
            option={selectedYear}
            handleFilter={handleYearFilter}
          />
        </div>

        <div className="relative flex-shrink-0 w-full max-w-sm">
          <MdSearch className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xl pointer-events-none" />
          <input
            type="text"
            placeholder="Search..."
            className="w-full p-2 pr-10 border border-gray-300 rounded-lg"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <ScheduleTable
      // search={search}
      // selectedCourse={selectedCourse}
      // selectedYear={selectedYear}
      />
    </div>
  );
};

export default Schedules;
