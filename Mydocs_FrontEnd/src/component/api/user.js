import axios from "axios"
const url="http://localhost:9000"

export const newuser= async(data)=>{
    console.log(data)
    try{
        return await axios.post(`${url}/user/register`,data)
    }
    catch(err){
          console.log("error is occur in adding user by api")
    }
}
export const singin= async(data)=>{
    console.log(data)
    try{
        
        return await axios.post(`${url}/login-user`,data)
    }
    catch(err){
          console.log("error in finding user for login by api")
    }
}
export const userdata= async(data)=>{
    console.log(data)
    try{ 
        return await axios.post(`${url}/userData`,data)
    }
    catch(err){
          console.log("error in finding userData for login by api")
    }
}
export const UserVarification= async(data)=>{
    let {userId,uniqueString}=data;
    console.log(`${url}/user/verify/${userId}/${uniqueString}`);
    try{
        return await axios.get(`${url}/user/verify/${userId}/${uniqueString}`);
    }
    catch(err){
          console.log("error in finding user vertifivation  by api")
    }
}
export const forgetPassword= async(data)=>{
    try{
        return await axios.post(`${url}/user/forgotpassword`,data)
    }
    catch(err){
          console.log("error in finding userData for login by api")
    }
}
export const resetPassword= async(data)=>{
    try{
        return await axios.post(`${url}/user/resetPassword`,data)
    }
    catch(err){
          console.log("error in finding userData for login by api")
    }
}
export const Project= async(data)=>{
    try{
        return await axios.post(`${url}/project`,data)
    }
    catch(err){
          console.log("error in finding project by api")
    }
}
export const saveData= async(data)=>{
    console.log(data)
    try{
        return await axios.post(`${url}/project/updateProject`,data)
    }
    catch(err){
          console.log("error in updaing project by api")
    }
}
export const deleteProject= async(data)=>{
    // console.log(data)
    try{
        return await axios.post(`${url}/project/deleteProject`,data)
    }
    catch(err){
          console.log("error in deleting project by api")
    }
}
export const newProject= async(data)=>{
    // console.log(data)
    try{
        return await axios.post(`${url}/project/newProject`,data)
    }
    catch(err){
          console.log("error in adding new project by api")
    }
}
export const giveAccess= async(data)=>{
    // console.log(data)
    try{
        return await axios.post(`${url}/project/giveAccessTo`,data)
    }
    catch(err){
          console.log("error in giveing access by admin new project by api")
    }
}
export const allUser= async(query)=>{
    // console.log(query)
    try{
        return await axios.get(`${url}/project/allUser?query=${query}`)
    }
    catch(err){
          console.log("error in serch query by api")
    }
}
export const sendNotificationsendRseponce=async(data)=>{
    console.log(data);
    try{
        return await axios.post(`${url}/project/notificationResponce`,data)
    }
    catch(err){
          console.log("error in send notificationResponce  by api")
    }
}
export const viewNotification=async(data)=>{
    console.log(data);
    try{
        return await axios.post(`${url}/project/viewNotification`,data)
    }
    catch(err){
          console.log("error in send notificationResponce  by api")
    }
}
export const removeAccess=async(data)=>{
    console.log(data);
    try{
        return await axios.post(`${url}/project/removeAccess`,data)
    }
    catch(err){
          console.log("error in send notificationResponce  by api")
    }
}