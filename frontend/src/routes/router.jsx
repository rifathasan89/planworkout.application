import { createBrowserRouter } from "react-router-dom";
import Home from "../pages/Home/Home";
import MainLayout from "../layout/MainLayout";
import Register from "../pages/user/Register";
import Login from "../pages/user/Login";
import Instructors from "../pages/Instructors/Instructors";
import DashboardLayout from "../layout/DashboardLayout";
import Dashboard from "../pages/Dashboard/Dashboard";
import ManageUsers from "../pages/Dashboard/Admin/users/ManageUsers";
import UpdateUser from "../pages/Dashboard/Admin/users/UpdateUser";
import Packages from "../pages/Packages/Packages";
import ErrorPage from "../pages/error/ErrorPage";
//import AddPackages from "../pages/Dashboard/Instructors/AddPackage"; 
import AddPackages from "../pages/Dashboard/Instructors/AddPackage";
import MyPackages from "../pages/Dashboard/Instructors/MyPackages";
import InstructorCP from "../pages/Dashboard/Instructors/InstructorCP";
import AdminHome from "../pages/Dashboard/Admin/AdminHome";
import ManagePackages from "../pages/Dashboard/Admin/ManagePackages";
import StudentCP from "../pages/Dashboard/Student/StudentCP";
import SelectedClass from "../pages/Dashboard/Student/SelectedPackage";
import Payment from "../pages/Dashboard/Student/Payment/Payment";
import MyPaymentHistory from "../pages/Dashboard/Student/Payment/History/MyPaymentHistory";
import AsInstructor from "../pages/Dashboard/Student/Apply/AsInstructor";
import AdminRoute from "./Privet/AdminRoute";
import InstructorRoute from "./Privet/InstructorRoute";
import StudentRoute from "./Privet/StudentRoute";
import PrivetRoute from "./Privet/PrivetRoute";
import EnrolledPackege from "../pages/Dashboard/Student/Enroll/EnrolledPackages";
//import UpdatePackage from "../pages/Dashboard/Instructors/UpdatePackage";
import UpdatePackage from "../pages/Dashboard/Instructors/UpdatePackage"
import SinglePackage from "../pages/Packages/SinglePackage";

export const router = createBrowserRouter([
    {
        path: "/",
        element: <MainLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Home />
            },
            {
                path: "register",
                element: <Register />
            },
            {
                path: "login",
                element: <Login />
            },
            {
                path: "instructors",
                element: <Instructors />
            },
            {
                path: "packages",
                element: <Packages />
            },
            {
                path: "Packages/:id",
                element: <SinglePackage/>,
                loader: ({ params }) => fetch(`http://localhost:5000/Packages/${params.id}`),
            }
        ]
    },
    {
        path: '/dashboard',
        element: <DashboardLayout />,
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <PrivetRoute><Dashboard /></PrivetRoute>
            },
            // * ADMIN ROUTES
            {
                path: 'manage-users',
                element: <AdminRoute><ManageUsers /></AdminRoute>
            },
            {
                path: 'update-user/:id',
                element: <AdminRoute><UpdateUser /></AdminRoute>,
                loader: ({ params }) => fetch(`http://localhost:5000/users/${params.id}`),
            },
            {
                path: 'admin-home',
                element: <AdminRoute><AdminHome /></AdminRoute>
            },
            {
                path: 'manage-Package',
                element: <AdminRoute><ManagePackages /></AdminRoute>
            },
            // * INSTRUCTOR ROUTES
            {
                path: 'instructor-cp',
                element: <InstructorRoute><InstructorCP /></InstructorRoute>
            },
            
            {
                path: 'add-Package',
                element: <InstructorRoute><AddPackages /></InstructorRoute>
            },
            
            {
                path: 'my-Packages',
                element: <InstructorRoute><MyPackages /></InstructorRoute>
            },
            {
                path: 'update/:id',
                element: <InstructorRoute><UpdatePackage /></InstructorRoute>,
                loader: ({ params }) => fetch(`http://localhost:5000/Package/${params.id}`),
            },
            // * STUDENT ROUTES
            {
                path: 'student-cp',
                element: <StudentRoute><StudentCP /></StudentRoute>
            },
            {
                path: 'my-selected',
                element: <StudentRoute><SelectedClass /></StudentRoute>
            },
            {
                path: 'user/payment',
                element: <StudentRoute><Payment /></StudentRoute>
            },
            {
                path: 'my-payments',
                element: <StudentRoute><MyPaymentHistory /></StudentRoute>
            },
            {
                path: 'apply-instructor',
                element: <StudentRoute><AsInstructor /></StudentRoute>
            },
            {
                path: 'enrolled-Packages',
                element: <StudentRoute><EnrolledPackege /></StudentRoute>
            }
        ]
    }
])