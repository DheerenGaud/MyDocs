import { useEffect, useState } from "react"
import {  useParams } from 'react-router-dom';
import { UserVarification } from "./api/user";
export default (params) => {
    const [data,setdata]=useState({
      data:"",
      status:""
    });
    useEffect(()=>{
        lodeFirst();
    },[])
    let { userId, uniqueString} = useParams();
    const lodeFirst = async()=>{
        const data=await UserVarification({userId,uniqueString})
        console.log(data.data)
        setdata(data.data)
       
    }
  return(
    <>
     <h3>hello your verify status is
      <h2>{data.data}</h2>
        </h3>  
    </>
  )
}
