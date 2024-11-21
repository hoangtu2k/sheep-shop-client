import React, { useContext, useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import { Link, useNavigate } from "react-router-dom";

import { FaUser } from "react-icons/fa";
import { MdAdminPanelSettings, MdDelete, MdOutlineControlPoint } from "react-icons/md";
import { IoSearch } from "react-icons/io5";
import { CiCircleRemove } from "react-icons/ci";
import { FaMinus, FaRegBell } from "react-icons/fa6";
import Logout from "@mui/icons-material/Logout";
import { Divider } from "@mui/material";
import { MyContext } from "../../App";

import "../../assets/css/product.css";
import Swal from "sweetalert2";
import { AuthContext } from "../../auth/AuthProvider";
import { IoIosArrowBack, IoIosArrowForward } from "react-icons/io";
import { Menu, MenuItem, ListItemIcon, FormControl, FormControlLabel, Radio, RadioGroup, TextField, Button } from '@mui/material';

const Sell = () => {
  const navigate = useNavigate();
  const context = useContext(MyContext);
  const { user } = useContext(AuthContext);
  const { logout } = useContext(AuthContext);
  const [themeMode] = useState(true);

  const userId = user?.id;
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
  const [customers, setCustomers] = useState([]);

  const [note, setNote] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('0');
  const [formOfPurchase, setFormOfPurchase] = useState("0");
  const [inputCustomerSearch, setInputCustomerSearch] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState(null); // State for selected customer ID
  const [selectedCustomerName, setSelectedCustomerName] = useState('');
  const [selectedCustomerPhone, setSelectedCustomerPhone] = useState('');

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
      const response = await axios.get("/sale/bill");
      setBillTaiQuay(response.data);
      return response.data; // Return the fetched bills
    } catch (error) {
      console.error("Error fetching bill tai quay: ", error.response?.data || error.message);
      return []; // Return an empty array on error
    }
  };

  const fetchData = async () => {
    await fetchProductDetails();
    const bills = await fetchBillTaiQuay();

    // Automatically select the first bill if it exists
    if (bills.length > 0) {
      setSelectedBillId(bills[0].id);
      handleBillSelect(bills[0].id);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await axios.post('/admin/customers'); // Adjust the API endpoint as needed
      setCustomers(response.data); // Assuming response.data contains the customer array
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  };

  const scrollLeft = () => {
    const billContainer = document.querySelector(".bill-container");
    billContainer.scrollBy({ left: -200, behavior: "smooth" }); // Cuộn 200px sang trái
  };

  const scrollRight = () => {
    const billContainer = document.querySelector(".bill-container");
    billContainer.scrollBy({ left: 200, behavior: "smooth" }); // Cuộn 200px sang phải
  };

  const handleNavigationAdmin = () => {
    window.location.href = '/admin/dashboard';
  };

  const handleChangeFormOfPayment = (event) => {
    setPaymentMethod(event.target.value);
  };

  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price);
  };

  const filteredProductDetails = productDetails.filter(
    (productDetail) =>
      productDetail.name.toLowerCase().includes(query.toLowerCase()) ||
      productDetail.code.toLowerCase().includes(query.toLowerCase())
  );

  const handleAddBillTaiQuay = async (e) => {
    e.preventDefault(); // Ngăn chặn hành động mặc định của form

    // Kiểm tra số lượng hóa đơn hiện tại
    if (billTaiQuay.length >= 10) {
      alert("Không thể thêm hóa đơn mới. Tối đa chỉ có 10 hóa đơn.");
      return; // Ngừng thực hiện hàm nếu đã đạt giới hạn
    }

    try {
      const newBillData = {
        userId: userId,
        createName: userName
      };
      const response = await axios.post("/sale/bill", newBillData);

      // Kiểm tra thông tin trả về
      console.log("Hóa đơn mới:", response.data);

      // Cập nhật state với hóa đơn mới
      setBillTaiQuay((prevBills) => [...prevBills, response.data]);

      // Đặt ID hóa đơn mới là ID đã chọn
      setSelectedBillId(response.data.id);
      handleBillSelect(response.data.id);
      fetchProductDetails();
      // Log ID đã chọn
      console.log("ID hóa đơn đã chọn:", response.data.id);
    } catch (error) {
      console.error(
        "Error adding bill tai quay:",
        error.response?.data || error.message
      );
    }
  };

  const handleBillDelete = async (id) => {
    // Kiểm tra nếu chỉ còn một hóa đơn
    if (billTaiQuay.length <= 1) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Không thể xóa hóa đơn. Phải có ít nhất một hóa đơn trong danh sách.',
        confirmButtonText: 'OK'
      });
      return; // Stop execution
    }

    const confirmDelete = await Swal.fire({
      title: 'Xác nhận xóa',
      text: "Bạn có chắc chắn muốn xóa hóa đơn này?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy'
    });

    if (!confirmDelete.isConfirmed) {
      return; // Stop execution
    }

    try {
      const invoiceDetailsResponse = await axios.get(`/sale/invoice-details/bill/${id}`);
      const invoiceDetails = invoiceDetailsResponse.data;
      for (let item of invoiceDetails) {
        const productDetailId = item.productDetailId;
        const quantity = item.quantity;
        await axios.put(
          `/admin/productdetail/delete-productdetail-update-quantity/${productDetailId}`,
          {
            quantity: quantity,
          }
        );
      }

      // Gọi API để xóa hóa đơn
      const response = await axios.delete(`/sale/bill/${id}`);

      if (response.status === 204) {
        setBillTaiQuay((prevBills) =>
          prevBills.filter((bill) => bill.id !== id)
        );
        handleBillSelect(selectedBillId);
        fetchData();
      } else {
        throw new Error("Failed to delete the bill");
      }
    } catch (error) {
      console.error("Error deleting bill:", error);
      console.log('Không thể xóa hóa đơn. Vui lòng thử lại.');
    }
  };

  const deleteProductDetailToCart = async (id) => {
    try {
      // Fetch current product details to get the quantity
      const productDetailResponse = await axios.get(
        `/sale/invoice-details/${id}`
      );
      const currentQuantity = productDetailResponse.data.quantity;
      const currentId = productDetailResponse.data.productDetails.id;

      console.log("Quantity: " + currentQuantity);
      console.log("ProductDetailId: " + currentId);

      // Assuming you want to set the quantity to 0 (or any logic you need)
      await axios.put(
        `/admin/productdetail/delete-productdetail-update-quantity/${currentId}`,
        {
          quantity: currentQuantity, // or however you want to handle the quantity
        }
      );

      // Call API to delete the product
      await axios.delete(`/sale/invoice-details/${id}`);
      console.log("Xóa thành công sản phẩm khỏi giỏ hàng");
      if (selectedBillId) {
        setSelectedBillId(selectedBillId);
        handleBillSelect(selectedBillId);
        fetchProductDetails();
      }
    } catch (error) {
      console.error("Error deleting product detail:", error);
      // Consider displaying an error message to the user
    }
  };

  const handleBillSelect = async (billId) => {
    setSelectedBillId(billId); // Đặt ID hóa đơn được chọn

    try {
      const response = await axios.get(`/sale/invoice-details/bill/${billId}`);
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

  const addToCart = async (productDetailId, colorId, sizeId, unitPrice) => {
    try {
      // Cập nhật số lượng sản phẩm
      await axios.put(
        `/admin/productdetail/update-quantity/increase/${productDetailId}`,
        {
          quantity: 1, // Hoặc điều chỉnh theo logic của bạn
        }
      );

      // Thêm sản phẩm vào chi tiết hóa đơn
      if (selectedBillId) {
        // Kiểm tra xem đã có hóa đơn được chọn chưa
        const addProductDetailToBillDetailResponse = await axios.post(
          `/sale/invoice-details`,
          {
            productDetailId: productDetailId,
            billId: selectedBillId,
            quantity: 1, // Số lượng sản phẩm thêm vào hóa đơn
            unitPrice: unitPrice,
            colorId: colorId,
            sizeId: sizeId,
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

  const increaseQuantity = async (id, productDetailId, colorId, sizeId) => {
    try {
      // Cập nhật số lượng sản phẩm
      await axios.put(
        `/admin/productdetail/update-quantity/increase/${productDetailId}`,
        {
          quantity: 1, // Hoặc điều chỉnh theo logic của bạn
        }
      );

      // Thêm sản phẩm vào chi tiết hóa đơn
      if (selectedBillId) {
        // Kiểm tra xem đã có hóa đơn được chọn chưa
        await axios.put(`/sale/invoice-details/increase/${id}`, {
          productDetailId: productDetailId,
          billId: selectedBillId,
          colorId: colorId,
          sizeId: sizeId,
        });

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

  const reduceQuantity = async (id, productDetailId, colorId, sizeId) => {
    try {
      // Cập nhật số lượng sản phẩm
      await axios.put(
        `/admin/productdetail/update-quantity/reduce/${productDetailId}`,
        {
          quantity: 1, // Hoặc điều chỉnh theo logic của bạn
        }
      );

      if (selectedBillId) {
        await axios.put(`/sale/invoice-details/reduce/${id}`, {
          productDetailId: productDetailId,
          billId: selectedBillId,
          colorId: colorId,
          sizeId: sizeId,
        });
        console.log("id sản phẩm: " + productDetailId);
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

  const resetFormFields = () => {
    setInputCustomerSearch("");
    setQuery("");
    setNote("");
  };

  const handleChangeFormOfPurchase = (event) => {
    setFormOfPurchase(event.target.value);
  };

  const handleChangeCustomerSearch = (event) => {
    const value = event.target.value;
    setInputCustomerSearch(value);

    if (value) {
      const filteredSuggestions = customers.filter(customer =>
        customer.name.toLowerCase().includes(value.toLowerCase()) ||
        customer.phone.includes(value) // Check for phone number as well
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClickCustomerSearch = (customer) => {
    setInputCustomerSearch(customer.name);
    setSelectedCustomerId(customer.id);
    setSelectedCustomerName(customer.name); // Set selected customer name
    setSelectedCustomerPhone(customer.phone); // Set selected customer phone
    setSuggestions([]); // Clear suggestions after selection
  };

  const handleClearSearchCustomer = () => {
    setInputCustomerSearch('');
    setSelectedCustomerId(null); // Clear selected customer ID
    setSelectedCustomerName('');
    setSelectedCustomerPhone('');
    setSuggestions([]);
  };

  const totalAmount = invoiceDetails.reduce((acc, detail) => {
    return acc + (detail.unitPrice * detail.quantity);
  }, 0);

  const handleSellquickly = async (selectedBillId) => {

    // Kiểm tra nếu không có sản phẩm
    if (invoiceDetails.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Không thể thanh toán. Phải có ít nhất một sản phẩm trong giỏ hàng.',
        confirmButtonText: 'OK'
      });
      return; // Stop execution
    }

    // Step 1: Ask for confirmation before proceeding with the payment
    const confirmPayment = await Swal.fire({
      title: 'Xác nhận thanh toán',
      text: "Bạn có chắc chắn muốn thanh toán cho hóa đơn này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Thanh toán',
      cancelButtonText: 'Hủy'
    });

    // If the user cancels, stop the function
    if (!confirmPayment.isConfirmed) {
      return;
    }

    try {
      // Step 2: Prepare data for payment
      const payBillData = {
        salesChannel: formOfPurchase,
        totalAmount: totalAmount,
        formOfPayment: paymentMethod,
        buyerName: inputCustomerSearch || "Khách vãng lai", // Use inputCustomerSearch or default
        customerId: selectedCustomerId, // Use selected customer ID
        payer: userName,
        note: note
      };

      // Step 3: Update the bill with payment data
      await axios.put(`/sale/bill/${selectedBillId}`, payBillData);

      // Step 4: Create a new bill
      const newBillResponse = await axios.post("/sale/bill", {
        userId: userId, // Assuming you have userId available
        createName: userName // Assuming you have userName available
      });

      // Select the newly created bill
      if (newBillResponse.data && newBillResponse.data.id) {
        handleBillSelect(newBillResponse.data.id); // Select the new bill
      }

      // Refresh the data
      resetFormFields();
      fetchBillTaiQuay();
      fetchProductDetails();
    } catch (error) {
      console.error(
        "Error updating bill tai quay:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.',
        confirmButtonText: 'OK'
      });
    }
  };

  const handleSelldelivery = async (selectedBillId) => {
    // Kiểm tra nếu không có sản phẩm
    if (invoiceDetails.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Cảnh báo',
        text: 'Không thể thanh toán. Phải có ít nhất một sản phẩm trong giỏ hàng.',
        confirmButtonText: 'OK'
      });
      return; // Stop execution
    }

    // Step 1: Ask for confirmation before proceeding with the payment
    const confirmPayment = await Swal.fire({
      title: 'Xác nhận thanh toán',
      text: "Bạn có chắc chắn muốn thanh toán cho hóa đơn này không?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Thanh toán',
      cancelButtonText: 'Hủy'
    });

    // If the user cancels, stop the function
    if (!confirmPayment.isConfirmed) {
      return;
    }

    try {
      // Step 2: Prepare data for payment
      const payBillData = {
        salesChannel: formOfPurchase,
        totalAmount: totalAmount,
        formOfPayment: paymentMethod,
        buyerName: inputCustomerSearch || "Khách vãng lai",
        customerId: selectedCustomerId,
        payer: userName,
        note: note
      };

      // Step 3: Update the bill with payment data
      await axios.put(`/sale/bill/${selectedBillId}`, payBillData);

      // Step 4: Create a new bill
      const newBillResponse = await axios.post("/sale/bill", {
        userId: userId, // Assuming you have userId available
        createName: userName // Assuming you have userName available
      });

      // Select the newly created bill
      if (newBillResponse.data && newBillResponse.data.id) {
        handleBillSelect(newBillResponse.data.id); // Select the new bill
      }

      // Refresh the data
      resetFormFields();
      fetchBillTaiQuay();
      fetchProductDetails();
    } catch (error) {
      console.error(
        "Error updating bill tai quay:",
        error.response?.data || error.message
      );
      Swal.fire({
        icon: 'error',
        title: 'Lỗi',
        text: 'Có lỗi xảy ra khi thanh toán. Vui lòng thử lại.',
        confirmButtonText: 'OK'
      });
    }
  }

  /////////////////////////////////////////////////////////////////////////////
  const [listTinh, setListTinh] = useState([]);
  const [listHuyen, setListHuyen] = useState([]);
  const [listXa, setListXa] = useState([]);
  const [tinh, setTinh] = useState('');
  const [huyen, setHuyen] = useState('');
  useEffect(() => {
    // Lấy danh sách tỉnh
    const fetchTinh = async () => {
      try {
        const response = await axios.get('https://online-gateway.ghn.vn/shiip/public-api/master-data/province', {
          headers: { 'token': '4d12e88b-1cb1-11ef-af94-de306bc60dfa' },
        });
        setListTinh(response.data.data);
      } catch (error) {
        console.error('Error fetching provinces:', error);
      }
    };
    fetchTinh();
  }, []);
  useEffect(() => {
    // Lấy danh sách huyện khi tỉnh thay đổi
    const fetchHuyen = async () => {
      if (tinh) { // Chỉ gọi API nếu tỉnh đã được chọn
        try {
          const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${tinh}`, {
            headers: { 'token': '4d12e88b-1cb1-11ef-af94-de306bc60dfa' },
          });
          setListHuyen(response.data.data);
          setHuyen(''); // Reset huyện khi tỉnh thay đổi
          setListXa([]); // Reset xã khi tỉnh thay đổi
        } catch (error) {
          console.error('Error fetching districts:', error);
        }
      }
    };

    fetchHuyen();
  }, [tinh]);
  useEffect(() => {
    // Lấy danh sách xã khi huyện thay đổi
    const fetchXa = async () => {
      if (huyen) { // Chỉ gọi API nếu huyện đã được chọn
        try {
          const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${huyen}`, {
            headers: { 'token': '4d12e88b-1cb1-11ef-af94-de306bc60dfa' },
          });
          setListXa(response.data.data);
        } catch (error) {
          console.error('Error fetching wards:', error);
        }
      } else {
        setListXa([]); // Reset xã nếu không chọn huyện
      }
    };

    fetchXa();
  }, [huyen]);
  ////////////////////////////////////////////////////////////////////////////

  useEffect(() => {
    if (user && user.image) {
      setUserImage(user?.image); // Giả sử user.image chứa link ảnh
    }
  }, [user]);

  useEffect(() => {
    if (themeMode === true) {
      document.body.classList.remove("dark");
      document.body.classList.add("light");
      localStorage.setItem("themeMode", "light");
    }
    fetchProductDetails();
    fetchBillTaiQuay();
    fetchData();
    fetchCustomers();
    context.setisHideSidebarAndHeader(true);
  }, [context, themeMode]);

  return (
    <>
      <header className="d-flex align-items-center header-sale-box">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center w-100">
            {context.windowWidth > 992 && (
              <div className="col-sm-9 d-flex align-items-center part2 res-hide">
                <div className="searchBox searchBox-sale position-relative d-flex align-items-center">
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

                <IoIosArrowBack
                  className="btn-left-bill"
                  onClick={scrollLeft}
                />

                {query && isFocused && filteredProductDetails.length > 0 && (
                  <div
                    className="searchBoxProduct"
                    onMouseDown={(e) => e.preventDefault()}
                  >
                    <table className="table table-bordered v-align">
                      <tbody>
                        {filteredProductDetails.map((productDetail) => (
                          <tr
                            className="query_search_productdetail-sale"
                            key={productDetail.id}
                            onClick={() =>
                              addToCart(
                                productDetail.id,
                                productDetail.colorId,
                                productDetail.sizeId,
                                productDetail.price
                              )
                            }
                          >
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

                {/* Khung chứa các hóa đơn */}
                <div className="bill-container">
                  {billTaiQuay.map((bill, index) => (
                    <div key={bill.id} className="bill-item">
                      <Button
                        className={`btn-blue btn-addBill ${selectedBillId === bill.id ? "selected" : ""
                          }`}
                        onClick={() => handleBillSelect(bill.id)}
                      >
                        Hóa đơn {index + 1}
                        <CiCircleRemove
                          className="remove-bill"
                          onClick={() => handleBillDelete(bill.id)}
                        />
                      </Button>
                    </div>
                  ))}
                </div>

                <IoIosArrowForward
                  className="btn-right-bill"
                  onClick={scrollRight}
                />

                <Button
                  className="rounded-circle ml-2 btn-add-bill"
                  onClick={handleAddBillTaiQuay} // Attach the function here
                >
                  <MdOutlineControlPoint />
                </Button>
              </div>
            )}

            <div className="col-sm-3 d-flex align-items-center justify-content-end part3">

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
                    <div className="userImg userImg_sale">
                      <span className="rounded-circle">
                        <img src={userImage} alt="User Avatar" />{" "}
                        {/* Hiển thị ảnh người dùng */}
                      </span>
                    </div>

                    <div className="userInfo userInfo_sale res-hide mt-1">
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
                        <FaUser fontSize="small" />
                      </ListItemIcon>
                      Tài khoản của tôi
                    </MenuItem>
                    <MenuItem onClick={handleNavigationAdmin}>
                      <ListItemIcon>
                        <MdAdminPanelSettings fontSize="small" />
                      </ListItemIcon>
                      Quản lý
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

      <div className="right-content-cart w-100">
        <div className="row">
          <div className="col-md-8">
            <div className="card card-sale border-0 ">
              <div className="table-responsive mt-1">
                <table className="table table-bordered v-align">
                  <tbody>
                    {invoiceDetails.map((detail) => (
                      <tr
                        key={detail.invoiceId}
                        className="card-sale-tr"
                      >
                        <td style={{ width: "100px" }}>
                          <div className="actions d-flex align-items-center">
                            <Button
                              className="error"
                              color="error"
                              onClick={() =>
                                deleteProductDetailToCart(detail.invoiceId)
                              }
                            >
                              <MdDelete />
                            </Button>
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
                            <Button
                              onClick={() =>
                                reduceQuantity(
                                  detail.invoiceId,
                                  detail.productDetailId,
                                  detail.colorId,
                                  detail.sizeId
                                )
                              }
                            >
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
                            <Button
                              onClick={() =>
                                increaseQuantity(
                                  detail.invoiceId,
                                  detail.productDetailId,
                                  detail.colorId,
                                  detail.sizeId
                                )
                              }
                            >
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
            <div className="card border-0 p-2">

              <div className="row p-2">
                <div className="col-md-7">
                  <div className="form-group mt-3 ">
                    <input
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      type="text"
                      placeholder="Ghi chú đơn hàng"
                    />
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="row">
                    <div className="col-md-8">
                      <h6>Tổng tiền hàng</h6>
                    </div>
                    <div className="col-md-4">
                      <label>{formatPrice(totalAmount)}</label>
                    </div>
                    <div className="col-md-8">
                      <h6>Giảm giá</h6>
                    </div>
                    <div className="col-md-4">
                      <label>0</label>
                    </div>
                    <div className="col-md-8">
                      <h6>Phí ship</h6>
                    </div>
                    <div className="col-md-4">
                      <label>0</label>
                    </div>
                    <div className="col-md-8">
                      <h6>Khách cần trả</h6>
                    </div>
                    <div className="col-md-4">
                      <label>{formatPrice(totalAmount)}</label>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          </div>



          {formOfPurchase === '0' && (
            <div className="col-md-4">
              <div className="card card-infomation border-0 p-3 mt-4">

                <div className="row">
                  <div className="col-md-12 mb-3">
                    <h6 className="mb-3">Người bán hàng: {userName}</h6>
                    <div className="customer-search">
                      <input
                        className="form-control sales-search-input"
                        type="text"
                        placeholder="Tìm khách hàng"
                        value={inputCustomerSearch}
                        onChange={handleChangeCustomerSearch}
                      />
                      {suggestions.length > 0 && (
                        <ul className="suggestion-list">
                          {suggestions.map((customer, index) => (
                            <li key={index} onClick={() => handleSuggestionClickCustomerSearch(customer)}>
                              <div>
                                <strong>{customer.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.8em', color: '#666' }}>
                                  {customer.code} - {customer.phone}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <CiCircleRemove className="sales-search-btn" onClick={handleClearSearchCustomer} />
                    </div>
                  </div>

                  <div className="col-md-12">
                    <FormControl>
                      <RadioGroup
                        row
                        value={paymentMethod}
                        onChange={handleChangeFormOfPayment}
                        aria-labelledby="demo-row-radio-buttons-group-label"
                        name="row-radio-buttons-group"
                      >
                        <FormControlLabel value="0" control={<Radio />} label="Tiền mặt" />
                        <FormControlLabel value="1" control={<Radio />} label="Chuyển khoản" />
                        <FormControlLabel value="2" control={<Radio />} label="Ví" />
                      </RadioGroup>
                    </FormControl>
                  </div>

                  <div className="col-md-12">
                    {paymentMethod === '0' && (
                      <div className="form-of-cash">

                      </div>
                    )}
                    {(paymentMethod === '1') && (
                      <div className="form-of-transfer">
                        <Button className="btn-big btn-lg full" variant="outlined">
                          Thêm tài khoản ngân hàng
                        </Button>
                      </div>
                    )}
                    {(paymentMethod === '2') && (
                      <div className="form-of-wallet">
                        <Button className="btn-big btn-lg full" variant="outlined">
                          Thêm tài khoản ví
                        </Button>
                      </div>
                    )}
                  </div>

                  <div className="col-md-12 btn-pay">
                    <Button className="btn-blue btn-big btn-lg full" onClick={() => handleSellquickly(selectedBillId)}>
                      Thanh toán
                    </Button>
                  </div>

                </div>

              </div>
            </div>
          )}
          {(formOfPurchase === '1') && (
            <div className="col-md-4">
              <div className="card card-infomation border-0 p-3 mt-4">
                <div className="row">
                  <div className="col-md-12 mb-3">
                    <h6 className="mb-3">Người bán hàng: {userName}</h6>
                    <div className="customer-search">
                      <input
                        className="form-control pr-5"
                        type="text"
                        placeholder="Tìm khách hàng"
                        value={inputCustomerSearch}
                        onChange={handleChangeCustomerSearch}
                      />
                      {suggestions.length > 0 && (
                        <ul className="suggestion-list">
                          {suggestions.map((customer, index) => (
                            <li key={index} onClick={() => handleSuggestionClickCustomerSearch(customer)}>
                              <div>
                                <strong>{customer.name}</strong>
                                <span style={{ display: 'block', fontSize: '0.8em', color: '#666' }}>
                                  {customer.code} - {customer.phone}
                                </span>
                              </div>
                            </li>
                          ))}
                        </ul>
                      )}
                      <CiCircleRemove className="sales-search-btn" onClick={handleClearSearchCustomer} />

                    </div>
                  </div>
                  <div className="row form-group ml-1">

                    <div className="col-md-6 mt-3">
                      <input
                        type="text"
                        placeholder="Tên người nhận"
                        className="form-control"
                        value={selectedCustomerName}
                        onChange={(e) => setSelectedCustomerName(e.target.value)}
                      />
                    </div>
                    <div className="col-md-6 mt-3">
                      <input
                        type="text"
                        placeholder="Số điện thoại"
                        className="form-control"
                        value={selectedCustomerPhone}
                        onChange={(e) => setSelectedCustomerPhone(e.target.value)}
                      />
                    </div>

                    <div className="col-md-12 mt-3">
                      <input type="text" placeholder="Địa chỉ chi tiết (Số nhà,ngõ,đường)" className="form-control" />
                    </div>

                    <div className="col-md-12 mt-3">
                      <select
                        className="form-control"
                        value={tinh}
                        onChange={(e) => setTinh(e.target.value)}
                      >
                        <option value="">Chọn Tỉnh/Thành phố</option>
                        {listTinh.map((item) => (
                          <option key={item.ProvinceID} value={item.ProvinceID}>
                            {item.ProvinceName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12 mt-3">
                      <select
                        className="form-control"
                        value={huyen}
                        onChange={(e) => setHuyen(e.target.value)}
                        disabled={!tinh} // Khóa nếu chưa chọn tỉnh
                      >
                        <option value="">Chọn Quận/Huyện</option>
                        {listHuyen.map((item) => (
                          <option key={item.DistrictID} value={item.DistrictID}>
                            {item.DistrictName}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-12 mt-3">
                      <select
                        className="form-control"
                        disabled={!huyen} // Khóa nếu chưa chọn huyện
                      >
                        <option value="">Chọn Phường/Xã</option>
                        {listXa.map((item) => (
                          <option key={item.WardID} value={item.WardID}>
                            {item.WardName}
                          </option>
                        ))}
                      </select>
                    </div>

                  </div>
                  <div className="col-md-12 btn-pay">
                    <Button className="btn-blue btn-big btn-lg full" onClick={() => handleSelldelivery(selectedBillId)}>Thanh toán</Button>
                  </div>
                </div>
              </div>
            </div>
          )}


        </div>
      </div>

      <footer className="d-flex align-items-center footer-sale-box">
        <div className="container-fluid w-100">
          <div className="row d-flex align-items-center w-100">

            <FormControl className="ml-3">
              <RadioGroup
                row
                value={formOfPurchase}
                onChange={handleChangeFormOfPurchase}
                aria-labelledby="demo-row-radio-buttons-group-label"
                name="row-radio-buttons-group"
              >
                <FormControlLabel value="0" control={<Radio />} label="Bán nhanh" />
                <FormControlLabel value="1" control={<Radio />} label="Bán giao hàng" />
              </RadioGroup>
            </FormControl>

          </div>
        </div>
      </footer>
    </>
  );
};

export default Sell;
