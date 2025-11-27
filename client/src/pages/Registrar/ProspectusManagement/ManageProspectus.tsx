import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { programDescription } from "../../../utils/getProgramDescription";
import {
  Trash2,
  Plus,
  BookOpen,
  Save,
  Search,
  GraduationCap,
  Calendar,
} from "lucide-react";
import { useAppDispatch, useAppSelector } from "../../../hooks/redux";
import { searchSubject, fetchSubjects } from "../../../services/subjectSlice";
import {
  createCurriculum,
  fetchCurriculumByProgramAndYear,
} from "../../../services/curriculumSlice";
import { useToast } from "../../../hooks/useToast";
import api from "../../../api/axios";

type Subject = {
  id: number;
  code: string;
  name: string;
  lec: number;
  lab: number;
  units: number;
  programCode?: string;
  yearLevel?: string;
  room?: string;
  instructor?: string;
  schedule?: { day: string; time: string };
  curriculumId?: number;
  isExisting?: boolean;
};

type Semester = "1st Semester" | "2nd Semester" | "Summer";

const ManageProspectus = () => {
  const { programCode, yearLevel } = useParams<{
    programCode: string;
    yearLevel: string;
  }>();

  const createEmptySubject = (): Subject => ({
    id: Date.now() + Math.random(),
    code: "",
    name: "",
    lec: 0,
    lab: 0,
    units: 0,
    yearLevel: yearLevel,
    programCode: programCode,
    isExisting: false,
  });

  const initialSubjects: Record<Semester, Subject[]> = {
    "1st Semester": [createEmptySubject()],
    "2nd Semester": [createEmptySubject()],
    Summer: [createEmptySubject()],
  };

  const { academicPrograms } = useAppSelector((state) => state.academicProgram);
  const subjectList = useAppSelector((state) => state.subject.subjects);
  const { curriculums, isLoading } = useAppSelector(
    (state) => state.curriculum
  );
  const dispatch = useAppDispatch();
  const toast = useToast();
  const [subjects, setSubjects] = useState(initialSubjects);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeRow, setActiveRow] = useState<{
    semester: Semester;
    id: number;
    field: "code" | "name";
  } | null>(null);
  const [academicYears, setAcademicYears] = useState<any[]>([]);
  const [currentCurriculumYear, setCurrentCurriculumYear] = useState<string>("");
  const [selectedSemester, setSelectedSemester] = useState<Semester | "All">("All");


  useEffect(() => {
    dispatch(fetchSubjects());
    dispatch(searchSubject(""));
 
    const loadAcademicYears = async () => {
    try {
      const response = await api.get('/academic-years');
      if (response.data.success) {
        setAcademicYears(response.data.data);
        // Set the active academic year as default
        const activeYear = response.data.data.find((year: any) => year.isActive);
        if (activeYear) {
          setCurrentCurriculumYear(activeYear.year);
        }
      }
    } catch (error) {
      console.error('Error loading academic years:', error);
      toast.error('Failed to load academic years');
    }
  };


    loadAcademicYears();
  }, [dispatch, programCode, yearLevel]);

  // Fetch curriculum when curriculum year changes
  useEffect(() => {
    if (programCode && yearLevel && currentCurriculumYear) {
      console.log('📚 Fetching curriculum for:', { programCode, yearLevel, currentCurriculumYear });
      dispatch(
        fetchCurriculumByProgramAndYear({
          programCode,
          yearLevel: yearLevel.replace(/%20/g, " "),
        })
      );
    }
  }, [dispatch, programCode, yearLevel, currentCurriculumYear]);


  useEffect(() => {
    // Don't process if curriculum year is not set yet
    if (!currentCurriculumYear) {
      console.log('⏳ Waiting for curriculum year to be set...');
      return;
    }
    
    if (curriculums && typeof curriculums === "object") {
      const loadedSubjects: Record<Semester, Subject[]> = {
        "1st Semester": [],
        "2nd Semester": [],
        Summer: [],
      };

      let hasAnySubjects = false;

      Object.entries(curriculums).forEach(([semester, subjectArray]) => {
        if (Array.isArray(subjectArray) && subjectArray.length > 0) {
          // Filter subjects by curriculum year
          const filteredSubjects = subjectArray.filter((subj: any) => subj.curriculumYear === currentCurriculumYear);

          if (filteredSubjects.length > 0) {
            hasAnySubjects = true;
            loadedSubjects[semester as Semester] = filteredSubjects.map(
              (subj: any) => {
                const mappedSubject = {
                  id: subj.id || Date.now() + Math.random(),
                  code: subj.subjectCode || subj.code || "",
                  name: subj.subjectDescription || subj.name || "",
                  lec: subj.lec || 0,
                  lab: subj.lab || 0,
                  units: subj.units || 0,
                  programCode: programCode,
                  yearLevel: yearLevel,
                  curriculumId: subj.id,
                  curriculumYear: subj.curriculumYear,
                  isExisting: true,
                };
                return mappedSubject;
              }
            );
          }
        }
      });

      // Only add empty subjects if the semester has no data from the database
      Object.keys(loadedSubjects).forEach((semester) => {
        if (loadedSubjects[semester as Semester].length === 0) {
          loadedSubjects[semester as Semester] = [createEmptySubject()];
        }
      });
      setSubjects(loadedSubjects);
    } else {
      setSubjects(initialSubjects);
    }
  }, [curriculums, programCode, yearLevel, currentCurriculumYear]);

  const handleAddSubject = (semester: Semester) => {
    const newSubject: Subject = createEmptySubject();
    setSubjects((prev) => ({
      ...prev,
      [semester]: [...prev[semester], newSubject],
    }));
  };

  const handleDeleteSubject = async (semester: Semester, id: number) => {
    // Find the subject to check if it's an existing one
    const subjectToDelete = subjects[semester].find((subj) => subj.id === id);
    
    if (subjectToDelete?.isExisting && subjectToDelete?.curriculumId) {
      // If it's an existing subject, delete from database
      try {
        const response = await api.delete(`/curriculum/subject/${subjectToDelete.curriculumId}`);
        console.log('Delete response:', response.data);
        toast.success("Subject deleted successfully from database");
        
        // Reload curriculum data to reflect changes
        if (programCode && yearLevel) {
          dispatch(
            fetchCurriculumByProgramAndYear({
              programCode,
              yearLevel: yearLevel.replace(/%20/g, " "),
            })
          );
        }
      } catch (error) {
        console.error("Error deleting subject:", error);
        toast.error("Failed to delete subject from database");
        return; // Don't remove from UI if database delete failed
      }
    } else {
      // For new (unsaved) subjects, just remove from UI
      setSubjects((prev) => {
        const updatedSemester = prev[semester].filter((subj) => subj.id !== id);

        // Only ensure at least one empty subject if this is the last subject
        if (updatedSemester.length === 0) {
          updatedSemester.push(createEmptySubject());
        }

        return {
          ...prev,
          [semester]: updatedSemester,
        };
      });
      toast.success("Subject removed");
    }
  };

  const checkDuplicateSubject = (semester: Semester, subjectCode: string, currentSubjectId: number): boolean => {
    return subjects[semester].some(
      (subject) => subject.code === subjectCode && subject.id !== currentSubjectId
    );
  };

  const handleChange = (
    semester: Semester,
    id: number,
    field: keyof Subject,
    value: string
  ) => {
    setSubjects((prev) => ({
      ...prev,
      [semester]: prev[semester].map((subject) => {
        if (subject.id === id) {
          const updatedSubject = {
            ...subject,
            [field]:
              field === "lec" || field === "lab" || field === "units"
                ? Number(value)
                : value,
          };
          
          // Auto-calculate units when lec or lab changes
          if (field === "lec" || field === "lab") {
            updatedSubject.units = updatedSubject.lec + updatedSubject.lab;
          }
          
          return updatedSubject;
        }
        return subject;
      }),
    }));
  };

  const handleSubjectCodeBlur = (semester: Semester, id: number, code: string) => {
    if (code.trim() && checkDuplicateSubject(semester, code, id)) {
      toast.error(`Subject ${code} already exists in ${semester}`);
      // Clear the duplicate code
      setSubjects((prev) => ({
        ...prev,
        [semester]: prev[semester].map((subject) =>
          subject.id === id ? { ...subject, code: "", name: "" } : subject
        ),
      }));
    }
  };

  const filteredSubjects = subjectList.filter(
    (s) =>
      s.subjectCode?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.subjectDescription?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSave = () => {
    // Validate that at least one subject has content
    const hasValidSubjects = Object.values(subjects).some((semesterSubjects) =>
      semesterSubjects.some(
        (subject) => subject.code.trim() !== "" && subject.name.trim() !== ""
      )
    );

    if (!hasValidSubjects) {
      toast.error("Please add at least one subject before saving");
      return;
    }

    if (!currentCurriculumYear) {
      toast.error("Please select a curriculum year");
      return;
    }

    // Prepare data with curriculum year
    const data = {
      subjects: Object.entries(subjects).flatMap(([semester, subjectArray]) =>
        subjectArray
          .filter((subject) => {
            // Only include subjects that have actual content
            const hasContent =
              subject.code.trim() !== "" && subject.name.trim() !== "";
            return hasContent;
          })
          .map((subject) => ({
            id: subject.isExisting ? subject.curriculumId : undefined,
            subjectCode: subject.code,
            subjectDescription: subject.name,
            lec: subject.lec,
            lab: subject.lab,
            units: subject.units,
            programCode: subject.programCode,
            yearLevel: subject.yearLevel,
            period: semester,
            curriculumYear: currentCurriculumYear,
            room: subject.room ?? null,
            instructor: subject.instructor ?? null,
            schedule: subject.schedule ?? null,
          }))
      ),
    };

    // Save directly without modal
    dispatch(createCurriculum(data as any))
      .unwrap()
      .then(() => {
        toast.success(`Curriculum saved successfully for ${currentCurriculumYear}`);
        // Reload the curriculum data to reflect the changes
        if (programCode && yearLevel) {
          dispatch(
            fetchCurriculumByProgramAndYear({
              programCode,
              yearLevel: yearLevel.replace(/%20/g, " "),
            })
          );
        }
      })
      .catch(() => {
        toast.error("Failed to save curriculum");
      });
  };

  const getTotalUnits = (semester: Semester) => {
    return subjects[semester].reduce(
      (total, subject) => total + subject.units,
      0
    );
  };

  const getSemesterIcon = (semester: Semester) => {
    switch (semester) {
      case "1st Semester":
        return <BookOpen className="w-5 h-5 text-blue-600" />;
      case "2nd Semester":
        return <GraduationCap className="w-5 h-5 text-green-600" />;
      case "Summer":
        return (
          <div className="w-5 h-5 bg-yellow-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
            S
          </div>
        );
      default:
        return null;
    }
  };

  const getSemesterColor = (semester: Semester) => {
    switch (semester) {
      case "1st Semester":
        return "border-l-blue-500 bg-blue-50";
      case "2nd Semester":
        return "border-l-green-500 bg-green-50";
      case "Summer":
        return "border-l-yellow-500 bg-yellow-50";
      default:
        return "border-l-gray-500 bg-gray-50";
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading curriculum data...</p>
        </div>
      </div>
    );
  }
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 border border-gray-200">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-xl">
                <GraduationCap className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-800">
                  {programDescription(programCode ?? "", academicPrograms ?? [])}
                </h1>
                <p className="text-lg text-gray-600 font-medium">
                  {yearLevel?.replace(/%20/g, " ")} Curriculum Management
                </p>
              </div>
            </div>
            
            {/* Filters */}
            <div className="flex items-end gap-4">
              {/* Semester Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-primary" />
                  Semester
                </label>
                <select
                  value={selectedSemester}
                  onChange={(e) => setSelectedSemester(e.target.value as Semester | "All")}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[180px] font-semibold"
                >
                  <option value="All">All Semesters</option>
                  <option value="1st Semester">1st Semester</option>
                  <option value="2nd Semester">2nd Semester</option>
                  <option value="Summer">Summer</option>
                </select>
              </div>
              
              {/* Curriculum Year Filter */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-gray-700 flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  Curriculum Year
                </label>
                <select
                  value={currentCurriculumYear}
                  onChange={(e) => setCurrentCurriculumYear(e.target.value)}
                  className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all min-w-[200px] font-semibold"
                >
                  {academicYears.map((year) => (
                    <option key={year.id} value={year.year}>
                      {year.year} {year.isActive && "✓ Active"}
                    </option>
                  ))}
                </select>
               
              </div>
            </div>
          </div>
          <div className="h-1 bg-gradient-to-r from-primary to-primary_hover rounded-full"></div>
        </div>

        {/* Semester Cards */}
        {(["1st Semester", "2nd Semester", "Summer"] as Semester[])
          .filter((semester) => selectedSemester === "All" || selectedSemester === semester)
          .map((semester) => (
            <div
              key={semester}
              className={`bg-white rounded-2xl shadow-lg border-l-4 ${getSemesterColor(
                semester
              )} overflow-visible transition-all duration-300 hover:shadow-xl`}
            >
              {/* Semester Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    {getSemesterIcon(semester)}
                    <h2 className="text-2xl font-bold text-gray-800">
                      {semester}
                    </h2>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="bg-gray-100 px-4 py-2 rounded-lg">
                      <span className="text-sm font-medium text-gray-600">
                        Total Units:
                      </span>
                      <span className="ml-2 text-lg font-bold text-primary">
                        {getTotalUnits(semester)}
                      </span>
                    </div>
                    <button
                      onClick={() => handleAddSubject(semester)}
                      className="flex items-center gap-2 bg-primary hover:bg-primary_hover text-white px-4 py-2 rounded-lg transition-colors duration-200 font-medium"
                    >
                      <Plus className="w-4 h-4" />
                      Add Subject
                    </button>
                  </div>
                </div>
              </div>

              {/* Table Container - Removed overflow restrictions */}
              <div className="w-full">
                <table className="w-full">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-200">
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[150px]">
                        Subject Code
                      </th>
                      <th className="text-left p-4 font-semibold text-gray-700 min-w-[300px]">
                        Subject Description
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700 w-20">
                        Lec
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700 w-20">
                        Lab
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700 w-20">
                        Units
                      </th>
                      <th className="text-center p-4 font-semibold text-gray-700 w-24">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {subjects[semester].map((subject, index) => (
                      <tr
                        key={subject.id}
                        className={`border-b border-gray-100 hover:bg-gray-50 transition-colors duration-150 ${
                          index % 2 === 0 ? "bg-white" : "bg-gray-50/50"
                        }`}
                      >
                        {/* Subject Code */}
                        <td className="p-4 relative">
                          <div className="relative">
                            <input
                              type="text"
                              value={subject.code}
                              onChange={(e) => {
                                const value = e.target.value;
                                handleChange(
                                  semester,
                                  subject.id,
                                  "code",
                                  value
                                );
                                setSearchQuery(value);
                                setActiveRow({
                                  semester,
                                  id: subject.id,
                                  field: "code",
                                });
                              }}
                              onBlur={() => {
                                setTimeout(() => setActiveRow(null), 200);
                                handleSubjectCodeBlur(semester, subject.id, subject.code);
                              }}
                              className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                              placeholder="e.g., CS101"
                            />
                            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                          </div>

                          {/* Dropdown for subject code - Removed height restrictions */}
                          {activeRow?.semester === semester &&
                            activeRow.id === subject.id &&
                            activeRow.field === "code" &&
                            searchQuery && (
                              <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 w-full min-w-[300px]">
                                <div className="max-h-[400px] overflow-y-auto">
                                  {filteredSubjects.length > 0 ? (
                                    filteredSubjects.map((subj) => (
                                      <div
                                        key={subj.id}
                                        onClick={() => {
                                          if (checkDuplicateSubject(semester, subj.subjectCode || '', subject.id)) {
                                            toast.error(`Subject ${subj.subjectCode} already exists in ${semester}`);
                                            return;
                                          }
                                          setSubjects((prev) => ({
                                            ...prev,
                                            [semester]: prev[semester].map(
                                              (s) =>
                                                s.id === subject.id
                                                  ? {
                                                      ...s,
                                                      code: subj.subjectCode || '',
                                                      name: subj.subjectDescription || '',
                                                      lec: subj.lec || 0,
                                                      lab: subj.lab || 0,
                                                      units: (subj.lec || 0) + (subj.lab || 0),
                                                    }
                                                  : s
                                            ),
                                          }));
                                          setSearchQuery("");
                                          setActiveRow(null);
                                        }}
                                        className="p-4 hover:bg-primary/5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                      >
                                        <div className="font-semibold text-primary text-sm">
                                          {subj.subjectCode}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          {subj.subjectDescription}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Lec: {subj.lec} | Lab: {subj.lab} |
                                          Units: {subj.units}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-4 text-gray-500 text-sm italic text-center">
                                      No subjects found matching "{searchQuery}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </td>

                        {/* Subject Description */}
                        <td className="p-4 relative">
                          <input
                            type="text"
                            value={subject.name}
                            onChange={(e) => {
                              const value = e.target.value;
                              handleChange(semester, subject.id, "name", value);
                              setSearchQuery(value);
                              setActiveRow({
                                semester,
                                id: subject.id,
                                field: "name",
                              });
                            }}
                            onBlur={() =>
                              setTimeout(() => setActiveRow(null), 200)
                            }
                            className="w-full p-3 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            placeholder="Enter subject description"
                          />

                          {/* Dropdown for subject name - Removed height restrictions */}
                          {activeRow?.semester === semester &&
                            activeRow.id === subject.id &&
                            activeRow.field === "name" &&
                            searchQuery && (
                              <div className="absolute z-50 bg-white border border-gray-200 rounded-lg shadow-xl mt-1 w-full min-w-[400px]">
                                <div className="max-h-[400px] overflow-y-auto">
                                  {filteredSubjects.length > 0 ? (
                                    filteredSubjects.map((subj) => (
                                      <div
                                        key={subj.id}
                                        onClick={() => {
                                          if (checkDuplicateSubject(semester, subj.subjectCode || '', subject.id)) {
                                            toast.error(`Subject ${subj.subjectCode} already exists in ${semester}`);
                                            return;
                                          }
                                          setSubjects((prev) => ({
                                            ...prev,
                                            [semester]: prev[semester].map(
                                              (s) =>
                                                s.id === subject.id
                                                  ? {
                                                      ...s,
                                                      code: subj.subjectCode || '',
                                                      name: subj.subjectDescription || '',
                                                      lec: subj.lec || 0,
                                                      lab: subj.lab || 0,
                                                      units: (subj.lec || 0) + (subj.lab || 0),
                                                    }
                                                  : s
                                            ),
                                          }));
                                          setSearchQuery("");
                                          setActiveRow(null);
                                        }}
                                        className="p-4 hover:bg-primary/5 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors duration-150"
                                      >
                                        <div className="font-semibold text-primary text-sm">
                                          {subj.subjectCode}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-1">
                                          {subj.subjectDescription}
                                        </div>
                                        <div className="text-xs text-gray-500 mt-1">
                                          Lec: {subj.lec} | Lab: {subj.lab} |
                                          Units: {subj.units}
                                        </div>
                                      </div>
                                    ))
                                  ) : (
                                    <div className="p-4 text-gray-500 text-sm italic text-center">
                                      No subjects found matching "{searchQuery}"
                                    </div>
                                  )}
                                </div>
                              </div>
                            )}
                        </td>

                        {/* Lecture Hours */}
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            value={subject.lec}
                            onChange={(e) =>
                              handleChange(
                                semester,
                                subject.id,
                                "lec",
                                e.target.value
                              )
                            }
                            className="w-16 p-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            min={0}
                          />
                        </td>

                        {/* Laboratory Hours */}
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            value={subject.lab}
                            onChange={(e) =>
                              handleChange(
                                semester,
                                subject.id,
                                "lab",
                                e.target.value
                              )
                            }
                            className="w-16 p-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200"
                            min={0}
                          />
                        </td>

                        {/* Units */}
                        <td className="p-4 text-center">
                          <input
                            type="number"
                            value={subject.units}
                            onChange={(e) =>
                              handleChange(
                                semester,
                                subject.id,
                                "units",
                                e.target.value
                              )
                            }
                            className="w-16 p-2 border border-gray-300 rounded-lg text-center text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all duration-200 font-semibold"
                            min={0}
                          />
                        </td>

                        {/* Actions */}
                        <td className="p-4 text-center">
                          <div className="flex gap-2 justify-center">
                            {(subjects[semester].length > 1 || subject.isExisting) && (
                              <button
                                onClick={() =>
                                  handleDeleteSubject(semester, subject.id)
                                }
                                className="p-2 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                                title="Delete subject"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}

                    {subjects[semester].length === 0 && (
                      <tr>
                        <td
                          colSpan={6}
                          className="text-center text-gray-500 p-8 italic"
                        >
                          <div className="flex flex-col items-center gap-2">
                            <BookOpen className="w-8 h-8 text-gray-300" />
                            <span>No subjects added yet</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )
        )}

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            onClick={handleSave}
            className="flex items-center gap-3 bg-primary hover:bg-primary_hover text-white px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
          >
            <Save className="w-5 h-5" />
            Save Curriculum
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManageProspectus;
