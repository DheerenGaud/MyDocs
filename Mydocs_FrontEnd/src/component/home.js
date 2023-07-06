import { useEffect, useState } from "react";
import io from "socket.io-client"
import {
  userdata,
  Project,
  deleteProject,
  newProject,
  allUser,
  giveAccess,
  sendNotificationsendRseponce,
  viewNotification,
  removeAccess
} from "./api/user";

import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import "../style/bell.css";
const socket =io.connect("http://localhost:8080")
export default () => {
  useEffect(() => {
    lodeData();
  }, []);
  const [query, setQuery] = useState("");
  useEffect(() => {
    search();
  }, [query]);
  
  const [data, setData] = useState({
    userId:"",
    projects: [],
    notifications: [],
    Fname:""
  });
  const [pName, setPname] = useState("");

  useEffect(() => {
       socket.emit("newUser",data.userId)
        // socket.on("newUser",data.userId)
       socket.on('new__notification',()=>{
        console.log("new__notification")
        lodeData();
       })
  }, [socket,data]);
  
  const [projectId, setProjectId] = useState("");
  const [users, setUsers] = useState([]);
  const [notifCount, setNotifCount] = useState([]);
  const [shere,setShere]=useState([]);
  const [projects,setProjects]=useState([]);
  const [controbuteProject,setControbuteProject]=useState([]);
  const [projectAdmin,setProjectAdmin]=useState("");
  const [isYour,setIsYour]=useState(false);


  const token = window.localStorage.getItem("token");

  const lodeData = async () => {
    const x = await userdata({ token: token });
   
    if (x.data.status === "ok") {
      console.log(x.data.data);
      setData(x.data.data);
      setProjects(x.data.data.projects.filter((project)=>project.isAdmin===true))
      setControbuteProject(x.data.data.projects.filter((project)=>project.isAdmin===false))
     
      setNotifCount(x.data.data.notifCount);
    } else {
      
      toast.error(x.data.data)
      window.location.href = "/login";
    }
  };
  
  const shereUser = async (index) => {
    const { projectId } = projects[index];
    setIsYour(projects[index].isAdmin)
    const x = await Project({ token, projectId }); 
    if(x.status==="error"){
        toast.error(x.data.data)
    }
    else{
      console.log(x.data.data.shere);
      setShere(x.data.data.shere)
      setProjectId( projects[index].projectId)
      setPname( projects[index].pName)
      setProjectAdmin(x.data.data.adminId)
    }
  };
  const controbuteshereUser = async (index) => {
    const { projectId } = controbuteProject[index];
    setIsYour(controbuteProject[index].isAdmin)
    const x = await Project({ token, projectId }); 
    if(x.status==="error"){
        toast.error(x.data.data)
    }
    else{
      console.log(x.data.data.shere);
      setShere(x.data.data.shere)
      setProjectId( controbuteProject[index].projectId)
      setPname( controbuteProject[index].pName)
      setProjectAdmin(x.data.data.adminId)
    }
  };

  
  const EditProject = (index) => {
    const projectId = projects[index].projectId;
    window.location.href = `/project/${projectId}`;
  };
  const EditControbuter = (index) => {
    const projectId = controbuteProject[index].projectId;
    window.location.href = `/project/${projectId}`;
  };
  const DeleteProject = async (index) => {
    const projectId = projects[index].projectId;
    console.log(projectId)
    const x = await deleteProject({ token, projectId });
    if (x.data.status === "error") {
      toast.error(x.data.data)
    } else {
    
      toast.success(x.data.data)
      const user= x.data.value;
      user.map((id)=>{
            socket.emit("update__notification",id);
      })
      lodeData();
    }
  };
  const handalechange = (e) => {
    setPname(e.target.value);
  };

  const NewProject = async () => {
    console.log(pName);
    const x = await newProject({ token, pName });
    if (x.data.status === "error") {
      toast.error(x.data.data)
    } else {
      toast.success(x.data.data)
      lodeData();
    }
  };
  const GiveAccess = async (toUserId) => {
    console.log("users");
    console.log(projectId);
    const massage = "Help me in project";
    const x = await giveAccess({
      toUserId,
      token,
      projectId,
      massage,
      noid: "",
    });
    if (x.data.status === "error") {
      toast.error(x.data.data)
    } else {
      toast.success(x.data.data)
      socket.emit("update__notification",toUserId);
    }
  };
  const Shere = async (id) => {
    search();
    setProjectId(id);
  };

  const search = async () => {
    const y = await allUser();
    const userData = y.data.data;
    setUsers(userData);
  };

  const showNotificayion = async () => {
    const x = await viewNotification({ token });
    if (x.data.status === "error") {
      toast.error(x.data.data)
      window.location.href = "/login";

    } else {
      lodeData();
    }
  };
  const sendRseponce = async (notId, responses, fromId, pName, projectId) => {
    
    const x = await sendNotificationsendRseponce({
      notId,
      token,
      responses,
      fromId,
      pName,
      projectId,
    });
    if (x.data.status === "error") {
      toast.error(x.data.data)
      
    } else {
      toast.success(x.data.data)
      socket.emit("update__notification",fromId);
    }
    lodeData();
  };
  const resend = async (toUserId, projectId, noid) => {
    const massage = "i am resend the request";
    const x = await giveAccess({ toUserId, token, projectId, massage, noid });
    if (x.data.status === "error") {
      toast.error(x.data.data)
    } else {
      toast.success(x.data.data)
      lodeData();
      socket.emit("update__notification",toUserId);

    }
  };
  const AccessRemove=async(user)=>{
    const x= await removeAccess({user,projectId,token,pName:data.pName})
    console.log(shere)
     if(x.data.status==="error"){
      toast.error(x.data.data)
     }
     else{
      toast.success(x.data.data)
      socket.emit("update__notification",user);
      lodeData()
     }
  }
  const logOut=()=>{
    window.localStorage.clear();
    window.location.href="./login"
  }

  return (
    <>
    <ToastContainer position="top-center"/>
      <div
        class="modal fade"
        id="exampleModal"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div class="modal-dialog">
          <div class="modal-content">
            <div class="modal-header">
              <h1 class="modal-title fs-5" id="exampleModalLabel">
                Group Members
              </h1>
              <button
                type="button"
                class="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            {shere.map((user,i)=>

<div key={i} class="modal-body">
              <div className="d-flex flex-row gap-2 justify-content-between">
                <div className="">
                  <p class="h4"> {user.Fname} {user.Lname}</p>
                </div>
                <div className="d-flex ">
              {
                user.userId===projectAdmin?<>
                       Admin
                </>:isYour===true?<>
                  <button type="button" onClick={()=>{AccessRemove(user.userId)}} class="btn btn-danger">
                     Remove Access
                  </button>
                </>:<></>
              }
                </div>
              </div>
            </div>
            )}
          </div>
        </div>
      </div>

      <div
        className="modal  rounded-4"
        id="closesubs"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog d-flex justify-content-center">
          <div className="modal-content model-style ">
            <div className="modal-body">
              <form className="home d-flex px-3" role="search">
                <input
                  className="form-control me-2"
                  onChange={(e) => setQuery(e.target.value)}
                  type="search"
                  placeholder="Search"
                  aria-label="Search"
                />
                <button className="btn btn-outline-success" type="submit">
                  Search
                </button>
              </form>

              {users
                .filter(
                  (x) =>
                    x.Fname.toLowerCase().includes(query) ||
                    x.Lname.toLowerCase().includes(query)
                )
                .map((user, i) => (
                  
                  <div key={i} className="d-flex flex-row gap-3 px-2 mt-2">
                    <p>
                      <i className="bi bi-person-add fs-3"></i>
                    </p>
                    <p
                      className="fs-4  text-truncate"
                      style={{ width: " 250px" }}
                    >
                      {user.Fname} {user.Lname}
                    </p>
                    <p className="ms-4">
                      <button
                        type="submit"
                        className="btn btn-success "
                        onClick={() => {
                          GiveAccess(user._id);
                        }}
                      >
                        Give Access
                      </button>
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>

      <div
        className="modal fade rounded-4"
        id="closesubs1"
        tabindex="-1"
        aria-labelledby="exampleModalLabel"
        aria-hidden="true"
      >
        <div className="modal-dialog d-flex justify-content-center">
          <div className="modal-content model-style ">
            <div className="modal-body">
              <div className=" p-2" id="login-dp">
                <label
                  for="exampleInputEmail1"
                  className="form-label lh-1 fw-semibold"
                >
                  Project Name:
                </label>
                <input
                  type="text"
                  name="pName"
                  value={pName.pName}
                  onChange={handalechange}
                  className="form-control lh-1 fw-semibold"
                  id="exampleInputEmail1"
                />

                <div className="d-flex mt-4 justify-content-between px-3 ">
                  <button
                    onClick={NewProject}
                    type="submit"
                    className="btn btn-success "
                  >
                    Submit
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <nav className="navbar navbar-expand-lg  bg-dark text-white">
        <div className="container-fluid">
          <a className="navbar-brand text-white" href="#">
            My:Docs
          </a>
          <button
            className="navbar-toggler"
            type="button"
            data-bs-toggle="collapse"
            data-bs-target="#navbarText"
            aria-controls="navbarText"
            aria-expanded="false"
            aria-label="Toggle navigation"
          >
          </button>
          <div className="collapse navbar-collapse" id="navbarText">
            <ul className="navbar-nav me-auto mb-2 mb-lg-0">
              <li className="nav-item">
                <a
                  className="nav-link active text-white"
                  aria-current="page"
                  href="#"
                >
                  Home
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link active text-white"
                  aria-current="page"
                  role="button"
                  onClick={logOut} 
                >
                  LogOut
                </a>
              </li>
              <li className="nav-item">
                <a
                  className="nav-link active text-white"
                  aria-current="page"
                  role="button"
                  >
                  <h5>
                 User : @{data.Fname}
                </h5>
                </a>
              </li>
            </ul>
            <li className="nav-item  me-5 " style={{ listStyle: "none" }}>
              <a
                className="nav-link "
                href="#"
                role="button"
                data-bs-toggle="modal"
                data-bs-target="#closesubs1"
              >
                New Project
              </a>
            </li>
          </div>
          {/* <a
            className="pe-3 ms-5"
            onClick={showNotificayion}
            type="button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight"
          > 
            <i className="bi bi-bell-fill fs-3"></i>
          </a> */}
          <button
            type="button"
            class="icon-button"
            data-bs-toggle="offcanvas"
            data-bs-target="#offcanvasRight"
            aria-controls="offcanvasRight"
            onClick={showNotificayion}
          >
            {/* <span class="material-icons">notifications</span> */}
            <i className="bi bi-bell-fill fs-3"></i>
            {notifCount === 0 ? (
              <></>
            ) : (
              <span class="icon-button__badge">{notifCount}</span>
            )}
          </button>
        </div>
      </nav>

      <div
        className="offcanvas offcanvas-end"
        tabindex="-1"
        id="offcanvasRight"
        aria-labelledby="offcanvasRightLabel"
      >
        <div className="offcanvas-header">
          <h5 className="offcanvas-title" id="offcanvasRightLabel">
            All Request
          </h5>
          <button
            type="button"
            className="btn-close"
            data-bs-dismiss="offcanvas"
            aria-label="Close"
          ></button>
        </div>
        <div className="offcanvas-body">
          {data.notifications.map((x, i) => (
            <div
              key={i}
              className="d-flex justify-content-between border rounded-3  px-3  mb-3"
            >
              <div className="lh-1">
                <p className="lh-base fs-5 ">
                  {" "}
                  <span className="fs-4 fw-semibold">
                    {" "}
                    {x.pName}{" "}
                  </span> <br /> From : {x.fromName} <h6>{x.massage}</h6>{" "}
                </p>
              </div>
              {x.massage === "Accept your request" ? (
                <></>
              ) : x.massage === "User Discarded your request" ? (
                <>
                  <button
                    className="btn"
                    onClick={() => {
                      sendRseponce(x._id, "ok", x.fromId, x.pName, x.projectId);
                    }}
                  >
                    Ok
                  </button>{" "}
                  <button 
                    className="btn"
                    onClick={() => {
                      resend(x.fromId, x.projectId, x._id);
                    }}
                  >
                    Resend
                  </button>
                </>
              ) : x.massage === "Admin deleted the Project" ? (
                <button className="btn"
                  onClick={() => {
                    sendRseponce(x._id, "ok", x.fromId, x.pName, x.projectId);
                  }}
                >
                  Ok
                </button>
              ) :
              x.massage === "Admin remove access from the Project" ? (
                <button className="btn"
                  onClick={() => {
                    sendRseponce(x._id, "ok", x.fromId, x.pName, x.projectId);
                  }}
                >
                  Ok
                </button>
              ) :  (
                <>
                  <div className=" ">
                    <i
                      className="bi bi-check-circle fs-3  m-2"
                      onClick={() => {
                        sendRseponce(
                          x._id,
                          "accepted",
                          x.fromId,
                          x.pName,
                          x.projectId
                        );
                      }}
                    ></i>
                    <i
                      className="bi bi-x-circle fs-3 "
                      onClick={() => {
                        sendRseponce(
                          x._id,
                          "reject",
                          x.fromId,
                          x.pName,
                          x.projectId
                        );
                      }}
                    ></i>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      <div className="container mt-5 bg-white px-5">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col " className="fs-4">
                Your Project 
              </th>
              <th scope="col" className="fs-4">
                Colaborators
              </th>
              <th scope="col" className="fs-4">
                Shere
              </th>
              <th scope="col ms-4" className="fs-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
                {projects.map((e, i) => (
                  <tr className="fs-5 align-middle" key={i}>
                    <td>{e.pName}</td>
                    <td>
                      {" "}
                      <p className="dropdown">
                        <button
                          type="button"
                          class="btn "
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                          onClick={()=>{shereUser(i)}}
                        >
                          <i className="bi bi-people-fill fs-3  "></i>
                        </button>
                      </p>
                    </td>
                    {/* <td> <button type="submit" className="btn btn-success " data-bs-toggle="modal" data-bs-target="#closesubs" ><i className="bi bi-share"></i></button></td> */}
                    <td>
                      {" "}
                      <a
                        onClick={() => {
                          Shere(e.projectId);
                        }}
                        data-bs-toggle="modal"
                        data-bs-target="#closesubs"
                      >
                        {" "}
                        <i className="bi bi-share"></i>
                      </a>{" "}
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          EditProject(i);
                        }}
                        className="btn btn-primary "
                      >
                        <i className="bi bi-pencil-square"></i>Edit{" "}
                      </button>
                      <button
                        onClick={() => {
                          DeleteProject(i);
                        }}
                        className="btn btn-danger mx-1 "
                      >
                        <i className="bi bi-trash"></i>Delete{" "}
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>

      <div className="container mt-5 bg-white px-5">
        <table className="table table-hover">
          <thead>
            <tr>
              <th scope="col " className="fs-4">
                Contribute In
              </th>
              <th scope="col" className="fs-4">
                Colaborators
              </th>

              <th scope="col ms-4" className="fs-4">
                Action
              </th>
            </tr>
          </thead>
          <tbody>
                {controbuteProject.map((e, i) => (
                  <tr className="fs-5 align-middle" key={i}>
                    <td>{e.pName}</td>
                    <td>
                      {" "}
                      <p className="dropdown">
                        <button
                          type="button"
                          class="btn "
                          data-bs-toggle="modal"
                          data-bs-target="#exampleModal"
                          onClick={()=>{controbuteshereUser(i)}}
                        >
                          <i className="bi bi-people-fill fs-3  "></i>
                        </button>
                      </p>
                    </td>
                    <td>
                      <button
                        onClick={() => {
                          EditControbuter(i);
                        }}
                        className="btn btn-primary "
                      >
                        <i className="bi bi-pencil-square"></i>Edit 
                      </button>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>


      {/* <div class="table-responsive">
      <table class="table">
  <thead>
    <tr>
      <th scope="col" className="fs-4">Your Project</th>
      <th scope="col" className="fs-4">Colaborators</th>
      <th scope="col" className="fs-4">Shere</th>
      <th scope="col" className="fs-4">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">3</th>
      <td>Larry</td>
      <td>the Bird</td>
      <td>@twitter</td>
    </tr>
  </tbody>
</table>
</div>

<div class="table-responsive-md">
<table class="table">
  <thead>
    <tr>
      <th scope="col" className="fs-4">Contribute In</th>
      <th scope="col" className="fs-4">Colaborators</th>
      <th scope="col" className="fs-4"></th>
      <th scope="col" className="fs-4">Action</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <th scope="row">3</th>
      <td>Larry</td>
      <td></td>
      <td>the Bird</td>
 
    </tr>
  </tbody>
</table>
</div> */}

      
    </>
  );
};
