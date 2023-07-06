import { useState } from "react"
import "../style/login.css"
import {newuser} from "./api/user"

export default (params) => {
  
    const [data,setData]=useState({
        Fname:"",
        Lname:"",
        email:"",
        password:"",
        cpassword:"",
    })

    const handleChange=(e)=>{
      setData({...data,[e.target.name]:e.target.value})
    }
    const handleClick = async (e)=>{
        e.preventDefault()
        console.log(data)
        if(data.cpassword==data.password&&data.password!=""){
          const x= await newuser(data)
          console.log(x.data)
          if(x.data.status==="Pending"){
            if(window.confirm(x.data.data) === true){
              window.location.href="./login"
            }
          }
          else{
            window.location.href="./"
          }
          
        }
        else{
          alert("error password is diffrent")
        }
    }
    const handleChange2 = async (e)=>{
      window.location.href="./login"
    }
    const changePaswword =()=>{
      window.location.href="./user/forgetPassword"
    }

  return(
    <>
    <div className="overlay">
<form className="login">
   <div className="con">
   <header className="head-form">
      <h2>Sing In</h2>
    
      <p>login here using your username and password</p>
   </header>
 
   <br/>
   <div className="field-set">

       <input className="form-input" id="txt-input" type="text" name="Fname" onChange={handleChange} placeholder="@FirstName" required/>
      <br/>
       <input className="form-input" id="txt-input" type="text" name="Lname" onChange={handleChange}  placeholder="@LastName" required/>
      <br/>
       <input className="form-input" id="txt-input" type="email" name="email" onChange={handleChange}  placeholder="@email" required/>
      <br/>
      <input className="form-input" type="password" placeholder="Password" id="pwd" name="password" onChange={handleChange}    required />
      <br/>
      <input className="form-input" type="password" placeholder="Re-Enter Password" id="pwd" name="cpassword" onChange={handleChange}   required />
      <br/>
      <button className="log-in l-btn" type="button" onClick={handleClick} >  Sing In </button>
   </div>
  

   <div className="other">
      <button className="btn submits frgt-pass l-btn" onClick={changePaswword}>Forgot Password</button>
      <button className="btn  submits sign-up l-btn"  onClick={handleChange2}>LOGIN
      </button>
   </div>
     
  </div>
  
</form>
</div>
    </>
  )
}
