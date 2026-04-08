"use client";
import React, { useEffect, useState } from "react";
import { removeItem, clearItems } from "@/redux/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";

function CartList() {
  const addedItems = useSelector((state) => state.cart.items);
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const [cartItems, setCartItems] = useState(addedItems);

  useEffect(() => {
    setCartItems(addedItems);
  }, [addedItems]);

  const manageQuantity = (id, q) => {
    let quantity = parseInt(q) > 1 ? parseInt(q) : 1;
    const cartTempItems = addedItems.map((item) => {
      return item.id == id ? { ...item, quantity } : item;
    });
    setCartItems(cartTempItems);
  };

  const handlePlaceOrder = () => {
    dispatch(clearItems());
    localStorage.clear();
    cartItems.length > 0
      ? alert("order placed")
      : alert("pehle items add karke aa...");
    router.push(`/dashboard/${id}`);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  const totalAmount = cartItems.reduce(
    (sum, item) => item.quantity ? sum + item.price * item.quantity : sum + item.price,
    0
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 pb-24">
      {/* Header Area */}
      <div className="sticky top-0 z-40 bg-gray-100/95 backdrop-blur-sm pt-8 pb-6 mb-8 -mx-4 px-4 md:-mx-8 md:px-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-transparent">
        <div>
          <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
            Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Cart</span>
          </h1>
          <p className="text-slate-500 mt-2">Review your items before placing the order.</p>
        </div>

        <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col md:flex-row items-center gap-6 w-full md:w-auto">
          <div className="flex flex-col">
            <span className="text-slate-500 text-sm font-medium">Total Amount</span>
            <span className="text-3xl font-black text-emerald-600">${totalAmount.toFixed(2)}</span>
          </div>
          <button
            onClick={handlePlaceOrder}
            className="w-full md:w-auto active:scale-95 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-teal-400 hover:to-emerald-500 text-white font-bold py-3 px-8 rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg"
          >
            Place Order
          </button>
        </div>
      </div>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-2xl font-bold text-slate-700">Your cart is empty!</h2>
          <p className="text-slate-500 mt-2 mb-6">Looks like you haven't added anything yet.</p>
          <button
            onClick={() => router.push(`/dashboard/${id}`)}
            className="active:scale-95 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold py-3 px-8 rounded-2xl transition-all"
          >
            Start Shopping
          </button>
        </div>
      ) : (
        /* Cart Items Grid */
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
          {cartItems.map((i) => (
            <div
              key={i.id}
              className="group bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col border border-slate-100"
            >
              {/* Image Container */}
              <div className="relative w-full h-36 md:h-56 overflow-hidden bg-slate-50 flex items-center justify-center p-2 md:p-4">
                <Image
                  src={i.thumbnail}
                  alt={i.title}
                  className="object-contain group-hover:scale-110 transition-transform duration-500 ease-out"
                  fill
                  style={{ objectFit: "contain", padding: "16px" }}
                />
                {/* Brand Badge */}
                {i.brand && (
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 border border-white/40 shadow-sm z-10">
                    {i.brand}
                  </div>
                )}
              </div>

              {/* Card Content */}
              <div className="p-3 md:p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-sm md:text-lg text-slate-800 line-clamp-1 mb-1">{i.title}</h3>

                <div className="flex flex-col md:flex-row md:justify-between items-start md:items-center mb-2 md:mb-4">
                  <p className="text-lg md:text-2xl font-black text-emerald-600 tracking-tight">
                    ${i.quantity ? (i.price * i.quantity).toFixed(2) : i.price.toFixed(2)}
                  </p>
                  <p className="text-xs md:text-sm text-slate-500 font-medium">
                    ${i.price.toFixed(2)} ea
                  </p>
                </div>

                <div className="flex flex-col md:flex-row items-center justify-between mb-3 md:mb-6 bg-slate-50 p-2 rounded-xl border border-slate-100 gap-1 md:gap-0">
                  <span className="font-bold text-slate-700 text-xs md:text-sm pl-0 md:pl-2">Qty</span>
                  <input
                    type="number"
                    min="1"
                    value={i.quantity || 1}
                    onChange={(e) => manageQuantity(i.id, e.target.value)}
                    className="w-12 md:w-16 px-1 py-1 md:px-2 bg-white border border-slate-200 rounded-lg text-center font-bold text-slate-800 text-xs md:text-base focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                {/* Remove Button */}
                <div className="mt-auto">
                  <button
                    onClick={() => dispatch(removeItem(i))}
                    className="w-full active:scale-95 bg-gradient-to-r from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200 text-rose-600 font-semibold py-2 md:py-3 text-xs md:text-base rounded-xl md:rounded-2xl transition-all duration-200 border border-red-200 flex items-center justify-center gap-1 md:gap-2 shadow-sm"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 hidden sm:block" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                    Remove
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CartList;
