"use client";
import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import Image from "next/image";
import { searchApi } from "@/handler/SearchApi";

function SearchPage() {

  const [username, setUserName] = useState(""); // set searched after select username
  const [users, setUsers] = useState([]); // store all username which is searched
  const { id } = useParams(); // logged in user id
  const router = useRouter();
  const [pname, setPname] = useState(""); // set logged in username
  const fetchData = async () => {
    try {
      const data = await searchApi(id, username);
      console.log('search data is ', data)
      setUsers(data.users || []); // if user search then store username in array[]
      setPname(data.user.username); // loggen in user name
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    const delay = setTimeout(fetchData);
    return () => clearTimeout(delay);
  }, [username]);

  console.log("pname is", pname);

  const handleProfile = (usernamee) => {
    router.prefetch(`/home/${id}/profile/${usernamee}`);
    if (pname == usernamee) {
      router.push(`/home/${id}/profile`);
    } else {
      router.replace(`/home/${id}/profile/${usernamee}`);
    }
  };

  return (
    <div className="h-screen bg-black text-white">
      {/* search barr */}
      <div className="w-full flex justify-center bg-gray-500">
        <input
          type="text"
          value={username}
          onChange={(e) => setUserName(e.target.value)}
          placeholder="Search users..."
          className="px-3 py-2 rounded-md text-black border-1 bg-white"
        />
      </div>

      {/* listt */}
      <div className="pt-2 px-4">
        {users?.map((user, index) => (
          <div
            key={index}
            onClick={() => handleProfile(user.username)}
            className="flex p-3 rounded-md mb-2 cursor-pointer hover:bg-gray-700"
          >
            <Image src={user?.image} style={{ width: '30px', height: '30px', borderRadius: '50%' }} width={300} height={300} className="mr-3" loading="lazy" alt='image1' />
            {user?.username}
          </div>
        ))}
      </div>
    </div>
  );
}
export default SearchPage;
