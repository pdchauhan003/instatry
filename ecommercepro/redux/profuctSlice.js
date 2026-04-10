import { useProducts } from "@/lib/useProducts";
import { createSlice } from "@reduxjs/toolkit";

const profuctData=useProducts()
const initialState={
    products: profuctData && profuctData || []
}

export const {addProducts,removeProducts}=productSlice.actions
export default productSlice.reducer;