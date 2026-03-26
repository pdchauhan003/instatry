"use client";
import React, { useEffect, useState } from "react";
import { removeItem, clearItems } from "@/redux/cartSlice";
import { useSelector, useDispatch } from "react-redux";
import { useRouter } from "next/navigation";
import { useParams } from "next/navigation";
import Image from "next/image";

// import { useNavigate } from "react-router-dom";
// import toast from "react-hot-toast";
function CartList() {
  const addedItems = useSelector((state) => state.cart.items);
  const { id } = useParams();
  const dispatch = useDispatch();
  const router = useRouter();
  const [cartItems, setCartItems] = useState(addedItems);
  // const [mounted, setMounted] = useState(false);

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
    // navigate('/');
    router.push(`/dashboard/${id}`);
  };

  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;
  return (
    <>
      <div style={{ overflow: "hidden", padding: "20px" }}>
        {/* Header */}
        <div className="cart-header" style={{ textAlign: "center" }}>
          <h2>Your Cart Items</h2>
        </div>

        {/* Bill Section */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            margin: "20px 0",
            alignItems: "center",
          }}
        >
          <h2>Total Amount</h2>
          <h2>
            $
            {cartItems
              .reduce(
                (sum, item) =>
                  item.quantity
                    ? sum + item.price * item.quantity
                    : sum + item.price,
                0,
              )
              .toFixed(2)}
          </h2>
        </div>

        {/* Place Order */}
        <div style={{ textAlign: "right", marginBottom: "20px" }}>
          <button
            onClick={handlePlaceOrder}
            style={{
              padding: "15px 25px",
              backgroundColor: "red",
              color: "white",
              borderRadius: "12px",
              border: "none",
              cursor: "pointer",
            }}
          >
            Place Order
          </button>
        </div>

        {/* Cart Items Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "25px",
          }}
        >
          {cartItems.map((i) => (
            <div
              key={i.id}
              className="product-card"
              style={{
                height: "340px",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                padding: "15px",
                border: "1px solid #ddd",
                borderRadius: "10px",
                textAlign: "center",
              }}
            >
              {/* Card Content */}
              <div style={{ flexGrow: 1 }}>
                <Image
                  src={i.thumbnail}
                  alt={i.title}
                  style={{
                    width: "120px",
                    height: "120px",
                    objectFit: "contain",
                  }}
                  width={300}
                  height={300}
                />

                <h3 style={{ minHeight: "45px" }}>{i.title}</h3>
                <p style={{ minHeight: "20px", color: "#666" }}>{i.brand}</p>

                <p style={{ fontWeight: "bold" }}>
                  $
                  {i.quantity
                    ? (i.price * i.quantity).toFixed(2)
                    : i.price.toFixed(2)}
                </p>
                <b>Quantity : </b>
                <input
                  type="number"
                  min="1"
                  value={i.quantity || 1}
                  onChange={(e) => manageQuantity(i.id, e.target.value)}
                  style={{
                    width: "80px",
                    padding: "5px",
                    marginTop: "5px",
                  }}
                />
              </div>

              {/* Button Fixed at Bottom */}
              <button
                onClick={() => dispatch(removeItem(i))}
                style={{
                  backgroundColor: "red",
                  color: "white",
                  padding: "10px",
                  borderRadius: "8px",
                  border: "none",
                  cursor: "pointer",
                  marginTop: "10px",
                }}
              >
                Remove Item
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
export default CartList;
