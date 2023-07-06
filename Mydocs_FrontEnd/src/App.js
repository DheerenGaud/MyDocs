import ForgetPassword from "./component/forgot";
import ResetPassword from "./component/resetPassword";
import LoginForm from "./component/login"
import SinginForm from "./component/singin"
import UserDetail from "./component/userdetail"
import Verifyed from "./component/verifyed";
import Home from "./component/home";
import Edit from "./component/joditEdit";
import {BrowserRouter as Router,Routes,Route} from "react-router-dom";

function App() {
  const loginStatus=window.localStorage.getItem("loginStatus")
  return (
     <>
      
       <Router>
        <Routes>
          <Route path="/" element={<SinginForm/>}/>
          <Route path="/login/:projectId"element={<LoginForm/>}/>
          <Route path="/login/"element={<LoginForm/>}/>
          <Route path="/user"element={<UserDetail/>}/>
          <Route path="/home" element={loginStatus==="true"?<Home/>:<LoginForm/>}/>
          <Route path="/project/:projectId"element={<Edit/>}/>
          <Route path="/user/forgetPassword"element={<ForgetPassword/>}/>;
          <Route path="/user/resetPassword/:userId/:resetString"element={<ResetPassword/>}/>;
          <Route path="/user/verify/:userId/:uniqueString/"element={<Verifyed/>}/>
        </Routes>
       </Router>
     </>
  );
}

export default App;
