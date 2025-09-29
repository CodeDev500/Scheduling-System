import "./App.css";
import type { ArrayLink } from "./types/types";
import { UserRoles } from "./constants/constants";
import { Routes, Route } from "react-router-dom";
import { ToastProvider } from "./hooks/useToast";

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
import RoomManagement from "./pages/CampusAdmin/RoomManagement/RoomManagement";
import Settings from "./pages/CampusAdmin/Settings/Settings";
import ScheduleGeneration from "./pages/CampusAdmin/ScheduleGeneration/ScheduleGeneration";
import TestComponent from "./pages/CampusAdmin/ScheduleGeneration/TestComponent";


import RegistrarDashboard from "./pages/Registrar/Dashboard/Dashboard";
import Prospectus from "./pages/Registrar/ProspectusManagement/Prospectus";
import Schedules from "./pages/Registrar/Schedules/Schedules";
import Subjects from "./pages/Registrar/Subjects/Subjects";
import CourseOffering from "./pages/Registrar/CourseEffering/CourseOffering";
import ManageProspectus from "./pages/Registrar/ProspectusManagement/ManageProspectus";

import ProgramHeadDashboard from './pages/DepartmentHead/Dashboard/Dashboard'
import ScheduleManagement from "./pages/DepartmentHead/ScheduleManagement/ScheduleManagement";
import AddSchedule from "./pages/DepartmentHead/ScheduleManagement/AddSchedule";
import ViewProspectus from "./pages/DepartmentHead/ScheduleManagement/ViewProspectus";
import ViewProspectusSemesters from "./pages/DepartmentHead/ScheduleManagement/ViewProspectusSemesters";
import ViewProspectusScheduling from "./pages/DepartmentHead/ScheduleManagement/ViewProspectusScheduling";
import DeptCourseOffering from "./pages/DepartmentHead/ScheduleManagement/CourseOffering";
import DeptCourseScheduling from "./pages/DepartmentHead/ScheduleManagement/CourseScheduling";
import DeptFacultyVLLoading from "./pages/DepartmentHead/ScheduleManagement/FacultyVLLoading";
import DepartmentHeadTeachingLoad from "./pages/DepartmentHead/TeachingLoad/TeachingLoad";
import DepartmentHeadFacultyProfile from "./pages/DepartmentHead/FacultyProfile/FacultyProfile";

import FacultyDashboard from "./pages/Faculty/Dashboard/FacultyDashboard";
import FacultyViewSchedules from "./pages/Faculty/ViewSchedules/ViewSchedules";
import FacultyViewTeachingLoad from "./pages/Faculty/ViewTeachingLoad/ViewTeachingLoad";
import { FacultyPreferences } from "./components/FacultyPreferences";
import { FacultyPreferencesProvider } from "./contexts/FacultyPreferencesContext";

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
      component: <ViewSchedules />,
    },
    {
      title: "Schedule Generation",
      path: "/schedule-generation",
      component: <ScheduleGeneration />,
    },

    {
      title: "Faculty/VL Profile",
      path: "/faculty-profile",
      component: <FacultyProfile />,
    },
    {
      title: "Manage User",
      path: "/manage-user",
      component: <ManageUser />,
    },
    {
      title: "View Teaching Load",
      path: "/teaching-load",
      component: <TeachingLoad />,
    },
    {
      title: "Room Management",
      path: "/room-management",
      component: <RoomManagement />,
    },
    {
      title: "Settings",
      path: "/settings",
      component: <Settings />,
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
    },
    {
      title: "Add Schedule",
      path: "/schedule-management/add",
      component: <AddSchedule />
    },
    {
      title: "View Prospectus",
      path: "/schedule-management/view-prospectus",
      component: <ViewProspectus />
    },
    {
      title: "View Prospectus Semesters",
      path: "/schedule-management/view-prospectus/:programCode/:yearLevel",
      component: <ViewProspectusSemesters />
    },
    {
      title: "View Prospectus Scheduling",
      path: "/schedule-management/view-prospectus-scheduling",
      component: <ViewProspectusScheduling />
    },
    {
      title: "Course Offering",
      path: "/schedule-management/course-offering",
      component: <DeptCourseOffering />
    },
    {
      title: "Course Scheduling",
      path: "/schedule-management/course-scheduling",
      component: <DeptCourseScheduling />
    },
    {
      title: "Faculty/VL Loading",
      path: "/schedule-management/faculty-vl-loading",
      component: <DeptFacultyVLLoading />
    },
    {
      title: "Faculty Profile",
      path: "/department-head-faculty",
      component: <DepartmentHeadFacultyProfile />
    },
    {
      title: "View Teaching Load",
      path: "/department-head-teaching-load",
      component: <DepartmentHeadTeachingLoad />
    }
   ];

  const facultyLinks: ArrayLink[] = [
    {
      title: "Faculty Dashboard",
      path: "/faculty-dashboard",
      component: <FacultyDashboard />
    },
    {
      title: "View Schedules",
      path: "/faculty-schedules",
      component: <FacultyViewSchedules />
    },
    {
      title: "View Teaching Load",
      path: "/faculty-teaching-load",
      component: <FacultyViewTeachingLoad />
    },
    {
      title: "Teaching Preferences",
      path: "/faculty-preferences",
      component: <FacultyPreferences />
    }
  ];

  return (
    <>
      <ToastProvider>
        <FacultyPreferencesProvider>
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

        {programHeadLinks.map((link) => (
          <Route
            key={link.title}
            element={<ProtectedRoute allowedRoles={[UserRoles[1]]} />}
          >
            <Route
              path={link.path}
              element={<LayoutDashboard>{link.component}</LayoutDashboard>}
            />
          </Route>
        ))}

        {facultyLinks.map((link) => (
          <Route
            key={link.title}
            element={<ProtectedRoute allowedRoles={[UserRoles[0]]} />}
          >
            <Route
              path={link.path}
              element={<LayoutDashboard>{link.component}</LayoutDashboard>}
            />
          </Route>
        ))}

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
      </FacultyPreferencesProvider>
      </ToastProvider>
    </>
  );
}

export default App;
