import { IoSearch } from "react-icons/io5";
import React from "react";

interface SearchFieldProps {
  onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const SearchField: React.FC<SearchFieldProps> = ({ onChange }) => {
  return (
    <div className="flex md:max-w-[450px] w-full items-center relative">
      <input
        type="text"
        placeholder="Search..."
        onChange={onChange}
        className="border px-4 h-10 border-[#d67c80] focus:border-blue rounded-xl w-full bg-gray-100 focus:outline-none focus:ring-0 focus:border-blue-600 peer"
      />
      <IoSearch className="text-2xl absolute right-2 text-gray-600" />
    </div>
  );
};

export default SearchField;
