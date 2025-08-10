import { useEffect, useState, type JSX } from "react";
import { Link } from "react-router-dom";
import { IoSettingsSharp } from "react-icons/io5";
import { FaUsers } from "react-icons/fa";
import { MdSpaceDashboard } from "react-icons/md";
import { AiOutlineCalendar } from "react-icons/ai";
import { GiTeacher } from "react-icons/gi";
import { TbReportAnalytics } from "react-icons/tb";
import { BiLogOut } from "react-icons/bi";
import { FiChevronDown, FiChevronRight } from "react-icons/fi";
import Logo from "../../assets/images/optischedlogo-Photoroom.png";
import { useAppSelector } from "../../hooks/redux";
import { UserRoles } from "../../constants/constants";
import { FaRegListAlt } from "react-icons/fa";

type LinkItem = {
  title: string;
  path: string;
  src: JSX.Element;
  sublinks?: {
    title: string;
    path: string;
  }[];
};

export type SidebarProps = {
  sidebar: boolean;
  handleBurger: () => void;
};

const Sidebar = ({ sidebar, handleBurger }: SidebarProps) => {
  const user = useAppSelector((state) => state.auth.user);
  const [links, setLinks] = useState<LinkItem[]>([]);

  const [isUserManagementOpen, setIsUserManagementOpen] = useState(false);

  useEffect(() => {
    const adminLinks = [
      {
        title: "Dashboard",
        path: "/admin-dashboard",
        src: <MdSpaceDashboard />,
      },
      {
        title: "View Schedules",
        path: "/schedules",
        src: <AiOutlineCalendar />,
      },
      {
        title: "User Management",
        path: "/users",
        src: <FaUsers />,
        sublinks: [
          { title: "Faculty", path: "/users/faculty" },
          {
            title: "Campus Administrator",
            path: "/users/campus-administrator",
          },
          { title: "ESU Registrar", path: "/users/esu-registrar" },
        ],
      },
      {
        title: "View Teaching Load",
        path: "/teaching-load",
        src: <GiTeacher />,
      },
      { title: "Reports", path: "/report", src: <TbReportAnalytics /> },
      { title: "Settings", path: "/settings", src: <IoSettingsSharp /> },
    ];

    const registrarLinks = [
      {
        title: "Dashboard",
        path: "/registrar-dashboard",
        src: <MdSpaceDashboard />,
      },
      {
        title: "Subjects",
        path: "/subjects",
        src: <FaRegListAlt />,
      },
      {
        title: "View Schedules",
        path: "/registrar-schedules",
        src: <AiOutlineCalendar />,
      },
      {
        title: "Prospectus Management",
        path: "/registrar-prospectus",
        src: <TbReportAnalytics />,
      },
    ];

    const departmentHeadLinks = [
      {
        title: "Dashboard",
        path: "/program-head-dashboard",
        src: <MdSpaceDashboard />,
      },
      {
        title: "Schedule Management",
        path: "/schedule-management",
        src: <AiOutlineCalendar />,
      },
      {
        title: "Faculty Profile",
        path: "/department-head-faculty",
        src: <GiTeacher />,
      },
      {
        title: "View Teaching Load",
        path: "/department-head-teaching-load",
        src: <TbReportAnalytics />,
      },
    ];

    const facultyLinks = [
      {
        title: "Dashboard",
        path: "/faculty-dashboard",
        src: <MdSpaceDashboard />,
      },
      {
        title: "View Schedules",
        path: "/faculty-schedules",
        src: <AiOutlineCalendar />,
      },
      {
        title: "View Teaching Load",
        path: "/faculty-teaching-load",
        src: <TbReportAnalytics />,
      },
    ];

    if (user) {
      if (user.role === UserRoles[0]) {
        setLinks(facultyLinks);
      } else if (user.role === UserRoles[1]) {
        setLinks(departmentHeadLinks);
      } else if (user.role === UserRoles[2]) {
        setLinks(registrarLinks);
      } else {
        setLinks(adminLinks);
      }
    }
  }, [user]);

  const toggleUserManagement = () => {
    setIsUserManagementOpen(!isUserManagementOpen);
  };

  const handleLogout = () => {
    alert("Logged out");
  };

  return (
    <>
      {sidebar && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-30 md:hidden"
          onClick={handleBurger}
        ></div>
      )}
      <aside
        id="logo-sidebar"
        className={`fixed top-0 left-0 z-40 w-64 bg-primary h-screen rounded-br-lg transition-transform transform ${
          sidebar ? "translate-x-0" : "-translate-x-full"
        } md:translate-x-0 md:relative md:transform-none`}
        aria-label="Sidebar"
      >
        <div className="w-64 h-full px-3 py-4 bg-main flex flex-col justify-between">
          <div>
            <div className="flex ps-2.5 mb-5">
              <img src={Logo} className="h-14 me-3 text-center" alt="Logo" />
            </div>
            <ul className="space-y-2 font-medium">
              {links.map((menu, index) => (
                <li key={index}>
                  {menu.sublinks ? (
                    <div>
                      <button
                        onClick={toggleUserManagement}
                        className="flex items-center justify-between w-full p-2 text-white rounded-lg hover:text-white hover:bg-rose-950 group"
                      >
                        <div className="flex items-center">
                          <span className="text-2xl">{menu.src}</span>
                          <span className="ms-3">{menu.title}</span>
                        </div>
                        <span className="text-xl">
                          {isUserManagementOpen ? (
                            <FiChevronDown />
                          ) : (
                            <FiChevronRight />
                          )}
                        </span>
                      </button>
                      {isUserManagementOpen && (
                        <ul className="pl-8 mt-2 space-y-2">
                          {menu.sublinks.map((submenu, subIndex) => (
                            <li key={subIndex}>
                              <Link
                                to={submenu.path}
                                className={`${
                                  location.pathname === submenu.path
                                    ? "bg-primary text-white"
                                    : ""
                                } flex items-center p-2 text-white rounded-lg hover:text-white hover:bg-rose-950 group`}
                              >
                                {submenu.title}
                              </Link>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ) : (
                    <Link
                      to={menu.path}
                      className={`${
                        location.pathname === menu.path
                          ? "bg-rose-950 text-white"
                          : ""
                      } flex items-center p-2 text-white rounded-lg hover:text-white hover:bg-rose-950 group`}
                    >
                      <span className="text-2xl">{menu.src}</span>
                      <span className="ms-3">{menu.title}</span>
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div className="mb-4">
            <button
              onClick={handleLogout}
              className="w-full flex items-center p-2 text-white rounded-lg hover:text-white hover:bg-rose-950 group"
            >
              <span className="text-2xl">
                <BiLogOut />
              </span>
              <span className="ms-3">Logout</span>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
