import React, { useEffect, useState } from "react";

import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import Button from "@mui/material/Button";
import { MenuItem, Select } from "@mui/material";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { FaCloudUploadAlt, FaRegImages } from "react-icons/fa";
import { IoCloseSharp } from "react-icons/io5";
import { Link, useNavigate, useParams } from "react-router-dom";

import axios from "../../utils/axiosConfig";
import { storage } from "../../firebase";
import { ref, uploadBytes } from "firebase/storage";
import { v4 } from "uuid";

const StyledBreadcrumb = styled(Chip)(({ theme }) => {
  const backgroundColor =
    theme.palette.mode === "light"
      ? theme.palette.grey[100]
      : theme.palette.grey[800];
  return {
    backgroundColor,
    height: theme.spacing(3),
    color: theme.palette.text.primary,
    fontWeight: theme.typography.fontWeightRegular,
    "&:hover, &focus": {
      backgroundColor: emphasize(backgroundColor, 0.06),
    },
    "&:active": {
      boxShadow: theme.shadows[1],
      backgroundColor: emphasize(backgroundColor, 0.12),
    },
  };
});

const UserAdd = () => {
  const navigate = useNavigate();

  const { id } = useParams();
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [account, setAccount] = useState("");
  const [accountsList, setAccountsList] = useState([]);

  const [imageUpload, setImageUpload] = useState(null);

  const handleChangeGender = (e) => {
    setGender(e.target.value);
  };

  const handleChangeAccount = (e) => {
    setAccount(e.target.value);
  };

  const handleSubmitUserAdd = async (e) => {
    e.preventDefault();

    try {
      await axios.post(`/admin/users`, {
        code: code,
        name: name,
        email: email,
        phone: phone,
        dateOfBirth: dateOfBirth,
        gender: gender,
        accountId: account,
      });
      navigate("/admin/users"); // Điều hướng đến trang chính
    } catch (error) {
      if (error.response) {
        // Yêu cầu được gửi đi và server đã phản hồi với mã trạng thái khác 2xx
        console.error("Lỗi từ server:", error.response.data);
      } else if (error.request) {
        // Yêu cầu đã được gửi đi nhưng không nhận được phản hồi
        console.error("Không nhận được phản hồi từ server:", error.request);
      } else {
        // Có lỗi xảy ra khi thiết lập yêu cầu
        console.error("Lỗi:", error.message);
      }
    }
  };

  useEffect(() => {
    const fetchAccounts = async () => {
      try {
        const response = await axios.get("/admin/account"); // Replace with your API endpoint
        setAccountsList(response.data);
      } catch (error) {
        console.error("Error fetching accounts:", error);
      }
    };

    fetchAccounts();
  }, []);

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 res-col">
          <h5 className="mb-0">Thêm nhân viên</h5>
          <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component={Link}
              to="/admin"
              label="Tổng quan"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              component={Link}
              to="/admin/users"
              label="Danh sách nhân viên"
              deleteIcon={<ExpandMore />}
            />

            <StyledBreadcrumb
              label="Cập nhật nhân viên"
              deleteIcon={<ExpandMore />}
            />
          </Breadcrumb>
        </div>

        <form className="form" onSubmit={handleSubmitUserAdd}>
          <div className="row">
            <div className="col-md-12">
              <div className="card p-4 mt-0">
                <h5 className="mb-4">Thông tin cơ bản</h5>

                <input hidden type="text" />

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Mã nhân viên</h6>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <h6>Tên nhân viên</h6>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <div className="form-group">
                      <h6>Email</h6>
                      <input
                        type="text"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <h6>Số điện thoại</h6>
                      <input
                        type="phone"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <h6>Giới tính</h6>
                    <Select
                      value={gender}
                      onChange={handleChangeGender}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      className="w-100"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      <MenuItem value={1}>Nam</MenuItem>
                      <MenuItem value={0}>Nữ</MenuItem>
                    </Select>
                  </div>
                  <div className="col">
                    <div className="form-group">
                      <h6>Ngày sinh</h6>
                      <input
                        type="date"
                        value={dateOfBirth}
                        onChange={(e) => setDateOfBirth(e.target.value)}
                      />
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col">
                    <h6>Tài khoản đăng nhập</h6>
                    <Select
                      value={account}
                      onChange={handleChangeAccount}
                      displayEmpty
                      inputProps={{ "aria-label": "Without label" }}
                      className="w-100"
                    >
                      <MenuItem value="">
                        <em>None</em>
                      </MenuItem>
                      {accountsList.map((acc) => (
                        <MenuItem key={acc.id} value={acc.id}>
                          {acc.username}
                        </MenuItem>
                      ))}
                    </Select>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="card p-4 mt-0">
            <div className="imagesUploadSec">
              <h5 className="mb-4">Media And Published</h5>
              <div className="imgUploadBox d-flex align-items-center">
                <div className="uploadBox">
                  <span className="remove">
                    <IoCloseSharp />{" "}
                  </span>
                  <div className="box">
                    <LazyLoadImage
                      alt={"image"}
                      effect="blur"
                      className="w-100"
                      src={"https://acc957.com/Img/DichVu.png"}
                    />
                  </div>
                </div>

                <div className="uploadBox">
                  <input type="file" multiple="" name="images" />
                  <div className="info">
                    <FaRegImages />
                    <h5>image upload</h5>
                  </div>
                </div>
              </div>
            </div>

            <br />

            <Button className="btn-blue btn-lg btn-big" type="submit">
              <FaCloudUploadAlt />
              &nbsp; Lưu
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserAdd;