import "../style/login.css";
import { useState ,Component } from "react";
import {forgetPassword} from "./api/user"
import { useNavigate } from "react-router-dom";


export default (params) => {
  const [data, setData] = useState({
    email: "",
    redirecrURL:"http://localhost:3000/user/resetPassword"
  });
  const navigate=useNavigate()

  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };


  const handleClick = async (e) => {
    e.preventDefault();

    const x= await forgetPassword(data)
    
    if(x.data.status==="Pending"){
      alert(x.data.data) 
      window.location.href="./user";
    }
    else{
      alert(x.data.data) 
    }
    // alert()
    // if(x.data.status=="ok"){
    //   window.localStorage.setItem("token",x.data.data)
    //   window.localStorage.setItem("loginStatus",true)
    //   window.location.href="./user"
    // }
  };
  return (
    <>
      <div className="overlay">
        <form className="login">
          <div className="con">
            <header className="head-form">
              <h2>Log In</h2>

              <p>login here using your username and password</p>
            </header>

            <br />
            <div className="field-set">
              <input
                className="form-input"
                id="txt-input"
                type="email"
                name="email"
                placeholder="@email"
                onChange={handleChange}
                required
              />
            
              <button className="log-in l-btn" onClick={handleClick}>
                {" "}
                Send{" "}
              </button>
            </div>

          
          </div>
        </form>
      </div>
    </>
  );
};
