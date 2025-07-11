import React from "react";
import Navbar from "../navbar/Navbar";
import type { LayoutHomeProps } from "../../types/types";

const LayoutHome: React.FC<LayoutHomeProps> = ({ children: children }) => {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
};

export default LayoutHome;
