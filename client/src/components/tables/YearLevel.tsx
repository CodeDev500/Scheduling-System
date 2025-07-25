import { useNavigate } from "react-router-dom";
import { type FC } from "react";

type YearLevel = {
  id: number;
  name: string;
};

type YearLevelsTableProps = {
  programCode: string;
};

const yearLevels: YearLevel[] = [
  { id: 1, name: "1st Year" },
  { id: 2, name: "2nd Year" },
  { id: 3, name: "3rd Year" },
  { id: 4, name: "4th Year" },
];

const YearLevelsTable: FC<YearLevelsTableProps> = ({ programCode }) => {
  const navigate = useNavigate();
  return (
    <div className="mt-6 overflow-x-auto">
      <table className="w-full text-sm border-separate border-spacing-0 shadow-md rounded-lg overflow-hidden">
        <thead className="bg-gray-100 text-gray-700">
          <tr>
            <th className="border-y border-gray-200 px-4 py-2 text-left">ID</th>
            <th className="border-y border-gray-200 px-4 py-2 text-left">
              Year Level
            </th>
            <th className="border-y border-gray-200 px-4 py-2 justify-center">
              Action
            </th>
          </tr>
        </thead>
        <tbody className="bg-white">
          {yearLevels.map((year) => (
            <tr
              key={year.id}
              onClick={() =>
                navigate(
                  `/manage-prospectus/${programCode}/${encodeURIComponent(
                    year.name
                  )}`
                )
              }
              className="hover:bg-gray-100 transition-colors duration-150 text-gray-600"
            >
              <td className="border-t border-gray-200 px-4 py-3">{year.id}</td>
              <td className="border-t border-gray-200 px-4 py-3">
                {year.name}
              </td>
              <td className="border-t border-gray-200 px-4 py-3 flex justify-center">
                <button className="px-3 py-1  justify-center bg-blue-600 text-white text-xs rounded hover:bg-blue-700">
                  View Semesters
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default YearLevelsTable;
