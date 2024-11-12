import React, { useEffect, useState } from 'react';

import ExpandMore from "@mui/icons-material/ExpandMore";
import Breadcrumb  from "@mui/material/Breadcrumbs";
import { emphasize, styled } from "@mui/material/styles";
import Chip from '@mui/material/Chip';
import HomeIcon from '@mui/icons-material/Home';
import { Link, useParams } from 'react-router-dom';

import axios from '../../utils/axiosConfig';

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
} );

const UserDetails = () => {

    const { id } = useParams();
    const [code, setCode] = useState('');
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [dateOfBirth, setDateOfBirth] = useState('');
    const [gender, setGender] = useState("");

    useEffect(() => {
        const fetchUser = async () => {
            const response = await axios.get(`/admin/users/${id}`);
            setCode(response.data.code);
            setName(response.data.name);
            setEmail(response.data.email);
            setPhone(response.data.phone);
            // Chuyển đổi timestamp thành định dạng yyyy-MM-dd
            if (response.data.dateOfBirth) {
                setDateOfBirth(formatDate(response.data.dateOfBirth));
            }
            if (response.data.gender !== undefined) { // Kiểm tra nếu có trường giới tính
                setGender(response.data.gender); // Gán giá trị giới tính từ API
            }
        };
        fetchUser();
    }, [id]);

    const formatDate = (timestamp) => {
        const date = new Date(timestamp);
        return date.toISOString().split('T')[0]; // Chuyển đổi thành định dạng yyyy-MM-dd
    };


    return(
        <>
                <div className="right-content w-100">
                    <div className="card shadow border-0 w-100 flex-row p-4 res-col">
                        <h5 className="mb-0">Chi tiết nhân viên</h5>
                        <Breadcrumb aria-label="breadcrumb" className="ml-auto breadcrumbs_">

                            <StyledBreadcrumb 
                                component={Link}
                                to="/admin"
                                label="Tổng quan"
                                icon={<HomeIcon fontSize ="small" />}
                             />

                            <StyledBreadcrumb 
                                component={Link}
                                to="/admin/users"
                                label="Danh sách nhân viên"
                                deleteIcon={<ExpandMore />}
                            />

                            <StyledBreadcrumb
                                label="Chi tiết nhân viên"
                                deleteIcon={<ExpandMore />}
                             />

                        </Breadcrumb>

                    </div>


                    <div className="card productDetailsSEction">
                            <div className="row">

                                <div className="col-md-5">

                                    <div className='sliderWrapper  pt-3 pb-3 pl-4 pr-4'>

                                    <h6 className='mb-4'>Ảnh nhân viên</h6>

                                        <div className='sliderBig mb-2'>
                                                <div className='item'>
                                                    <img src="https://acc957.com/Img/TaiKhoan.png" className='w-100' alt=''/>
                                                </div>
                                        </div>

                                    </div>
                            
                                </div>

                                <div className="col-md-7">

                                        <div className='sliderWrapper  pt-3 pb-3 pl-4 pr-4'>
                                                <h6 className='mb-4'>Thông tin nhân viên</h6>

                                                <h4>Mã nhân viên: {code}</h4>

                                                <div className='productInfo mt-4'>
                                                        <div className='row mb-2'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        
                                                                        <span className='name'>Họ tên</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>{name}</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                      
                                                                        <span className='name'>phone</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                    <span>{phone}</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                        
                                                                        <span className='name'>Email</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                    <span>{email}</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                                     
                                                                        <span className='name'>Giới tính</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>{gender === 1 ? "Nam" : gender === 0 ? "Nữ" : "Không xác định"}</span>
                                                            </div>
                                                        </div>
                                                        <div className='row'>
                                                            <div className="col-sm-3 d-flex align-items-center">
                                                         
                                                                        <span className='name'>Ngày sinh</span>
                                                            </div>
                                                            <div className="col-sm-9">
                                                                     <span>{dateOfBirth}</span>
                                                            </div>
                                                        </div>
                                                </div>

                                        </div>
                                
                                </div>

                            </div>

             
                    </div>

                </div>
        </>
    )
}

export default UserDetails;