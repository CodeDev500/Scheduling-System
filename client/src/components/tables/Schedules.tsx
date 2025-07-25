import type { FC } from "react";

type Schedule = {
  subjectCode: string;
  subjectDescription: string;
  units: number;
  time: string;
  day: string;
  roomNo: string;
  students: number;
  instructor: string;
};

const schedules: Schedule[] = [
  {
    subjectCode: "CS101",
    subjectDescription: "Introduction to Computer Science",
    units: 3,
    time: "08:00 AM - 09:30 AM",
    day: "Mon/Wed",
    roomNo: "R101",
    students: 35,
    instructor: "Prof. Garcia",
  },
  {
    subjectCode: "IT202",
    subjectDescription: "Web Development",
    units: 3,
    time: "10:00 AM - 11:30 AM",
    day: "Tue/Thu",
    roomNo: "R204",
    students: 40,
    instructor: "Ms. Cruz",
  },
  {
    subjectCode: "BA301",
    subjectDescription: "Business Ethics",
    units: 2,
    time: "01:00 PM - 02:30 PM",
    day: "Mon/Wed",
    roomNo: "R310",
    students: 28,
    instructor: "Mr. Santos",
  },
  {
    subjectCode: "ED405",
    subjectDescription: "Teaching Strategies",
    units: 3,
    time: "03:00 PM - 04:30 PM",
    day: "Tue/Thu",
    roomNo: "R215",
    students: 32,
    instructor: "Dr. Mendoza",
  },
];

const Schedules: FC = () => {
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            {[
              "Subject Code",
              "Subject Description",
              "Units",
              "Time",
              "Day",
              "Room",
              "Students",
              "Instructor",
            ].map((header) => (
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
          {schedules.map((sched, idx) => (
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
                {sched.units}
              </td>
              <td className="border-t border-gray-200 px-4 py-3">
                {sched.time}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 text-center">
                {sched.day}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 text-center">
                {sched.roomNo}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 text-center">
                {sched.students}
              </td>
              <td className="border-t border-gray-200 px-4 py-3">
                {sched.instructor}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Schedules;
