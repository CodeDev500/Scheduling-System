import { useState } from "react";
import { useLocation } from "react-router-dom";
import { FaBars } from "react-icons/fa";
import { IoMdNotificationsOutline } from "react-icons/io";
import userIcon from "../../assets/images/user (1).png";

interface NavDashboardProps {
  handleBurger: () => void;
  sidebar: boolean;
}

const NavDashboard: React.FC<NavDashboardProps> = ({ handleBurger }) => {
  const location = useLocation();
  const [unread, setUnread] = useState(2);

  const pageTitles: { [key: string]: string } = {
    "/dashboard": "Dashboard",
    "/deadlines": "Deadlines",
  };

  const title = pageTitles[location.pathname] || "Page";

  return (
    <div className="w-full text-gray-800 z-20 md:w-[calc(100vw-16rem)] flex gap-5 items-center px-4 flex-grow fixed h-16 bg-gray-100 shadow-sm shadow-gray-400">
      <button
        onClick={handleBurger}
        type="button"
        className="inline-flex items-center md:hidden text-2xl font-bold text-main"
      >
        <FaBars />
      </button>
      <div className="flex justify-between items-center w-full">
        <h1 className="md:text-2xl text-sm font-bold text-main">{title}</h1>
        <div className="flex items-center lg:text-[16px] text-sm sm:gap-4 gap-2">
          <div className="relative flex items-center">
            {unread > 0 && (
              <span className="text-sm px-1.5 absolute right-[-10px] top-[-10px] text-white bg-red-600 rounded-full">
                {unread}
              </span>
            )}
            <button
              onClick={() => setUnread(0)}
              className="flex items-center"
              aria-label="Notifications"
            >
              <IoMdNotificationsOutline className="text-2xl" />
            </button>
          </div>
          <div className="flex items-center sm:gap-3 gap-2">
            <div className="flex flex-col">
              <span className="font-bold">John</span>
              <span className="text-[12px] text-gray-500">Admin</span>
            </div>
            <img
              src={userIcon}
              alt="User"
              className="h-10 w-10 rounded-full cursor-pointer bg-gray-100"
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default NavDashboard;
