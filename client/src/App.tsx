import "./App.css";
import type { ArrayLink } from "./types/types";
import { UserRoles } from "./constants/constants";
import { Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";

import PageNotFound from "./pages/PageNotFound/PageNotFound";
import LayoutHome from "./components/layout/LayoutHome";
import LayoutDashboard from "./components/layout/LayoutDashboard";

import Home from "./pages/Home/Home";
import About from "./pages/About/About";
import ContactUs from "./pages/ContactUs/ContactUs";

import Dashboard from "./pages/CampusAdmin/Dashboard/CampusAdminDashboard";

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
  ];
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
