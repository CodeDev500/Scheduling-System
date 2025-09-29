import { useState, type ReactNode } from "react";
import Sidebar from "../sidebar/Sidebar";
import NavbarDashboard from "../navbar/NavDashboard";

interface LayoutDashboardProps {
  children: ReactNode;
}

const LayoutDashboard: React.FC<LayoutDashboardProps> = ({ children }) => {
  const [sidebar, setSidebar] = useState(false);

  const handleBurger = () => {
    setSidebar((prev) => !prev);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar sidebar={sidebar} handleBurger={handleBurger} />
      <div className="flex flex-col w-full md:ml-64">
        <NavbarDashboard handleBurger={handleBurger} sidebar={sidebar} />
        <div className={`flex-grow bg-white w-full p-4 mt-20 overflow-y-auto`}>
          {children}
        </div>
      </div>
    </div>
  );
};

export default LayoutDashboard;
