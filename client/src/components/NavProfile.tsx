import { LuLogOut, LuUserRound } from "react-icons/lu";
import { useAppDispatch, useAppSelector } from "../hooks/redux";
import { logout } from "../services/authSlice";
import { Link, useNavigate } from "react-router-dom";
import { getDashboardRoute } from "../utils/getDashboardRoute";
const NavProfile = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const userData = useAppSelector((state) => state.auth.user);
  
  const dashboardRoute = userData?.role ? getDashboardRoute(userData.role) : "/dashboard";

  const handleLogout = async () => {
    try {
      await dispatch(logout()).unwrap();
      navigate("/home");
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <div className="h-32 rounded-lg py-4 relative bg-white shadow-lg text-gray-700 z-50">
      <ul>
        <li className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer">
          <Link to={dashboardRoute} className="flex gap-2 items-center">
            <span className="text-green-600 text-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v6H8V5z" />
              </svg>
            </span>
            Dashboard
          </Link>
        </li>
        <li className="flex w-full items-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer">
          <Link to={"/user-profile"} className="flex gap-2 items-center">
            <span className="text-blue-600 text-lg">
              <LuUserRound />
            </span>
            Profile
          </Link>
        </li>
        <li
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-200 cursor-pointer"
        >
          <span className="text-red-600 text-lg">
            <LuLogOut />
          </span>
          Logout
        </li>
      </ul>
    </div>
  );
};

export default NavProfile;
