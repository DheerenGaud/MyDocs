import "../style/login.css";
import { useState  } from "react";
import {resetPassword} from "./api/user"
import {  useParams } from 'react-router-dom';


export default (params) => {
    
    
    let { userId, resetString} = useParams();
    const [data, setData] = useState({
      userId: userId,
      resetString:resetString,
      newPassword:"",
      cpassword:""
      
    });
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
    e.preventDefault();

    if(data.cpassword===data.newPassword&&data.newPassword!==""){
        // setData({...data,[userId]:userId,[resetString]:resetString})
        console.log(data);
        const x= await resetPassword(data)
        alert(x.data.data);
        window.location.href="/login";
    }
    else{
        alert("Password is not match");
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
              <h2>Change password</h2>
            </header>

            <br />
            <div className="field-set">
              <input
                className="form-input"
                id="txt-input"
                type="password"
                name="newPassword"
                placeholder="password"
                onChange={handleChange}
                required
              />
              <input
                className="form-input"
                id="txt-input"
                type="password"
                name="cpassword"
                placeholder="confirm password"
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
