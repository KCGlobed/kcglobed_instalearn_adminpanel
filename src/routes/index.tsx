import { Routes, Route, Navigate } from "react-router-dom";
import Login from "../pages/login";

import NotFound from "../pages/notFound";
import Dashboard from "../pages/dashboard";
import PrivateRoute from "./privateRoutes";
import PublicRoute from "./publicRoutes";

import ForgotFlow from "../pages/forgotpassward";
import DashboardPage from "../pages/dashboard/home";
import ResetPassword from "../pages/forgotpassward/ResetPassword";
import ManageCategories from "../pages/course/ManageCategories";
<<<<<<< Updated upstream
import ManageSubCategories from "../pages/course/ManageSubCategories";
=======
import ManageTags from "../pages/course/ManageTags";
>>>>>>> Stashed changes





export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<PublicRoute />}>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotFlow />} />
        <Route path="/user/reset/" element={<ResetPassword />} />
      </Route>

      <Route element={<PrivateRoute />}>
        <Route path="/dashboard" element={<Dashboard />}>
          <Route index element={<DashboardPage />} />
          <Route path="/dashboard/categories" element={<ManageCategories />} />
<<<<<<< Updated upstream
          <Route path="/dashboard/sub-category" element={<ManageSubCategories />} />
=======
          <Route path="/dashboard/tags" element={<ManageTags />} />
>>>>>>> Stashed changes
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
