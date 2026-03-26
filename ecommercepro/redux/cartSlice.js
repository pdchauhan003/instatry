'use client'
import { createSlice } from "@reduxjs/toolkit";

const getCartFromStorage = () => {
  if (typeof window !== 'undefined') {
    const cart = localStorage.getItem('cart')
    return cart ? JSON.parse(cart) : []
  }
  return []
}
const initialState={
    values:0, 
    items:getCartFromStorage()
}

const productSlice=createSlice({
    name:'cart',
    initialState,
    reducers:{
        addItem:(state,action)=>{
            state.items.push(action.payload)
            localStorage.setItem('cart',JSON.stringify(state.items))
        },
        removeItem:(state,action)=>{
            const removeData=state.items.filter((item)=>item.id!=action.payload.id)
            state.items=removeData
            localStorage.setItem('cart',JSON.stringify(removeData))
        },
        clearItems:(state)=>{
            state.items=[]
        }
    }
})
export const {addItem,removeItem,clearItems}=productSlice.actions
export default productSlice.reducer;