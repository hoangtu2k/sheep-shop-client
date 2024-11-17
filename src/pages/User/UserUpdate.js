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

import { storage } from "../../utils/firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

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

const UserUpdate = () => {
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

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const imageUrl = URL.createObjectURL(file); // Tạo URL từ file
      setImagePreview(imageUrl); // Cập nhật URL vào trạng thái
    }
  };

  const removeImage = () => {
    setImage(null);
    setImagePreview(""); // Xóa ảnh đã chọn
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

  useEffect(() => {
    const fetchUser = async () => {
      const response = await axios.get(`/admin/users/${id}`);
      setCode(response.data.code);
      setName(response.data.name);
      setEmail(response.data.email);
      setPhone(response.data.phone);

      // Lấy URL ảnh từ response và cập nhật imagePreview
      if (response.data.image) {
        setImage(response.data.image); // Lưu URL ảnh vào state
        setImagePreview(response.data.image); // Cập nhật preview ảnh
      }

        console.log("URL ảnh:", response.data.image);
      // Chuyển đổi timestamp thành định dạng yyyy-MM-dd
      if (response.data.dateOfBirth) {
        setDateOfBirth(formatDate(response.data.dateOfBirth));
      }
      if (response.data.gender !== undefined) {
        // Kiểm tra nếu có trường giới tính
        setGender(response.data.gender); // Gán giá trị giới tính từ API
      }

      if (response.data.account && response.data.account.id !== null) {
        setAccount(response.data.account.id);
      } else {
        setAccount("");
      }
    };
    fetchUser();
  }, [id]);

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    return date.toISOString().split("T")[0];
  };

  const handleChangeGender = (e) => {
    setGender(e.target.value);
  };

  const handleChangeAccount = (e) => {
    setAccount(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Ngăn chặn gửi nếu đang trong quá trình gửi

    setIsSubmitting(true); // Đánh dấu là đang gửi

    try {
      let imageUrl = "";

      // Nếu có ảnh được chọn, kiểm tra trước khi tải lên
      if (image) {
        const storageRef = ref(storage, `images/sheepshop/${image.name}`);
        try {
          // Kiểm tra xem ảnh đã tồn tại bằng cách lấy URL
          imageUrl = await getDownloadURL(storageRef);
          console.log("Ảnh đã tồn tại:", imageUrl);
        } catch (error) {
          // Nếu không tìm thấy ảnh, tải ảnh lên
          await uploadBytes(storageRef, image);
          imageUrl = await getDownloadURL(storageRef);
          console.log("Ảnh đã được tải lên:", imageUrl);
        }
      }

      await axios.put(`/admin/users/${id}`, {
        code: code,
        name: name,
        email: email,
        phone: phone,
        dateOfBirth: dateOfBirth,
        gender: gender,
        accountId: account,
        image: imageUrl, // Thêm URL ảnh vào payload
      });
      navigate("/admin/users"); // Điều hướng đến trang chính
    } catch (error) {
      console.error("Lỗi cập nhật người dùng:", error);
    } finally {
      setIsSubmitting(false); // Đặt lại trạng thái khi hoàn thành
    }
  };

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4 res-col">
          <h5 className="mb-0">Cập nhật nhân viên</h5>
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

        <form className="form" onSubmit={handleSubmit}>
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
               
                            {imagePreview ? (
                                        <div className="uploadBox">
                                          <span className="remove" onClick={removeImage}>
                                            <IoCloseSharp />
                                          </span>
                                          <div className="box">
                                            <LazyLoadImage
                                              alt={"image"}
                                              effect="blur"
                                              className="w-100"
                                              src={imagePreview} // Sử dụng URL đã tạo
                                            />
                                          </div>
                                        </div>
                                      ) : (
                                        <div className="uploadBox">
                                          <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageChange}
                                          />
                                          <div className="info">
                                            <FaRegImages />
                                            <h5>Image Upload</h5>
                                          </div>
                                        </div>
                                      )}



              </div>
            </div>

            <br />

            <Button className="btn-blue btn-lg btn-big" type="submit" disabled={isSubmitting}>
              <FaCloudUploadAlt />
              &nbsp; {isSubmitting ? "Đang gửi..." : "Cập nhật người dùng"}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
};

export default UserUpdate;
