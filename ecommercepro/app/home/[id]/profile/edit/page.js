'use client'

import { useParams } from "next/navigation"
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { useReducer, useEffect, useRef } from "react";

const userDatas = {
  image: '',
  name: '',
  username: '',
  bio: '',
}
const reducer = (state, action) => {
  if (action.type === "SET_ALL") {
    return { ...state, ...action.value };
  }
  return { ...state, [action.type]: action.value };
};
function EditPage() {

  const { id } = useParams();
  const [state, dispatch] = useReducer(reducer, userDatas)
  const fileInputRef = useRef(null);

  const fetchData = async () => {
    const res = await fetch(`/api/auth/home/${id}/edit`, {
      method: 'GET',
    })
    const data = await res.json();
    return data
  }
  const { data: userData = {}, isLoading, isError } = useQuery({
    queryKey: ['userData', id],
    queryFn: fetchData,
  })

  useEffect(() => {
    if (userData?.userNameAndImage) {
      dispatch({
        type: "SET_ALL",
        value: {
          image: userData.userNameAndImage.image || '',
          name: userData.name.name || '',
          username: userData.userNameAndImage.username || '',
          bio: userData.userNameAndImage.bio || '',
        },
      });
    }
  }, [userData]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();

    const finalData = {
      image: state.image || userData?.userNameAndImage?.image,
      name: state.name || userData?.name?.name,
      username: state.username || userData?.userNameAndImage?.username,
      bio: state.bio || userData?.bio?.bio,
    };

    formData.append('name', finalData.name)
    formData.append('username', finalData.username)
    formData.append('bio', finalData.bio)
    if (state.image instanceof File) {
      formData.append('image', state.image);
    }

    const res = await fetch(`/api/auth/home/${id}/edit`, {
      method: 'PUT',
      body: formData
    })
    const data = await res.json();
    if (data.success) {
      console.log('updated success');
      alert('updated success')
    }
    else {
      console.log('else exists')
    }
  }

  console.log('user data is editt', userData)
  return (
    <>
      <div className="text-center justify-center">
        <form className="py-5 px-10" onSubmit={handleSubmit}>
          {userData?.userNameAndImage?.image && (
            <Image src={userData?.userNameAndImage?.image} className="mx-auto rounded-full h-30 w-30" width={200} height={200} alt="images" />
          )}
          <br />
          <input
            type="file"
            id="image-upload"
            accept="image/*"
            className="hidden"
            ref={fileInputRef}
            onChange={(e) =>
              dispatch({ value: e.target.files?.[0], type: e.target.name })
            }
          />
          <label
            htmlFor="image-upload"
            onClick={() => fileInputRef.current?.click()}
            className="inline-block px-4 py-1 mt-2 text-sm text-blue-500 font-medium cursor-pointer active:opacity-50"
          >
            Change profile picture
          </label>
          <input type="text" value={state.name} className="border-2 border-white my-2 w-full rounded-sm p-3" placeholder="Name" name="name" onChange={(e) => dispatch({ value: e.target.value, type: e.target.name })} />
          <br />
          <input type="text" value={state.username} className="border-2 border-white my-2 w-full rounded-sm p-3" placeholder="username" name="username" onChange={(e) => dispatch({ value: e.target.value, type: e.target.name })} />
          <br />
          <input type="text" value={state.bio} className="border-2 border-white my-2 w-full rounded-sm p-3" placeholder="Bio" name='bio' onChange={(e) => dispatch({ value: e.target.value, type: e.target.name })} />
          <br />
          <input type="submit" className="px-10 rounded-sm border-2 border-blue-500" />
        </form>
      </div>
    </>
  )
}
export default EditPage