import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import ProductUpload from "../pages/ProductUpload";

import Users from "../pages/User/UserList.js";
import UserAdd from "../pages/User/UserAdd.js";
import UserUpdate from "../pages/User/UserUpdate.js";
import UserDetails from "../pages/User/UserDetails.js";
import Sell from "../pages/Sell/index.js";

const publicRouters = [

        { path: '/admin/login', component: Login },
        { path: '/admin/signUp', component: SignUp },

        { path: '/', component: Dashboard , private: true},
        { path: '/admin/', component: Dashboard , private: true},
        { path: '/admin/dashboard', component: Dashboard, private: true },
        
        { path: '/admin/products', component: Products , private: true},
        
        { path: '/admin/product/details', component: ProductDetails},
        { path: '/admin/product/upload', component: ProductUpload },

        { path: '/admin/users', component: Users , private: true},
        { path: '/admin/users/add', component: UserAdd , private: true},
        { path: '/admin/users/update/:id', component: UserUpdate , private: true},
        { path: '/admin/users/details/:id', component: UserDetails , private: true},

        { path: '/sale', component: Sell},

      ];

export { publicRouters};
