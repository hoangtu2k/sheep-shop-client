
import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { FaEye, FaPencilAlt } from "react-icons/fa";
import { MdDelete } from "react-icons/md";
import MenuItem from "@mui/material/MenuItem";
import { useContext, useEffect, useState } from "react";
import Button from "@mui/material/Button";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import Pagination from "@mui/material/Pagination";

import { MyContext } from "../../App";


const StyledBreadcrumb = styled(Chip)(({ theme }) => {
    const backgroundColor = theme.palette.mode === 'light'
        ? theme.palette.grey[100]
        : theme.palette.grey[800];
    return {
        backgroundColor,
        height: theme.spacing(3),
        color: theme.palette.text.primary,
        fontWeight: theme.typography.fontWeightRegular,
        '&:hover, &focus': {
            backgroundColor: emphasize(backgroundColor, 0.06),
        },
        '&:active': {
            boxShadow: theme.shadows[1],
            backgroundColor: emphasize(backgroundColor, 0.12),
        },
    };
});


const Products = () => {

    const context = useContext(MyContext);

    useEffect(() => {
        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);

    const [showBy, setshowBy] = useState("");
    const [showBysetCatBy, setCatBy] = useState("");

    const [anchorEl, setAnchorEl] = useState(null);
    const open = Boolean(anchorEl);

    const handleClick = (event) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };


    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Danh sách sản phẩm</h5>
                    <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb component="a"
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

                <div className="row cardFilters mt-3">
                    <div className="col-md-3">
                        <h4>SHOW BY</h4>
                        <FormControl size="small" className="w-100">
                            <Select
                                value={showBy}
                                onChange={(e) => setshowBy(e.target.value)}
                                displayEmpty
                                inputProps={{ "aria-label": "Without label" }}
                                className="w-100"
                            >
                                <MenuItem value="">
                                    <em>None</em>
                                </MenuItem>
                                <MenuItem value={10}>Ten</MenuItem>
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
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
                                <MenuItem value={20}>Twenty</MenuItem>
                                <MenuItem value={30}>Thirty</MenuItem>
                            </Select>
                        </FormControl>
                    </div>
                </div>

                <div className="table-responsive mt-3">
                    <table className="table table-bordered v-align">
                        <thead className="thead-dark">
                            <tr>
                                <th>UID</th>
                                <th style={{ width: "300px" }}>Sản phẩm</th>
                                <th>Danh mục</th>
                                <th>Thương hiệu</th>
                                <th>Giá bán</th>
                                <th>Đánh giá</th>
                                <th>Đặt hàng</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td>#1</td>
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
                                            <h6>Tops and skirt set for Female...</h6>
                                            <p>Women's exclusive summ...</p>
                                        </div>
                                    </div>
                                </td>
                                <td>womans</td>
                                <td>richman</td>
                                <td>
                                    <div style={{ width: "70px" }}>
                                        <del className="old">$21.00</del>
                                        <span className="new text-danger">$21.00</span>
                                    </div>
                                </td>
                                <td>4.9(16)</td>
                                <td>380</td>
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
                        </tbody>
                    </table>

                    <div className="d-flex tableFooter">
                        <p>
                         Hiển thị <b>12</b> trong <b>60</b> kết quả
                        </p>

                        <Pagination
                            count={10}
                            showFirstButton
                            showLastButton
                            color="primary"
                            className="pagination"
                        />
                    </div>
                </div>
            </div>

            </div>

        </>
    )
}

export default Products;