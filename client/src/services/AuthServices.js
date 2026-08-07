import api from "../utils/axiosInstance";

export const login=async(data)=>{await api.post("/auth/login",data)}
export const register=async(data)=>{await api.post("/auth/register",data)}