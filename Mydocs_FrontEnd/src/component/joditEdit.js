import React, { useState, useRef, useMemo, useEffect } from 'react';
import JoditEditor from 'jodit-react';
import {Project,saveData} from "./api/user"
import {useParams} from "react-router-dom"
import { Button,styled } from '@mui/material'
import io from "socket.io-client"
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const socket =io.connect(process.env.SOCKET_URL)

const MyEditor = () => {

    const editor = useRef(null);
    const [content, setContent] = useState('');
    const [pName, setPname] = useState('');
    const [view, setView] = useState(true);
    const [defaltedit, setdefaltedit] = useState(false);
    
    useEffect(()=>{
        lodeData();
     },[])  
    


     useEffect(()=>{
        socket.on('receive__massage',(massage)=>{
              setContent(massage)
        })
        socket.on('_____',(id)=>{
            socket.emit("send__massage_To",{massage:content,to:id})          
        })
        
      },[socket,content])

     
     const {projectId}=useParams();
     const token=window.localStorage.getItem("token")
    
     const lodeData=async()=>{
        const x=await Project({token,projectId}) 
        if(x.data.status==="error"){
          toast.error(x.data.data)
            window.location.href = `/login/${projectId}`;
        }
        else{
        
            let data=x.data.data.data
            // console.log(x.data.data);
            setPname(x.data.data.pName)
            if(x.data.access==="view"){
                setContent(data)
                setView(true)
            }
            else{
                setView(false)
                socket.emit("join__room",projectId)
                socket.on('isUserAllredy',(istrue)=>{
                    if(!istrue){
                        setContent(data)
                    }
                
                })

            }
        }
     }
    
     const newContent=(e)=>{
      if(defaltedit){
        setContent(e)
        socket.emit("send__massage",{massage:e,room:projectId})
      }
      else{
        setdefaltedit(true)
      }
     }

  const MyButton = styled(Button)`
    //   float:right;
      height:90px;
      width:90px;
      position :absolute;
      bottom:1%;
      z-index:1;
      right:3%;
      color:white;
      background-color:#D2122E;
    //   border: 2px solid red;
      border-radius: 50%;
 `;

 
 const MyButton2 = styled(Button)`
 


 //   float:right;
 height:90px;
 width:90px;
   position :absolute;
   bottom:16%;
   z-index:1;
   right:3%;
 //   border: 2px solid red;
   border-radius: 50%;
`;
  const config = useMemo(() => ({
    readonly: view,
    height: 900
  }), [view]);

  const handlClick = async(e)=>{
      if(e.target.name==="close"){
          window.location.href = "/home";
      }
      else{
          const x=await saveData({token,projectId,content})
          if(x.data.status==="error"){
            toast.error(x.data.data)
            }
            else{
              toast.success(x.data.data)
            }
        }
  }

  return (

    <>
    <ToastContainer position="top-center"/>
    <h2>Project : {pName}<MyButton variant='contained' hover="false" onClick={handlClick} name="close" color='secondary'  >Close</MyButton>  <MyButton2 variant='contained' name="save" onClick={handlClick} color='secondary' >Save</MyButton2> </h2>
    <JoditEditor
    ref={editor}
    value={content}
    config={config}
    tabIndex={1} 
    onChange={newContent}  
    />
    </>
  );
};

export default MyEditor;















