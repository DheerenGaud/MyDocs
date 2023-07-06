import "../style/login.css";
import { useState } from "react";
import { singin } from "./api/user";
import {  useParams } from "react-router-dom";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
const LoginForm = () => {
  const [data, setData] = useState({
    email: "",
    password: "",
  });

  const { projectId } = useParams();
   
  const handleChange = (e) => {
    setData({ ...data, [e.target.name]: e.target.value });
  };

  const handleClick = async (e) => {
    e.preventDefault();
    const x = await singin(data);
    console.log(x.data);
    if (x.data.status === "ok") {
      window.localStorage.setItem("token", x.data.data);
      window.localStorage.setItem("loginStatus", true);
      if (projectId && projectId !== "") {
        window.location.href = `/project/${projectId}`;
      } else {
        window.location.href = "/home";
      }
    }
    else{
         toast.error(x.data.error)
    }
  };

  const changePaswword = () => {
    window.location.href = "./user/forgetPassword";
  };

  return (
    <>   <ToastContainer position="top-center" />
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
              <br />
              <input
                className="form-input"
                type="password"
                placeholder="Password"
                id="pwd"
                onChange={handleChange}
                name="password"
                required
              />
              <br />
              <button className="log-in l-btn" onClick={handleClick}>
                Log In
              </button>
            </div>
            <div className="other">
              <button className="btn l-btn submits frgt-pass" onClick={changePaswword}>
                Forgot Password
              </button>
              <button className="btn l-btn submits sign-up" onClick={() => window.location.href = "./"}>
                Sign Up
                <i className="fa fa-user-plus" aria-hidden="true"></i>
              </button>
            </div>
          </div>
        </form>
   
      </div>
    </>
  );
};

export default LoginForm;
