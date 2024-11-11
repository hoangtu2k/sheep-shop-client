
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

import axios from '../../utils/axiosConfig';

import { toast } from 'react-toastify';
import { MyContext } from "../../App";
import { Link, useNavigate } from "react-router-dom";


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



const Users = () => {
    const context = useContext(MyContext);
    const navigate = useNavigate();
    
    
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

    const [users, setUsers] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const resultsPerPage = 5;

    const totalResults = users.length;
    const totalPages = Math.ceil(totalResults / resultsPerPage);
    
    const indexOfLastUser = currentPage * resultsPerPage;
    const indexOfFirstUser = indexOfLastUser - resultsPerPage;
    const currentUsers = users.slice(indexOfFirstUser, indexOfLastUser);

    const handlePageChange = (event, value) => {
        setCurrentPage(value);
    };

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Tháng bắt đầu từ 0
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const fetchUsers = async () => {
        try {
            const response = await axios.get('/admin/users'); // Adjust the URL as needed
            setUsers(response.data);
        } catch (error) {
            toast.error('Error fetching users: ' + (error.response?.data || error.message));
        }
    };

    useEffect(() => {

        fetchUsers();

        context.setisHideSidebarAndHeader(false);
        window.scrollTo(0, 0);
    }, []);


    const handleDeleteUser = async (id) => {
        try {
            await axios.post(`/admin/users/delete/${id}`); // Adjust the URL as needed
            toast.success('User deleted successfully!');
            fetchUsers(); // Refresh the user list after deletion
            // Optionally, navigate to another page
            // navigate('/admin/users'); // Uncomment if you want to navigate
        } catch (error) {
            toast.error('Error deleting user: ' + (error.response?.data || error.message));
        }
    };

    return (
        <>
            <div className="right-content w-100">
                <div className="card shadow border-0 w-100 flex-row p-4">
                    <h5 className="mb-0">Danh sách nhân viên</h5>
                    <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">
                        <StyledBreadcrumb component="a"
                            href="/"
                            label="Tổng quan"
                            icon={<HomeIcon fontSize="small" />}
                        />

                        <StyledBreadcrumb
                            label="Danh sách nhân viên"
                            deleteIcon={<ExpandMore />}
                        />
                    </Breadcrumb>
                </div>


                <div className="card shadow border-0 p-3 mt-4">
                <h3 className="hd">Nhân viên đang hoạt động</h3>

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
                        <h4>Hiển thị theo tên</h4>
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
                                <th>Mã nhân viên</th>
                                <th style={{ width: "300px" }}>Nhân viên</th>
                                <th>Số điện thoại</th>
                                <th>Email</th>
                                <th>Ngày sinh</th>
                                <th>Giới tính</th>
                                <th>Hành động</th>
                            </tr>
                        </thead>
                        <tbody>
                                                                                                                       
                        {currentUsers.map(user => (
                                    <tr key={user.id}>
                                <td>{user.code}</td>
                                <td>
                                    <div className="d-flex align-items-center productBox">
                                        <div className="imgWrapper">
                                            <div className="img card shadow m-0">
                                                <img
                                                    src={user.image}
                                                    className="w-100"
                                                    alt=""
                                                />
                                            </div>
                                        </div>
                                        <div className="info pl-3">
                                            <h6>{user.name} </h6>
                                            <p>[ {user.roleName === null ? "Không xác định": user.roleName } ]</p>
                                        </div>
                                    </div>
                                </td>
                                <td>{user.phone}</td>
                                <td>{user.email}</td>
                                <td>{formatTimestamp(user.dateOfBirth)}</td>
                                <td>{user.gender === 1 ? "Nam" : user.gender === 0 ? "Nữ" : "Khác"}</td>
                                <td>
                                    <div className="actions d-flex align-items-center">
                                        <Link to={`/admin/users/details/${user.id}`}>
                                            <Button className="secondary" color="secondary">
                                            <FaEye />
                                            </Button>
                                            </Link> 
                                        <Link to={`/admin/users/update/${user.id}`}>
                                            <Button className="success" color="success">
                                                <FaPencilAlt />
                                            </Button>
                                        </Link>                                      
                                        <Button className="error" color="error" onClick={() => handleDeleteUser(user.id)} >
                                                <MdDelete />
                                        </Button>
                                        
                                    </div>
                                </td>
                                </tr>
                            ))}

                        </tbody>
                    </table>

                    <div className="d-flex tableFooter">
                        <p>
                            Hiển thị <b>{currentUsers.length}</b> trong <b>{totalResults}</b> kết quả
                        </p>

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

        </>
    )
}

export default Users;