import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import { FaEye, FaPencilAlt, FaRegImages } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";

import axios from "../../utils/axiosConfig";
import { toast } from "react-toastify";

import { MyContext } from "../../App";
import "../../assets/css/product.css";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { IoCloseSharp } from "react-icons/io5";

import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";
import { useNavigate } from "react-router-dom";

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

const style = {
  position: "absolute",
  top: "50%",
  left: "50%",
  transform: "translate(-50%, -50%)",
  width: 1000,
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
};

const Products = () => {

  const [code, setCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");

  const [brand, setBrand] = useState("");
  const [brandList, setBrandsList] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryList, setcategoriesList] = useState([]);

  const [image, setImage] = useState(null);
  const [imagePreview, setImagePreview] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChangeCategory = (event) => {
    setCategory(event.target.value);
  };
  const handleChangeBrand = (event) => {
    setBrand(event.target.value);
  };

  const context = useContext(MyContext);

  const [showByStatus, setShowByStatus] = useState("");
  const [showBysetCatBy, setCatBy] = useState("");

  const [products, setProducts] = useState([]);

  const [currentPage, setCurrentPage] = useState(1);

  const resultsPerPage = 5;

  // Lọc danh sách sản phẩm theo trạng thái
  const filteredProducts = products.filter((product) => {
    if (showByStatus === "") return true; // Hiển thị tất cả nếu không có trạng thái chọn
    return product.status === Number(showByStatus); // Chuyển đổi trạng thái sang số
  });

  // Phân trang
  const totalResults = filteredProducts.length;
  const totalPages = Math.ceil(totalResults / resultsPerPage);
  const indexOfLastUser = currentPage * resultsPerPage;
  const indexOfFirstUser = indexOfLastUser - resultsPerPage;
  const currentUsers = filteredProducts.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  // Hàm xử lý thay đổi trang
  const handlePageChange = (event, value) => {
    setCurrentPage(value);
  };

  const fetchProducts = async () => {
    try {
      const response = await axios.get("/admin/products"); // Adjust the URL as needed
      setProducts(response.data);
    } catch (error) {
      toast.error(
        "Error fetching users: " + (error.response?.data || error.message)
      );
    }
  };

  // Hàm định dạng giá
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price); // Thêm "+ VND " vào cuối
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      const imageUrl = URL.createObjectURL(file); // Tạo URL từ file
      setImagePreview(imageUrl); // Cập nhật URL vào trạng thái
    }
  };

  // Xóa ảnh đã chọn
  const removeImage = () => {
    setImage(null);
    setImagePreview("");
  };

  const handleSubmitUserAdd = async (e) => {
    e.preventDefault();

    if (isSubmitting) return; // Ngăn chặn gửi nếu đang trong quá trình gửi

    setIsSubmitting(true); // Đánh dấu là đang gửi

    try {
      // Gửi thông tin người dùng cùng với URL ảnh (nếu có) đến server
      await axios.post(`/admin/products`, {
        code: code,
        barcode: barcode,
        name: name,
        weight: weight,
        price: price,
        brandId: brand,
        categoryId: category,
      });
      fetchProducts();
      handleClose();
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
    } finally {
      setIsSubmitting(false); // Đặt lại trạng thái khi hoàn thành
    }
  };

  useEffect(() => {
    const fetchBrandsAndCategories = async () => {
      try {
        const responseBrand = await axios.get("/admin/brands"); // Replace with your API endpoint
        setBrandsList(responseBrand.data);
        const responseCategory = await axios.get("/admin/categories"); // Replace with your API endpoint
        setcategoriesList(responseCategory.data);
      } catch (error) {
        console.error("Error fetching product brands & category:", error);
      }
    };

    fetchBrandsAndCategories();
  }, []);

  useEffect(() => {
    fetchProducts();

    context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
  }, []);

  const [open, setOpen] = useState(false);
  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  return (
    <>
      <div className="right-content w-100">
        <div className="card shadow border-0 w-100 flex-row p-4">
          <h5 className="mb-0">Danh sách sản phẩm</h5>
          <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">
            <StyledBreadcrumb
              component="a"
              href="/"
              label="Tổng quan"
              icon={<HomeIcon fontSize="small" />}
            />

            <StyledBreadcrumb
              label="Danh sách sản phẩm"
              deleteIcon={<ExpandMore />}
            />
          </Breadcrumb>
        </div>

        <div className="card shadow border-0 p-3 mt-4">
          <h3 className="hd">Sản phẩm đang bán</h3>

          <Button className="btn-blue btn-lg btn-big" onClick={handleOpen}>
            add
          </Button>

          <div className="row cardFilters mt-3">
            <div className="col-md-3">
              <h4>Hiển thị sản phẩm theo trạng thái</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showByStatus}
                  onChange={(e) => {
                    setShowByStatus(e.target.value);
                    setCurrentPage(1); // Reset về trang đầu khi thay đổi trạng thái
                  }}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={1}>Đang kinh doanh</MenuItem>
                  <MenuItem value={0}>Ngừng kinh doanh</MenuItem>
                </Select>
              </FormControl>
            </div>

            <div className="col-md-3">
              <h4>Hiển thị theo danh mục</h4>
              <FormControl size="small" className="w-100">
                <Select
                  value={showBysetCatBy}
                  onChange={(e) => setCatBy(e.target.value)}
                  displayEmpty
                  inputProps={{ "aria-label": "Without label" }}
                  className="w-100"
                >
                  <MenuItem value="">
                    <em>None</em>
                  </MenuItem>
                  <MenuItem value={10}>Ten</MenuItem>
                </Select>
              </FormControl>
            </div>
          </div>

          <div className="table-responsive mt-3">
            <table className="table table-bordered v-align">
              <thead className="thead-dark">
                <tr>
                  <th>Mã sản phẩm</th>
                  <th>Mã vạch</th>
                  <th style={{ width: "300px" }}>Sản phẩm</th>
                  <th>Danh mục</th>
                  <th>Thương hiệu</th>
                  <th>Giá bán</th>
                  <th>Cho phép kinh doanh</th>
                  <th>Hành động</th>
                </tr>
              </thead>
              <tbody>
                {currentUsers.map((product) => (
                  <tr key={product.id}>
                    <td>{product.code}</td>
                    <td>{product.barcode}</td>
                    <td>
                      <div className="d-flex align-items-center productBox">
                        <div className="imgWrapper">
                          <div className="img card shadow m-0">
                            <img
                              src="https://acc957.com/Img/TaiKhoan.png"
                              className="w-100"
                              alt=""
                            />
                          </div>
                        </div>
                        <div className="info pl-3">
                          <h6>{product.name}</h6>
                          <p>{product.description}</p>
                        </div>
                      </div>
                    </td>
                    <td>{product.categoryName}</td>
                    <td>{product.brandName}</td>
                    <td>
                      <div style={{ width: "80px" }}>
                        {/* <del className="old">$21.00</del> */}
                        <span className="new text-danger">
                          {formatPrice(product.price)}
                        </span>
                      </div>
                    </td>
                    <td>
                      {product.status === 1
                        ? "Cho phép kinh doanh"
                        : "Ngừng kinh doanh"}
                    </td>
                    <td>
                      <div className="actions d-flex align-items-center">
                        <Button className="secondary" color="secondary">
                          <FaEye />
                        </Button>
                        <Button className="success" color="success">
                          <FaPencilAlt />
                        </Button>
                        <Button className="error" color="error">
                          <MdDelete />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            <div className="d-flex tableFooter">
              <Pagination
                count={totalPages}
                page={currentPage}
                onChange={handlePageChange}
                showFirstButton
                showLastButton
                color="primary"
                className="pagination"
              />
            </div>
          </div>
        </div>
      </div>

      <Modal
        keepMounted
        open={open}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            Thêm sản phẩm
          </Typography>
          <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
            <form className="form" onSubmit={handleSubmitUserAdd}>
              <div className="row">
                <div className="col-md-7">
                  <div className="card p-4 mt-0">
                    <div className="row">
                      <div className="col">
                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6 className="mt-2">Mã sản phẩm</h6>
                            </div>
                            <div className="col-md-9">
                              <input
                                type="text"
                                placeholder="Mã hàng tự động"
                                value={code}
                                onChange={(e) => setCode(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6 className="mt-2">Mã vạch</h6>
                            </div>
                            <div className="col-md-9">
                              <input type="text" 
                                value={barcode}
                                onChange={(e) => setBarcode(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6 className="mt-2">Tên sản phẩm</h6>
                            </div>
                            <div className="col-md-9">
                              <input type="text" 
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6 className="mt-2">Giá bán</h6>
                            </div>
                            <div className="col-md-9">
                              <input type="text" 
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <div className="row">
                            <div className="col-md-3">
                              <h6 className="mt-2">Trọng lượng(g)</h6>
                            </div>
                            <div className="col-md-9">
                              <input type="text" 
                                value={weight}
                                onChange={(e) => setWeight(e.target.value)}
                              />
                            </div>
                          </div>
                        </div>

                      </div>
                    </div>
                  </div>
                </div>
                <div className="col-md-5">
                  <div className="card p-4 mt-0">
                    <div className="row">
                      <div className="col">
                        <h6 className="form-select-title">Danh mục</h6>

                        <Select
                          value={category}
                          onChange={handleChangeCategory}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          className="w-100"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {categoryList.map((cate) => (
                          <MenuItem key={cate.id} value={cate.id}>
                            {cate.name}
                          </MenuItem>
                          ))}
                        </Select>
                      </div>
                      <div className="col">
                        <h6 className="form-select-title">Thương hiệu</h6>
                        <Select
                          value={brand}
                          onChange={handleChangeBrand}
                          displayEmpty
                          inputProps={{ "aria-label": "Without label" }}
                          className="w-100"
                        >
                          <MenuItem value="">
                            <em>None</em>
                          </MenuItem>
                          {brandList.map((b) => (
                          <MenuItem key={b.id} value={b.id}>
                            {b.name}
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
                  <h5 className="mb-4">Ảnh sản phẩm</h5>
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
                <div className="row">
                  <div className="col">
                    <Button className="btn-blue btn-lg btn-big" type="submit">
                      Lưu và thêm mới
                    </Button>
                  </div>
                  <div className="col">
                    <Button className="btn-big btn-close" onClick={handleClose}>
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Typography>
        </Box>
      </Modal>
    </>
  );
};

export default Products;
