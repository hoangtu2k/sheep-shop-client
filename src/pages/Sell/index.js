import React, { useContext, useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import { Link, useNavigate } from "react-router-dom";

import Button from "@mui/material/Button";
import { MdDelete, MdOutlineControlPoint } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { CiCircleRemove, CiLight } from "react-icons/ci";
import { IoShieldHalfSharp } from "react-icons/io5";
import { FaMinus, FaRegBell } from "react-icons/fa6";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import ListItemIcon from "@mui/material/ListItemIcon";
import PersonAdd from "@mui/icons-material/PersonAdd";
import Logout from "@mui/icons-material/Logout";
import { Divider } from "@mui/material";
import { MyContext } from "../../App";

import "../../assets/css/product.css";

import { AuthContext } from "../../context/AuthProvider";

const Sell = () => {
  const context = useContext(MyContext);
  const { logout } = useContext(AuthContext);

  const { user } = useContext(AuthContext); // Lấy thông tin người dùng từ contex
  const userName = user?.name || "Tên không xác định";
  const roleName = user?.roleName || "Chức vụ không xác định";
  const [userImage, setUserImage] = useState("");

  const [anchorEl, setAnchorEl] = useState(null);
  const [isOpenNotificationsDrop, setisOpenNotificationsDrop] = useState(false);
  const openMyAcc = Boolean(anchorEl);
  const openNotifications = Boolean(isOpenNotificationsDrop);

  const [billTaiQuay, setBillTaiQuay] = useState([]);
  const [selectedBillId, setSelectedBillId] = useState(null);
  const [invoiceDetails, setInvoiceDetails] = useState([]);

  const [productDetails, setProductDetails] = useState([]);
  const [query, setQuery] = useState("");
  const [isFocused, setIsFocused] = useState(false);
  const [cart, setCart] = useState([]);

  const navigate = useNavigate(); // Khai báo hook navigate

  const handleLogout = () => {
    logout(); // Gọi hàm logout
    navigate("/admin/login"); // Điều hướng về trang login
  };

  const handleOpenMyAccDrop = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseMyAccDrop = (event) => {
    setAnchorEl(null);
  };

  const handleOpenNotificationsDrop = () => {
    setisOpenNotificationsDrop(true);
  };

  const handleCloseNotificationsDrop = () => {
    setisOpenNotificationsDrop(false);
  };

  const fetchProductDetails = async () => {
    try {
      const response = await axios.get("/admin/productdetail");
      setProductDetails(response.data);
    } catch (error) {
      console.error(
        "Error fetching users: " + (error.response?.data || error.message)
      );
    }
  };

  const fetchBillTaiQuay = async () => {
    try {
      const response = await axios.get("/sale/billtaiquay"); // Adjust the URL as needed
      setBillTaiQuay(response.data);
      // Set default selected bill to the first one if available
      if (response.data.length > 0) {
        setSelectedBillId(response.data[0].id); // Assuming each bill has a unique 'id'
      }
    } catch (error) {
      console.error(
        "Error fetching bill tai quay: ",
        error.response?.data || error.message
      );
    }
  };

  //////////////////////////////////////////////////////////////////////////////

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price) + " VND";
  };

  const filteredProductDetails = productDetails.filter(
    (productDetail) =>
      productDetail.name.toLowerCase().includes(query.toLowerCase()) ||
      productDetail.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddBillTaiQuay = async (e) => {
    e.preventDefault(); // Ngăn chặn hành động mặc định của form

    try {
      const newBillData = {
        // Thông tin hóa đơn mới
      };
      const response = await axios.post("/sale/billtaiquay", newBillData);
      setBillTaiQuay((prevBills) => [...prevBills, response.data]);
      setSelectedBillId(response.data.id); // Đặt ID hóa đơn mới là ID đã chọn
    } catch (error) {
      console.error(
        "Error adding bill tai quay:",
        error.response?.data || error.message
      );
    }
  };

  const handleBillDelete = async (id) => {
    try {
      // Gọi API để xóa hóa đơn
      const response = await axios.delete(`/sale/billtaiquay/${id}`);

      // Kiểm tra mã trạng thái của phản hồi
      if (response.status === 204) {
        // Trả về 204 No Content khi xóa thành công
        // Cập nhật trạng thái nếu xóa thành công
        setBillTaiQuay((prevBills) =>
          prevBills.filter((bill) => bill.id !== id)
        );
        handleBillSelect(selectedBillId);
      } else {
        throw new Error("Failed to delete the bill");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      // Hiển thị thông báo lỗi cho người dùng nếu cần
      // Ví dụ: setError('Không thể xóa hóa đơn. Vui lòng thử lại.');
    }
  };

  const handleBillSelect = async (billId) => {
    setSelectedBillId(billId); // Đặt ID hóa đơn được chọn
  
    try {
      const response = await axios.get(`/sale/invoice-details/${billId}`);
      if (response.status === 200) {
        setInvoiceDetails(response.data); // Cập nhật chi tiết hóa đơn
        // Cập nhật giỏ hàng từ chi tiết hóa đơn
        const updatedCart = response.data.map((item) => ({
          id: item.productDetailId,
          name: item.productDetailName,
          price: item.unitPrice,
          quantity: item.quantity,
        }));
        setCart(updatedCart); // Cập nhật giỏ hàng
      } else {
        setInvoiceDetails([]);
        setCart([]);
      }
    } catch (error) {
      console.error("Error fetching invoice details:", error);
      setInvoiceDetails([]);
    }
  };

  const addToCart = async (productDetailId) => {
    try {
      // Cập nhật số lượng sản phẩm
      const updateQuantityResponse = await axios.put(
        `/admin/productdetail/update-quantity/${productDetailId}`,
        {
          quantity: 1, // Hoặc điều chỉnh theo logic của bạn
        }
      );

      // Lấy thông tin sản phẩm đã cập nhật
      const updatedProductDetail = updateQuantityResponse.data;

      // Thêm sản phẩm vào chi tiết hóa đơn
      if (selectedBillId) {
        // Kiểm tra xem đã có hóa đơn được chọn chưa
        const addProductDetailToBillDetailResponse = await axios.post(
          `/sale/invoice-details`,
          {
            productDetailId: updatedProductDetail.id,
            billId: selectedBillId,
            quantity: 1, // Số lượng sản phẩm thêm vào hóa đơn
            unitPrice: updatedProductDetail.price, // Giả sử giá được gửi lại trong phản hồi
          }
        );
        
        console.log(
          "Sản phẩm đã được thêm vào hóa đơn:",
          addProductDetailToBillDetailResponse.data
        );
        handleBillSelect(selectedBillId);
        fetchProductDetails();
      } else {
        console.error("Chưa chọn hóa đơn để thêm sản phẩm.");
      }
    } catch (error) {
      console.error(
        "Lỗi khi thêm sản phẩm vào giỏ hàng:",
        error.response?.data || error.message
      );
    }
  };

  useEffect(() => {
    if (user && user.image) {
      setUserImage(user?.image); // Giả sử user.image chứa link ảnh
    }
  }, [user]);

  useEffect(() => {
    fetchProductDetails();
    fetchBillTaiQuay();
    context.setisHideSidebarAndHeader(true);
  }, [context]);

  return (
    <>
      <header className="d-flex align-items-center header-sale-box">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center w-100">
            {context.windowWidth > 992 && (
              <div className="col-sm-3 d-flex align-items-center part2 res-hide">
                <div className="searchBox position-relative d-flex align-items-center">
                  <IoSearch className="mr-2" />
                  <input
                    type="text"
                    placeholder="Tìm kiếm ở đây..."
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onFocus={() => setIsFocused(true)}
                    onBlur={() => setIsFocused(false)}
                  />
                </div>
                {query && isFocused && filteredProductDetails.length > 0 && (
                  <div
                    className="searchBoxProduct"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <table className="table table-bordered v-align">
                      <tbody>
                        {filteredProductDetails.map((productDetail) => (
                          <tr key={productDetail.id} onClick={() => addToCart(productDetail.id)}>
                            <td>{productDetail.code}</td>
                            <td>
                              <div className="d-flex productBox">
                                <div className="imgWrapper">
                                  <div className="img card shadow m-0">
                                    <img
                                      src={productDetail.imageUrl}
                                      className="w-100"
                                      alt={productDetail.name}
                                    />
                                  </div>
                                </div>
                                <div className="info pl-3">
                                  <h6>
                                    {productDetail.name}{" "}
                                    {productDetail.colorName}
                                  </h6>
                                </div>
                              </div>
                            </td>
                            <td>{productDetail.quantity}</td>
                            <td>
                              <div style={{ width: "80px" }}>
                                <span className="new text-danger">
                                  {formatPrice(productDetail.price)}
                                </span>
                              </div>
                            </td>                         
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {context.windowWidth > 992 && (
              <div className="col-sm-6 d-flex align-items-center part2 res-hide">
                {billTaiQuay.map((bill, index) => (
                  <div key={bill.id} className="bill-item">
                    <Button
                      className={`btn-blue btn-addBill ${
                        selectedBillId === bill.id ? "selected" : ""
                      }`}
                      onClick={() => handleBillSelect(bill.id)}
                    >
                      Hóa đơn {index + 1}
                    </Button>
                    <Button
                      className="remove-bill"
                      onClick={() => handleBillDelete(bill.id)}
                    >
                      <CiCircleRemove />
                    </Button>
                  </div>
                ))}
                <Button
                  className="rounded-circle ml-2 "
                  onClick={handleAddBillTaiQuay} // Attach the function here
                >
                  <MdOutlineControlPoint />
                </Button>
              </div>
            )}

            <div className="col-sm-3 d-flex align-items-center justify-content-end part3">
              <Button
                className="rounded-circle mr-3"
                onClick={() => context.setThemeMode(!context.themeMode)}
              >
                <CiLight />
              </Button>

              <div className="dropdownWrapper position-relative">
                <Button
                  className="rounded-circle mr-3"
                  onClick={handleOpenNotificationsDrop}
                >
                  <FaRegBell />
                </Button>

                <Menu
                  anchorEl={isOpenNotificationsDrop}
                  className="notifications dropdown_list"
                  id="notifications"
                  open={openNotifications}
                  onClose={handleCloseNotificationsDrop}
                  onClick={handleCloseNotificationsDrop}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <div className="head pl-3 pb-0">
                    <h4>Orders (12)</h4>
                  </div>
                  <Divider className="mb-1" />

                  <div className="scroll">
                    <MenuItem onClick={handleCloseNotificationsDrop}>
                      <div className="d-flex">
                        <div>
                          <div className="userImg">
                            <span className="rounded-circle">
                              <img
                                src="https://techvccloud.mediacdn.vn/280518386289090560/2024/9/17/reactjs-1726545361892465400796-6-0-465-817-crop-17265453645351178455990.jpg"
                                alt=""
                              />
                            </span>
                          </div>
                        </div>

                        <div className="dropdownInfo">
                          <h4>
                            <span>
                              <b>Mahmudul</b>
                              added to his favorite list
                              <b>Leather belt steve madden</b>
                            </span>
                          </h4>
                          <p className="text-sky mb-0">few seconds ago</p>
                        </div>
                      </div>
                    </MenuItem>
                  </div>

                  <div className="pl-3 pr-3 w-100 pt-2 pb-1">
                    <Button className="btn-blue w-100">
                      View all Notifications
                    </Button>
                  </div>
                </Menu>
              </div>

              {context.isLogin !== true ? (
                <Link to={"/login"}>
                  <Button className="btn-blue btn-lg btn-round">
                    Đăng nhập
                  </Button>
                </Link>
              ) : (
                <div className="myAccWrapper">
                  <Button
                    className="myAcc d-flex align-items-center"
                    onClick={handleOpenMyAccDrop}
                  >
                    <div className="userImg">
                      <span className="rounded-circle">
                        <img src={userImage} alt="User Avatar" />{" "}
                        {/* Hiển thị ảnh người dùng */}
                      </span>
                    </div>

                    <div className="userInfo res-hide">
                      <h4>{userName}</h4>
                      <p className="mb-0">{roleName}</p>
                    </div>
                  </Button>
                  <Menu
                    anchorEl={anchorEl}
                    id="account-menu"
                    open={openMyAcc}
                    onClose={handleCloseMyAccDrop}
                    onClick={handleCloseMyAccDrop}
                    slotProps={{
                      paper: {
                        elevation: 0,
                        sx: {
                          overflow: "visible",
                          filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
                          mt: 1.5,
                          "& .MuiAvatar-root": {
                            width: 32,
                            height: 32,
                            ml: -0.5,
                            mr: 1,
                          },
                          "&::before": {
                            content: '""',
                            display: "block",
                            position: "absolute",
                            top: 0,
                            right: 14,
                            width: 10,
                            height: 10,
                            bgcolor: "background.paper",
                            transform: "translateY(-50%) rotate(45deg)",
                            zIndex: 0,
                          },
                        },
                      },
                    }}
                    transformOrigin={{ horizontal: "right", vertical: "top" }}
                    anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                  >
                    <MenuItem onClick={handleCloseMyAccDrop}>
                      <ListItemIcon>
                        <PersonAdd fontSize="small" />
                      </ListItemIcon>
                      Tài khoản của tôi
                    </MenuItem>
                    <MenuItem onClick={handleCloseMyAccDrop}>
                      <ListItemIcon>
                        <IoShieldHalfSharp fontSize="small" />
                      </ListItemIcon>
                      Đặt lại mật khẩu
                    </MenuItem>
                    <MenuItem onClick={handleLogout}>
                      <ListItemIcon>
                        <Logout fontSize="small" />
                      </ListItemIcon>
                      Đăng xuất
                    </MenuItem>
                  </Menu>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      <div className="right-content w-100">
        <div className="row">
          <div className="col-md-8">
            <div className="card shadow border-0 p-3 mt-4">
              <div className="table-responsive mt-3">
                <table className="table table-bordered v-align">
                  <tbody>
                    {invoiceDetails.map((detail) => (
                      <tr key={detail.invoiceId}>
                        <td style={{ width: "100px" }}>
                          <div className="actions d-flex align-items-center">
                            <Button className="error" color="error">
                              <MdDelete />
                            </Button>
                            {detail.invoiceId}
                          </div>
                        </td>
                        <td style={{ width: "350px" }}>
                          <div className="d-flex align-items-center productBox">
                            <div className="imgWrapper">
                              <div className="img card shadow m-0">
                                <img
                                  src={detail.productDetailUrlImage}
                                  className="w-100"
                                  alt={detail.productDetailName}
                                />
                              </div>
                            </div>
                            <div className="info pl-3">
                              <h6>{detail.productDetailName}</h6>
                              <p>{detail.description}</p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center">
                            <Button className="">
                              <FaMinus />
                            </Button>
                            <div className="form-group">
                              <input
                                type="text"
                                style={{ width: "50px" }}
                                className="form-control text-center"
                                value={detail.quantity}
                                readOnly
                              />
                            </div>
                            <Button className="">
                              <MdOutlineControlPoint />
                            </Button>
                          </div>
                        </td>
                        <td>{formatPrice(detail.unitPrice)}</td>
                        <td>
                          {formatPrice(detail.unitPrice * detail.quantity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="card shadow border-0 p-3 mt-4">
              <div className="table-responsive">
                <div className="form-group">
                  <input type="text" placeholder="Ghi chú đơn hàng" />
                </div>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card shadow border-0 p-3 mt-4">
              <div className="table-responsive mt-3"></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default Sell;
