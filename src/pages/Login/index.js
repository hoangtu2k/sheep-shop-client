import { useContext, useEffect, useState } from "react";
import Logo from "../../assets/images/logo.png";
import { MyContext } from "../../App";

import patern from "../../assets/images/patern.jpg";
import googleIcon from "../../assets/images/googleIcon.png";

import { MdEmail } from "react-icons/md";
import { RiLockPasswordFill } from "react-icons/ri";
import { IoMdEye, IoMdEyeOff } from "react-icons/io";
import { Button } from "@mui/material";
import { Link } from "react-router-dom";
import { useNavigate } from 'react-router-dom';

import axios from '../../utils/axiosConfig';

import { AuthContext } from "../../context/AuthProvider";


const Login = () => {
  const [inputIndex, setInputIndex] = useState(null);

  const [isShowPassword, setisShowPassword] = useState(false);

  const context = useContext(MyContext);

  const { login } = useContext(AuthContext);

  useEffect(() => {
    context.setisHideSidebarAndHeader(true);
  }, );

  const focusInput = (index) => {
    setInputIndex(index);
  };


  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    let hasError = false;

    if (!username) {
      setUsernameError('Tên tài khoản không được để trống.');
      hasError = true;
    } else {
      setUsernameError('');
    }

    if (!password) {
      setPasswordError('Mật khẩu không được để trống.');
      hasError = true;
    } else {
      setPasswordError('');
    }

    if (hasError) return;

    try {
      // Bước 1: Gửi yêu cầu đăng nhập
      const response = await axios.post('/auth/admin/login', {
        username,
        password,
      });

      if (response.status === 200) {
        const token = response.data.token;

        // Bước 2: Gửi yêu cầu để lấy thông tin người dùng
        const userResponse = await axios.get('/admin/user', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Lưu thông tin người dùng vào context
        login(token, userResponse.data); // Pass both token and user data
        navigate('/'); // Điều hướng đến trang chính
      }

    } catch (err) {
      if (err.response && err.response.status === 401) {
        setPasswordError('Tên tài khoản hoặc mật khẩu không hợp lệ.');
      } else {
        setPasswordError('Đăng nhập không thành công. Vui lòng thử lại.');
      }
    }
  };


  return (
    <>
      <img src={patern} className="loginPatern" alt="" />
      <section className="loginSection">
        <div className="loginBox">
          <div className="logo text-center">
            <img src={Logo} width="60px" alt="" />
            <h5 className="font-weight-bold">Login to Hotash</h5>
          </div>

          <div className="wrapper mt-3 card border ">
            <form onSubmit={handleSubmit}>
              <div
                className={`form-group position-relative ${
                  inputIndex === 0 && "focus"
                }`}
              >
                <span className="icon">
                  <MdEmail />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="form-control"
                  placeholder="enter your email"
                  onFocus={() => focusInput(0)}
                  onBlur={() => setInputIndex(null)}
                />
                 {usernameError && <p style={{ color: 'red' }}>{usernameError}</p>}
              </div>
              <div
                className={`form-group position-relative ${
                  inputIndex === 1 && "focus"
                }`}
              >
                <span className="icon">
                  <RiLockPasswordFill />
                </span>
                <input
                  type={`${isShowPassword === true ? "text" : "password"}`}
                  className="form-control"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="enter your password"
                  onFocus={() => focusInput(1)}
                  onBlur={() => setInputIndex(null)}
                />
                <span
                  className="toggleShowPassword"
                  onClick={() => setisShowPassword(!isShowPassword)}
                >
                  {isShowPassword === true ? <IoMdEyeOff /> : <IoMdEye />}
                </span>
                {passwordError && <p style={{ color: 'red' }}>{passwordError}</p>}
              </div>

              <div className="form-group">
                <Button className="btn-blue btn-lg w-100 btn-big" type="submit">
                  Sign In
                </Button>
              </div>

              <div className="form-group text-center mb-0">
                <Link to={"/forgot-password"} className="link">
                  FORGOT PASSWORD
                </Link>
                <div className="d-flex align-items-center justify-content-center or mt-3 mb-3">
                  <span className="line"></span>
                  <span className="txt">or</span>
                  <span className="line"></span>
                </div>

                <Button
                  variant="outlined"
                  className="w-100 btn-lg btn-big loginWithGoogle"
                >
                  <img src={googleIcon} width="25px" alt="" /> &nbsp; Sign In
                  with Google
                </Button>
              </div>
            </form>
          </div>

          <div className="wrapper mt-3 card border footer p-3">
            <span className="text-center">
              Don't have an account?
              <Link to={"/signUp"} className="link color ml-2">
                Register
              </Link>
            </span>
          </div>
        </div>
      </section>
    </>
  );
};

export default Login;