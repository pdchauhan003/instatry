'use client';
import { useParams } from "next/navigation";
import { useSelector,useDispatch } from "react-redux";
import Link from "next/link";
function Navbar(){
    const {id}=useParams();
    const selecteditems=useSelector((state)=>state.cart.items)
    const dispatch=useDispatch();
    return(
        <>
            <div >
      <header className="header">
        <div className="logo">MyShop</div>
        <nav className="nav">
          <li><Link href={`/dashboard/${id}`} style={{textDecoration:'none'}}>home</Link></li>
        </nav>

            {/* <AddCart/> */}
            <div className="header">
          <div className="cart">
            <Link href={`/dashboard/${id}/cart`}>
            🛒
            </Link>
            <span className="cartcount">
              {/* {selecteditems.length > 0 ? selector.length : 0} */}
            </span>
          </div>
        </div>
      </header>
      </div>
        </>
    )
}
export default Navbar;