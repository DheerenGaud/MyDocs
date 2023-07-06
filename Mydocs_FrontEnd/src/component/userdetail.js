import { useEffect, useState } from "react"
import {userdata} from "./api/user"
export default ()=>{

    const [data,setdata]=useState({
        Fname:"",
        Lname:"",
        email:""
    })
    useEffect(()=>{
        lodeData();
    },[])
    
    const lodeData=async()=>{
         const token=window.localStorage.getItem("token")
         const x= await userdata({"token":token})
         console.log(x.data)
         setdata({
             Fname:x.data.data.Fname,
             Lname:x.data.data.Lname,
             email:x.data.data.email,
            })
       if(x.data.data=="token expire"){
            alert("token expire!!!!! (token is there for only 10sec) ")
               window.localStorage.clear();
               window.location.href="./login"
            }
    }
    
        const handlclick =()=>{
        window.localStorage.clear();
        window.location.href="./login"
     }
     
    return(
        <>
        <h2>User:{data.Fname}</h2>
        <h2>LastName: {data.Lname}</h2>
        <h2>Email:{data.email}</h2>
        <br />
        <button style={{"color":"white","background":"black"}} onClick={handlclick}>LogOut</button>
        </>
    )
}