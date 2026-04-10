'use client';
import { useParams } from "next/navigation";
import Link from "next/link";
import { CircleUserRound } from "lucide-react";

import { useEffect, useState } from "react";

import { useSelector, useDispatch } from "react-redux";
import { setAuthUser } from "@/redux/authSlice";

function Navbar(){
    const {id}=useParams();
    const [isSeller, setIsSeller] = useState(false);
    const { user } = useSelector(state => state.auth);
    const dispatch = useDispatch();

    useEffect(() => {
        if (!id || user) return;
        const fetchUserData = async () => {
            try {
                const res = await fetch(`/api/auth/home/${id}/profile`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ id }), // Use ID for hydration
                });
                const data = await res.json();
                if (data.success) {
                    dispatch(setAuthUser(data.user));
                }
            } catch (error) {
                console.error("Error hydrating user:", error);
            }
        };
        fetchUserData();
    }, [id, user, dispatch]);

    useEffect(() => {
        if (!id) return;
        const checkSellerStatus = async () => {
          try {
            const res = await fetch("/api/auth/shoping/status", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id }),
            });
            const data = await res.json();
            if (data.status === "approved") {
              setIsSeller(true);
            }
          } catch (error) {
            console.error("Error checking seller status:", error);
          }
        };
        checkSellerStatus();
    }, [id]);

    console.log('[NAVBAR DEBUG] Current User:', user);
    console.log('[NAVBAR DEBUG] User Role:', user?.role);

    return(
        <>
        <div >
          <header className="header">
            <div className="logo">InstaRy</div>
            <nav className="nav">
              <li><Link href={`/dashboard/${id}`} style={{textDecoration:'none'}}>Home</Link></li>
              {isSeller && (
                <li>
                  <Link href={`/dashboard/${id}/addproduct`} style={{textDecoration:'none', color: '#ff4d4d', fontWeight: 'bold'}}>
                    Add Product
                  </Link>
                </li>
              )}
              {(user?.role?.toLowerCase() === "admin") && (
                <li>
                  <Link href="/admin/verify" style={{textDecoration:'none', color: '#10b981', fontWeight: 'bold'}}>
                    Admin Panel
                  </Link>
                </li>
              )}
            </nav>
                {/* <AddCart/> */}
              <div className="header">
                <div>
                  <Link href={`/dashboard/${id}/profileshop`} style={{textDecoration:'none'}}>
                    <CircleUserRound size={24} />
                  </Link>
                </div>
            </div>
          </header>
          </div>
        </>
    )
}
export default Navbar;