import { UserRoles } from "../constants/constants";

export const getDashboardRoute = (userRole: string): string => {
  switch (userRole) {
    case UserRoles[0]: // FACULTY
      return "/faculty-dashboard";
    case UserRoles[1]: // DEPARTMENT_HEAD
      return "/program-head-dashboard";
    case UserRoles[2]: // REGISTRAR
      return "/registrar-dashboard";
    case UserRoles[3]: // CAMPUS_ADMIN
      return "/admin-dashboard";
    default:
      return "/dashboard"; // fallback
  }
};