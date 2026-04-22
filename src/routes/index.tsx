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
import ManageSubCategories from "../pages/course/ManageSubCategories";
import ManageTags from "../pages/course/ManageTags";
import ManageVideo from "../pages/course/ManageVideo";
import ManageInstructor from "../pages/instructor";
import ManageEbook from "../pages/course/ManageEbook";
import ManageMcq from "../pages/mcq";
import McqForm from "../components/Forms/McqForm";
import ManageFaq from "../pages/Faq/ManageFaq";
import ManageFaqTopics from "../pages/Faq/ManageFaqTopics";
import ManageCourses from "../pages/course/ManageCourses";
import ManageChapter from "../pages/course/ManageChapter";
import AssignChpaterLectureForm from "../components/Forms/AssignChpaterLectureForm";
import CourseForm from "../components/Forms/CourseForm";
import CourseView from "../components/View/CourseView";
import PaymentSettings from "../pages/Settings/PaymentSettings";

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
          <Route path="/dashboard/sub-category" element={<ManageSubCategories />} />
          <Route path="/dashboard/videos" element={<ManageVideo />} />
          <Route path="/dashboard/tags" element={<ManageTags />} />
          <Route path="/dashboard/ebooks" element={<ManageEbook />} />
          <Route path="/dashboard/mcq" element={<ManageMcq />} />
          <Route path="/dashboard/mcq/form" element={<McqForm />} />
          <Route path="/dashboard/mcq/form/:id" element={<McqForm />} />
          <Route path="/dashboard/instructor" element={<ManageInstructor />} />
          <Route path="/dashboard/faq-topics" element={<ManageFaqTopics />} />
          <Route path="/dashboard/faq" element={<ManageFaq />} />
          <Route path="/dashboard/courses" element={<ManageCourses />} />
          <Route path="/dashboard/chapter" element={<ManageChapter />} />
          <Route path="/dashboard/chapter/assign-lecture/:id" element={<AssignChpaterLectureForm />} />
          <Route path="/dashboard/courses/add" element={<CourseForm />} />
          <Route path="/dashboard/courses/edit/:id" element={<CourseForm />} />
          <Route path="/dashboard/course/view/:id" element={<CourseView />} />
          <Route path="/dashboard/payment-settings" element={<PaymentSettings />} />

        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
