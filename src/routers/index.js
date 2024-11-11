import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";
import SignUp from "../pages/SignUp";

import Products from "../pages/Products";
import ProductDetails from "../pages/ProductDetails";
import ProductUpload from "../pages/ProductUpload";

import Users from "../pages/User/UserList.js";
import UserAdd from "../pages/User/UserAdd.js";
import UserUpdate from "../pages/User/UserUpdate.js";

const publicRouters = [

        { path: '/login', component: Login },
        { path: '/signUp', component: SignUp },

        { path: '/', component: Dashboard , private: true},
        { path: '/dashboard', component: Dashboard, private: true },
        { path: '/products', component: Products, private: true },
        { path: '/product/details', component: ProductDetails, private: true },
        { path: '/product/upload', component: ProductUpload, private: true },

        { path: '/users', component: Users , private: true},
        { path: '/users/add', component: UserAdd , private: true},
        { path: '/users/update/:id', component: UserUpdate , private: true},

      ];

export { publicRouters};
