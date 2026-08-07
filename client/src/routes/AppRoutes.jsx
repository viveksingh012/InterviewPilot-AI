import {Routes, Route, Navigate} from "react-router-dom"
import Login from "../pages/login"
import Register from "../pages/Register"
import ForgotPassword from "../pages/ForgotPassword";
import ResetPassword from "../pages/ResetPassword";


export default function AppRoutes(){
return (
 <Routes>
    <Route path="/" element={<Navigate to="/login" replace/>}/>
    <Route path="/login" element={<Login />}/>
    <Route path="/register" element={<Register />}/>
    <Route path="/forget_password" element={<ForgotPassword />}/>
    <Route path="/reset_password" element={<ResetPassword />}/>
 </Routes>
);
}