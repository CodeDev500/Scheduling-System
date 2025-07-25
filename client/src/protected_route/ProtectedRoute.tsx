import { useNavigate, Outlet } from "react-router-dom";
import { useAppSelector } from "../hooks/redux";
import { useEffect } from "react";
import type { RootState } from "../app/store";

interface Props {
  allowedRoles: string[];
}

const ProtectedRoute = ({ allowedRoles }: Props) => {
  const navigate = useNavigate();

  const userData = useAppSelector((state: RootState) => state.auth.user);
  const loading = useAppSelector((state: RootState) => state.auth.loading);

  useEffect(() => {
    if (!loading && !userData) {
      navigate("/home");
    } else if (
      !loading &&
      allowedRoles.length > 0 &&
      !allowedRoles.includes(userData?.role || "")
    ) {
      navigate("/home");
    }
  }, [loading, userData, allowedRoles, navigate]);

  if (loading) {
    return <h1>Loading...</h1>;
  }

  return <Outlet />;
};

export default ProtectedRoute;
