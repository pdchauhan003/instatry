"use client";

// import { useSelector,useDispatch } from "react-redux";
import Link from "next/link";
function footerNavbar() {
    
  return (
    <>
      <div>
        <header className="header">
          <div className="logo">MyShop</div>
          <nav className="nav">
            <li>
              <Link href="/login" style={{ textDecoration: "none" }}>
                home
              </Link>
            </li>
            <li>
              <Link href="/login" style={{ textDecoration: "none" }}>
                Messages
              </Link>
            </li>
            <li>
              <Link href="/login" style={{ textDecoration: "none" }}>
                Settings
              </Link>
            </li>
            <li>
              <Link href="/login" style={{ textDecoration: "none" }}>
                Profile
              </Link>
            </li>
          </nav>
        </header>
      </div>
    </>
  );
}
export default footerNavbar;
