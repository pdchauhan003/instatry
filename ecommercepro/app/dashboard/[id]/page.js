"use client";
import styles from "./dashboard.module.css";
import { useSelector, useDispatch } from "react-redux";
import { useProducts } from "@/lib/useProducts";
import { addItem, removeItem } from "@/redux/cartSlice";
import Image from "next/image";
function Dashboard() {
  const dispatch = useDispatch();
  const selectorCart = useSelector((state) => state.cart.items);
  console.log(selectorCart);
  const { data, isLoading, error } = useProducts();
  if (isLoading) return <h1>Lagse var pan aavse majaaa...</h1>;
  if (error) return <h1>Error....</h1>;
  console.log(data);
  return (
    <>
    <div className="max-w-6xl mx-auto">
      <h1 className={styles.title}>Products</h1>
      <div className={styles.productcontainer}>
        {data.map((i) => (
          <div className={styles.productcard} key={i.id}>
            <img src={i.thumbnail} alt={i.title} />
            <h3>{i.title}</h3>
            <p>{i.brand}</p>
            <p className={styles.price}>${i.price}</p>
            <p>ratting :{i.rating}</p>
            {selectorCart.find((cartItem) => cartItem.id === i.id) ? (
              <button
                onClick={() => dispatch(removeItem(i))}
                style={{ backgroundColor: "red" }}
                className={styles.btn}
              >
                Remove Item
              </button>
            ) : (
              <button className="btn" onClick={() => dispatch(addItem(i))}>
                Add To Cart
              </button>
            )}
          </div>
        ))}
      </div>
      </div>
    </>
  );
}
export default Dashboard;
