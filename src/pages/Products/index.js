import "../../assets/css/product.css";
import React, { useContext, useEffect, useState } from "react";
import axios from "../../utils/axiosConfig";
import { toast } from "react-toastify";
import { MyContext } from "../../App";
import { storage } from "../../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { MdDelete } from "react-icons/md";
import { IoCloseSharp } from "react-icons/io5";
import { LazyLoadImage } from "react-lazy-load-image-component";

import { FaEye, FaPencilAlt, FaRegImages } from "react-icons/fa";
import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from "@mui/material/Chip";
import HomeIcon from "@mui/icons-material/Home";
import MenuItem from "@mui/material/MenuItem";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";
import Box from "@mui/material/Box";
import Modal from "@mui/material/Modal";
import Typography from "@mui/material/Typography";

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
  width: "90%", // Chiều rộng phản hồi
  maxWidth: 1000,
  maxHeight: "80vh", // Chiều cao tối đa
  overflowY: "auto", // Cho phép cuộn
  bgcolor: "background.paper",
  border: "2px solid #000",
  boxShadow: 24,
  p: 4,
  borderRadius: "8px",
};

const Products = () => {

  const [id, setId] = useState(null);
  const [code, setCode] = useState("");
  const [barcode, setBarcode] = useState("");
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [brand, setBrand] = useState("");
  const [brandList, setBrandsList] = useState([]);
  const [category, setCategory] = useState("");
  const [categoryList, setcategoriesList] = useState([]);
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState({
    main: [],
    additional: [],
    featured: [],
    secondary: [],
    banner: [],
  });

  

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

  // Hàm định dạng giá
  const formatPrice = (price) => {
    return new Intl.NumberFormat("vi-VN").format(price); // Thêm "+ VND " vào cuối
  };

  const handleMainImageChange = (event) => {
    const file = event.target.files[0];
    const previewUrl = URL.createObjectURL(file);

    console.log("Main Image:", { file, url: previewUrl });

    setImages([{ file, main: true, featured: false, secondary: false }]);
    setImagePreviews({
      main: [
        { url: previewUrl, main: true, featured: false, secondary: false },
      ],
      additional: [],
      featured: [],
      secondary: [],
    });
  };

  const handleAdditionalImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      featured: false,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      featured: false,
    }));

    console.log("Additional Images:", newImages, newImagePreviews);

    setImages((prevImages) => [...prevImages, ...newImages]);
    setImagePreviews((prevPreviews) => ({
      ...prevPreviews,
      additional: [...prevPreviews.additional, ...newImagePreviews],
    }));
  };

  const handleFeaturedImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      featured: true,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      featured: true,
    }));

    console.log("Featured Images:", newImages, newImagePreviews);

    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => ({
      ...prev,
      featured: [...prev.featured, ...newImagePreviews],
    }));
  };

  const handleSecondaryImagesChange = (event) => {
    const files = Array.from(event.target.files);
    const newImages = files.map((file) => ({
      file,
      main: false,
      secondary: true,
    }));
    const newImagePreviews = files.map((file) => ({
      url: URL.createObjectURL(file),
      main: false,
      secondary: true,
    }));

    console.log("Secondary Images:", newImages, newImagePreviews);

    setImages((prev) => [...prev, ...newImages]);
    setImagePreviews((prev) => ({
      ...prev,
      secondary: [...prev.secondary, ...newImagePreviews],
    }));
  };

  const removeImage = (type, index) => {
    setImagePreviews((prev) => ({
      ...prev,
      [type]: prev[type].filter((_, i) => i !== index),
    }));
  };

  const handleSubmitProductAdd = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      let imageUrls = [];

      if (images && images.length > 0) {
        imageUrls = await Promise.all(
          images.map(async (image) => {
            const storageRef = ref(
              storage,
              `images/sheepshop/${image.file.name}`
            );
            let imageUrl;

            try {
              imageUrl = await getDownloadURL(storageRef);
              console.log("Image already exists:", imageUrl);
            } catch (error) {
              await uploadBytes(storageRef, image.file);
              imageUrl = await getDownloadURL(storageRef);
              console.log("Image uploaded:", imageUrl);
            }

            return {
              url: imageUrl,
              mainImage: image.main,
            };
          })
        );
      }

      const productResponse = await axios.post(`/admin/products`, {
        code,
        barcode,
        name,
        weight,
        price,
        brandId: brand,
        categoryId: category,
      });

      const productId = productResponse.data.id;

      await Promise.all(
        imageUrls.map((image) =>
          axios.post(`/admin/product/image`, {
            productId,
            imageUrl: image.url,
            mainImage: image.mainImage ? 1 : 0, // Convert boolean to 1 or 0
          })
        )
      );

      fetchProducts();
      handleCloseModelAddAndUpdateProduct();
      resetFormFields();
    } catch (error) {
      if (error.response) {
        console.error("Server error:", error.response.data);
        alert(
          `Error from server: ${
            error.response.data.message || "An error occurred."
          }`
        );
      } else if (error.request) {
        console.error("No response received:", error.request);
        alert("No response received from server. Please try again.");
      } else {
        console.error("Error:", error.message);
        alert(`Error: ${error.message}`);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSubmitProductUpdate = async (e) => {
    e.preventDefault();
  
    // Tạo đối tượng sản phẩm để cập nhật
    const updatedProduct = {
      id: id,
      code,
      barcode,
      name,
      price,
      weight,
      categoryId: category,
      brandId: brand,
    };
  
    try {
      // Gọi API để cập nhật sản phẩm
      const response = await axios.put(`/admin/products/${id}`, updatedProduct, {
        headers: {
          'Content-Type': 'application/json',
        },
      });
  
      // Nếu cập nhật thành công, có thể lấy dữ liệu mới hoặc chỉ cần thông báo thành công
      console.log('Cập nhật thành công:', response.data);
  
      // Đóng modal và reset các state
      fetchProducts(); // Gọi lại hàm để cập nhật danh sách sản phẩm
      handleCloseModelAddAndUpdateProduct();
      resetFormFields();
    } catch (error) {
      console.error('Có lỗi xảy ra:', error);
      // Có thể thông báo lỗi cho người dùng
      // nếu muốn hiển thị thông báo cho người dùng, có thể sử dụng một thư viện thông báo
    }
  };

  const resetFormFields = () => {
    setCode("");
    setBarcode("");
    setName("");
    setPrice("");
    setWeight("");
    setBrand("");
    setCategory("");
    setImages([]);
    setImagePreviews({
      main: [],
      additional: [],
      featured: [],
      secondary: [],
      banner: [],
    });
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
    fetchProducts();

    context.setisHideSidebarAndHeader(false);
    window.scrollTo(0, 0);
  }, []);

  const [openModelAddProduct, setModelAddProduct] = useState(false);
  const [openModelUpdateProduct, setOpenModelUpdateProduct] = useState(false);
  const handleOpenModelAddProduct = () => setModelAddProduct(true);
  const handleCloseModelAddAndUpdateProduct = () => {
    setModelAddProduct(false);
    setOpenModelUpdateProduct(false);
    setId(null); // Reset ID sản phẩm
    resetFormFields(); // Reset form fields when closing
  };

  const handleOpenModelUpdateProduct = (product) => {
    setId(product.id); // Lưu ID sản phẩm
    setCode(product.code);
    setBarcode(product.barcode);
    setName(product.name);
    setPrice(product.price);
    setWeight(product.weight);
    setCategory(product.categoryId); // Thay thế với id thực tế
    setBrand(product.brandId); // Thay thế với id thực tế
    setOpenModelUpdateProduct(true);
  };

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

          <Button
            className="btn-blue btn-lg btn-big"
            onClick={handleOpenModelAddProduct}
          >
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
                        <Button
                          className="success"
                          color="success"
                          onClick={() => handleOpenModelUpdateProduct(product)}
                        >
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
        open={openModelAddProduct}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            Thêm sản phẩm
          </Typography>
          <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
            <form className="form" onSubmit={handleSubmitProductAdd}>
              <div className="row">
                <div className="col-md-12">
                  <div className="card p-2 mt-0">
                    <div className="row">
                      <div className="col-md-7">
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-5">
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

                      <div className="imagesUploadSec mt-2 pl-3">
                        <div className="imgUploadBox d-flex align-items-center">
                          <div className="row">
                            <div className="col-md-3 pt-3">
                              {/* Main Image Upload */}
                              {imagePreviews.main.length ? (
                                imagePreviews.main.map((preview, index) => (
                                  <div key={index} className="uploadBox">
                                    <span
                                      className="remove"
                                      onClick={() => removeImage("main", index)}
                                    >
                                      <IoCloseSharp />
                                    </span>
                                    <div className="box">
                                      <LazyLoadImage
                                        alt="Main image"
                                        effect="blur"
                                        className="w-100"
                                        src={preview.url}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Main Image Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Additional Images Upload */}
                              {imagePreviews.additional.length ? (
                                imagePreviews.additional.map(
                                  (preview, index) => (
                                    <div key={index} className="uploadBox">
                                      <span
                                        className="remove"
                                        onClick={() =>
                                          removeImage("additional", index)
                                        }
                                      >
                                        <IoCloseSharp />
                                      </span>
                                      <div className="box">
                                        <LazyLoadImage
                                          alt="Additional image"
                                          effect="blur"
                                          className="w-100"
                                          src={preview.url}
                                        />
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Additional Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Featured Images Upload */}
                              {imagePreviews.featured.length ? (
                                imagePreviews.featured.map((preview, index) => (
                                  <div key={index} className="uploadBox">
                                    <span
                                      className="remove"
                                      onClick={() =>
                                        removeImage("featured", index)
                                      }
                                    >
                                      <IoCloseSharp />
                                    </span>
                                    <div className="box">
                                      <LazyLoadImage
                                        alt="Featured image"
                                        effect="blur"
                                        className="w-100"
                                        src={preview.url}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFeaturedImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Featured Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Featured Images Upload */}
                              {imagePreviews.secondary.length ? (
                                imagePreviews.secondary.map(
                                  (preview, index) => (
                                    <div key={index} className="uploadBox">
                                      <span
                                        className="remove"
                                        onClick={() =>
                                          removeImage("secondary", index)
                                        }
                                      >
                                        <IoCloseSharp />
                                      </span>
                                      <div className="box">
                                        <LazyLoadImage
                                          alt="Secondary image"
                                          effect="blur"
                                          className="w-100"
                                          src={preview.url}
                                        />
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleSecondaryImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Secondary Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-4 mt-0">
                <div className="row">
                  <div className="col mt-2">
                    <Button
                      className="btn-blue btn-lg btn-big"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang lưu..." : "Thêm sản phẩm mới"}
                    </Button>
                  </div>
                  <div className="col mt-2">
                    <Button
                      className="btn-big btn-close"
                      onClick={handleCloseModelAddAndUpdateProduct}
                    >
                      Bỏ qua
                    </Button>
                  </div>
                </div>
              </div>
            </form>
          </Typography>
        </Box>
      </Modal>

      <Modal
        keepMounted
        open={openModelUpdateProduct}
        aria-labelledby="keep-mounted-modal-title"
        aria-describedby="keep-mounted-modal-description"
      >
        <Box sx={style}>
          <Typography id="keep-mounted-modal-title" variant="h6" component="h2">
            Sửa sản phẩm
          </Typography>
          <Typography id="keep-mounted-modal-description" sx={{ mt: 2 }}>
            <form className="form" onSubmit={handleSubmitProductUpdate}>
              <div className="row">
                <div className="col-md-12">
                  <div className="card p-2 mt-0">
                    <div className="row">
                      <div className="col-md-7">
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
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
                                  <input
                                    type="text"
                                    value={weight}
                                    onChange={(e) => setWeight(e.target.value)}
                                  />
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                      <div className="col-md-5">
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

                      <div className="imagesUploadSec mt-2 pl-3">
                        <div className="imgUploadBox d-flex align-items-center">
                          <div className="row">
                            <div className="col-md-3 pt-3">
                              {/* Main Image Upload */}
                              {imagePreviews.main.length ? (
                                imagePreviews.main.map((preview, index) => (
                                  <div key={index} className="uploadBox">
                                    <span
                                      className="remove"
                                      onClick={() => removeImage("main", index)}
                                    >
                                      <IoCloseSharp />
                                    </span>
                                    <div className="box">
                                      <LazyLoadImage
                                        alt="Main image"
                                        effect="blur"
                                        className="w-100"
                                        src={preview.url}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleMainImageChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Main Image Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Additional Images Upload */}
                              {imagePreviews.additional.length ? (
                                imagePreviews.additional.map(
                                  (preview, index) => (
                                    <div key={index} className="uploadBox">
                                      <span
                                        className="remove"
                                        onClick={() =>
                                          removeImage("additional", index)
                                        }
                                      >
                                        <IoCloseSharp />
                                      </span>
                                      <div className="box">
                                        <LazyLoadImage
                                          alt="Additional image"
                                          effect="blur"
                                          className="w-100"
                                          src={preview.url}
                                        />
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleAdditionalImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Additional Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Featured Images Upload */}
                              {imagePreviews.featured.length ? (
                                imagePreviews.featured.map((preview, index) => (
                                  <div key={index} className="uploadBox">
                                    <span
                                      className="remove"
                                      onClick={() =>
                                        removeImage("featured", index)
                                      }
                                    >
                                      <IoCloseSharp />
                                    </span>
                                    <div className="box">
                                      <LazyLoadImage
                                        alt="Featured image"
                                        effect="blur"
                                        className="w-100"
                                        src={preview.url}
                                      />
                                    </div>
                                  </div>
                                ))
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleFeaturedImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Featured Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                            <div className="col-md-3 pt-3">
                              {/* Featured Images Upload */}
                              {imagePreviews.secondary.length ? (
                                imagePreviews.secondary.map(
                                  (preview, index) => (
                                    <div key={index} className="uploadBox">
                                      <span
                                        className="remove"
                                        onClick={() =>
                                          removeImage("secondary", index)
                                        }
                                      >
                                        <IoCloseSharp />
                                      </span>
                                      <div className="box">
                                        <LazyLoadImage
                                          alt="Secondary image"
                                          effect="blur"
                                          className="w-100"
                                          src={preview.url}
                                        />
                                      </div>
                                    </div>
                                  )
                                )
                              ) : (
                                <div className="uploadBox">
                                  <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleSecondaryImagesChange}
                                  />
                                  <div className="info">
                                    <FaRegImages />
                                    <h5>Secondary Images Upload</h5>
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="card p-4 mt-0">
                <div className="row">
                  <div className="col mt-2">
                    <Button
                      className="btn-blue btn-lg btn-big"
                      type="submit"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Đang lưu..." : "Sửa sản phẩm"}
                    </Button>
                  </div>
                  <div className="col mt-2">
                    <Button
                      className="btn-big btn-close"
                      onClick={handleCloseModelAddAndUpdateProduct}
                    >
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
