import { configureStore } from "@reduxjs/toolkit";
import authReducer from "./authSlice";
import cartReducer from './cartSlice';
import savedReducer from './savedSlice'
// import productReducer from './productSlice'
export const store=configureStore({
    reducer:{
        cart:cartReducer,
        auth:authReducer,
        savedPost:savedReducer,
    }
})
