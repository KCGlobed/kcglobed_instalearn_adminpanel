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
import ManageStudents from "../pages/Students";
import StudentProfile from "../components/View/StudentView";
import ManageSalesUsers from "../pages/ManageUsers/SalesUsers";
import ManageTrailCourse from "../pages/trailCourse";
import CourseReview from "../pages/CourseReview";
import ManageCourseAnnoucement from "../pages/ManageCourseAnnoucement";
import ManageReportContact from "../pages/ManageReports/manageContactUs";
import ManageStudentOrder from "../pages/ManageReports/ManageStudentOrder";
import StudentPerformace from "../pages/ManageReports/StudentPerformace";
import ManageStudentNotesReport from "../pages/ManageReports/StudentNotesReport";
import ManageBlogPost from "../pages/Blog/Blog";
import ManageCoupons from "../pages/Coupon/coupons";
import ManagePromotionalCampign from "../pages/Coupon/promotional-campaign";
import BlogForm from "../components/Forms/BlogForm";
import ManageBlogCategory from "../pages/Blog/BlogCategory";
import ManageTestimonials from "../pages/Testimonials";
import ManageQuiz from "../pages/Quiz";
import ManageSupportTopic from "../pages/HelpAndSupport/SupportTopic";
import ManageSupportSubTopic from "../pages/HelpAndSupport/SupportSubTopic";
import ManageSupportArticle from "../pages/HelpAndSupport/SupportArticle";
import ManageTrailStudentReport from "../pages/ManageReports/ManageTrailStudentReport";
import ManageSubscripiton from "../pages/manageSubscription";
import ManageStudentAccessLockReport from "../pages/ManageReports/ManageStudentAccessLockReport";
import ManageCorporateAdmin from "../pages/ManageCorporateAdmin";
import ManageCorporateAdminSubcription from "../pages/CorporativeAdminSubcription";
import Profile from "../pages/dashboard/Profile";
import ChangePassword from "../pages/dashboard/ChangePassword";
import ManageLegalPage from "../pages/LegalPages";
import ManageManagers from "../pages/ManageUsers/ManageManager";
import MarketingUser from "../pages/ManageUsers/MarketingUser";
import ManageCustomerSupportUsers from "../pages/ManageUsers/CustomerSupportUser";
import ContentManagementUser from "../pages/ManageUsers/contentManagementUser";
import ManageFinanceUser from "../pages/ManageUsers/FinanceUser";
import CommunityPost from "../pages/Community/communityPost";
import ManageCommunityCategory from "../pages/Community/communityCategory";
import ManageJobApplication from "../pages/JobApplication";
import ManagePartnersRequest from "../pages/managePartnerRequest";
import ManageBlogComments from "../pages/Blog/BlogComment";
import ManageUniversitySubscription from "../pages/ManageUniversitySubscription";

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

          {/* -----------------Abhishek---------------- */}
          <Route path="/dashboard/students" element={<ManageStudents />} />
          <Route path="/dashboard/students/view/:id" element={<StudentProfile />} />
          <Route path="/dashboard/trail-course" element={<ManageTrailCourse />} />
          <Route path="/dashboard/course-review" element={<CourseReview />} />
          <Route path="/dashboard/manage-announcement" element={<ManageCourseAnnoucement />} />
          <Route path="/dashboard/report-contact" element={<ManageReportContact />} />
          <Route path="/dashboard/report-student-order" element={<ManageStudentOrder />} />
          <Route path="/dashboard/student-performance-report" element={<StudentPerformace />} />
          <Route path="/dashboard/student-notes-report" element={<ManageStudentNotesReport />} />
          <Route path="/dashboard/student-access-lock-report" element={<ManageStudentAccessLockReport />} />
          <Route path="/dashboard/blog-category" element={<ManageBlogCategory />} />
          <Route path="/dashboard/blog" element={<ManageBlogPost />} />
          <Route path="/dashboard/coupons" element={<ManageCoupons />} />
          <Route path="/dashboard/promotional-campaign" element={<ManagePromotionalCampign />} />
          <Route path="/dashboard/testimonials" element={<ManageTestimonials />} />
          <Route path="/dashboard/blog/form" element={<BlogForm />} />
          <Route path="/dashboard/blog/form/:id" element={<BlogForm />} />
          <Route path="/dashboard/quiz" element={<ManageQuiz />} />
          <Route path="/dashboard/help-and-support-topic" element={<ManageSupportTopic />} />
          <Route path="/dashboard/help-and-support-subtopic" element={<ManageSupportSubTopic />} />
          <Route path="/dashboard/help-and-support-article" element={<ManageSupportArticle />} />
          <Route path="/dashboard/trail-user-report" element={<ManageTrailStudentReport />} />
          <Route path="/dashboard/subscription-plan" element={<ManageSubscripiton />} />
          <Route path="/dashboard/corporate-admin" element={<ManageCorporateAdmin />} />
          <Route path="/dashboard/corporate-admin-subscription" element={<ManageCorporateAdminSubcription />} />
          <Route path="/dashboard/profile" element={<Profile />} />
          <Route path="/dashboard/forgot-password" element={<ChangePassword />} />
          <Route path="/dashboard/legal-pages" element={<ManageLegalPage />} />
          <Route path="/dashboard/managers" element={<ManageManagers />} />
          <Route path="/dashboard/sales-users" element={<ManageSalesUsers />} />
          <Route path="/dashboard/marketing-user" element={<MarketingUser/>} />
          <Route path="/dashboard/customer-support-user" element={<ManageCustomerSupportUsers/>} />
          <Route path="/dashboard/content-management-user" element={<ContentManagementUser/>} />
          <Route path="/dashboard/finance-user" element={<ManageFinanceUser/>} />
          <Route path="/dashboard/community-category" element={<ManageCommunityCategory />} />
          <Route path="/dashboard/community-post" element={<CommunityPost/>} />
          <Route path="/dashboard/job-application" element={<ManageJobApplication/>} />
          <Route path ="/dashboard/partners-request" element={<ManagePartnersRequest/>} />
          <Route path ="/dashboard/blog-comment" element={<ManageBlogComments/>}/>
          <Route path="/dashboard/university-subscription" element={<ManageUniversitySubscription/>}/>
          
        </Route>
      </Route>
      <Route path="/" element={<Navigate to="/login" />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}