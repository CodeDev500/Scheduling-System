import "./App.css";
import type { ArrayLink } from "./types/types";
import { UserRoles } from "./constants/constants";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import ProtectedRoute from "./protected_route/ProtectedRoute";

import PageNotFound from "./pages/PageNotFound/PageNotFound";
import LayoutHome from "./components/layout/LayoutHome";
import LayoutDashboard from "./components/layout/LayoutDashboard";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import ContactUs from "./pages/ContactUs/ContactUs";

import Dashboard from "./pages/CampusAdmin/Dashboard/CampusAdminDashboard";
import ViewSchedules from "./pages/CampusAdmin/ViewSchedules/ViewSchedules";
import TeachingLoad from "./pages/CampusAdmin/TeachingLoad/TeachingLoad";
import ManageUser from "./pages/CampusAdmin/ManageUser/ManageUser";
import FacultyProfile from "./pages/CampusAdmin/FacultyProfile/FacultyProfile";

import RegistrarDashboard from "./pages/Registrar/Dashboard/Dashboard";
import Prospectus from "./pages/Registrar/ProspectusManagement/Prospectus";
import Schedules from "./pages/Registrar/Schedules/Schedules";
import Subjects from "./pages/Registrar/Subjects/Subjects";
import CourseOffering from "./pages/Registrar/CourseEffering/CourseOffering";
import ManageProspectus from "./pages/Registrar/ProspectusManagement/ManageProspectus";

import ProgramHeadDashboard from './pages/DepartmentHead/Dashboard/Dashboard'
import ScheduleManagement from "./pages/DepartmentHead/ScheduleManagement/ScheduleManagement";

function App() {
  const sharedLinks: ArrayLink[] = [
    {
      title: "Home",
      path: "/",
      component: <Home />,
    },
    {
      title: "Home",
      path: "/home",
      component: <Home />,
    },
    {
      title: "About",
      path: "/about",
      component: <About />,
    },
    {
      title: "Contact Us",
      path: "/contact-us",
      component: <ContactUs />,
    },
  ];

  const campusAdminLinks: ArrayLink[] = [
    {
      title: "Campus Admin Dashboard",
      path: "/admin-dashboard",
      component: <Dashboard />,
    },
    {
      title: "View Schedules",
      path: "/view-schedules",
      component: <Schedules />,
    },
    {
      title: "Prospectus",
      path: "/prospectus",
      component: <Prospectus />,
    },
    {
      title: "View Teaching Load",
      path: "/teaching-load",
      component: <TeachingLoad />,
    },
    {
      title: "Manage User",
      path: "/manage-user",
      component: <ManageUser />,
    },
  ];

  const registrarLinks: ArrayLink[] = [
    {
      title: "Registrar Dashboard",
      path: "/registrar-dashboard",
      component: <RegistrarDashboard />,
    },
    {
      title: "Subjects",
      path: "/subjects",
      component: <Subjects />,
    },
    {
      title: "Schedules",
      path: "/registrar-schedules",
      component: <Schedules />,
    },
    {
      title: "Prospectus",
      path: "/registrar-prospectus",
      component: <Prospectus />,
    },
    {
      title: "Course Offering",
      path: "/course/:programCode",
      component: <CourseOffering />,
    },
    {
      title: "Manage Prospectus",
      path: "/manage-prospectus/:programCode/:yearLevel",
      component: <ManageProspectus />,
    },
  ];

  const programHeadLinks: ArrayLink[] = [
    {
      title: "Dashboard",
      path: "/program-head-dashboard",
      component: <ProgramHeadDashboard />
    },
    {
      title: "Schedule Management",
      path: "/schedule-management",
      component: <ScheduleManagement />
    }
  ]
  return (
    <>
      <ToastContainer />
      <Routes>
        {sharedLinks.map((link) => (
          <Route
            key={link.title}
            path={link.path}
            element={<LayoutHome>{link.component}</LayoutHome>}
          />
        ))}

        {registrarLinks?.map((link) => (
          <Route
            key={link.title}
            element={<ProtectedRoute allowedRoles={[UserRoles[2]]} />}
          >
            <Route
              path={link.path}
              element={<LayoutDashboard>{link.component}</LayoutDashboard>}
            />
          </Route>
        ))}

        {campusAdminLinks.map((link) => (
          <Route
            key={link.title}
            element={<ProtectedRoute allowedRoles={[UserRoles[3]]} />}
          >
            <Route
              path={link.path}
              element={<LayoutDashboard>{link.component}</LayoutDashboard>}
            />
          </Route>
        ))}

        {
          programHeadLinks.map((link) => (
            <Route key={link.title}
            element={<ProtectedRoute allowedRoles={[UserRoles[1]]}/>}
            >
              <Route path={link.path}
              element={<LayoutDashboard >{link.component}</LayoutDashboard>}
              />
            </Route>
          ))
        }

        <Route
          path="/admin-dashboard"
          element={
            <LayoutDashboard>
              <Dashboard />
            </LayoutDashboard>
          }
        />
        <Route path="/*" element={<PageNotFound />} />
      </Routes>
    </>
  );
}

export default App;
