"use client";
import { useState, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";

function AddPost() {
  const router = useRouter();
  const { id } = useParams();
  const fileInputRef = useRef(null);

  const [caption, setCaption] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [option, setOption] = useState('')

  const handleBack = () => router.back();

  const handleImage = (file) => {
    setImage(file);
    setPreview(URL.createObjectURL(file));
  };

  const handleAdd = async (type) => {
    if (!image) return alert("Please select image");

    const formData = new FormData();
    formData.append("image", image);
    formData.append("caption", caption);
    formData.append('option', type);

    const res = await fetch(`/api/auth/home/${id}/addpost`, {
      method: "POST",
      body: formData
    });

    const data = await res.json();
    if (data.success) router.replace(`/home/${id}`);
    else alert(data.message);
  };

  return (
    <div className="flex flex-col h-full bg-black text-white">

      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-800">
        <button onClick={handleBack} className="text-sm text-gray-400">
          Cancel
        </button>
        <h2 className="font-semibold">New Post</h2>
        <div className="flex gap-5">
          <button onClick={() => handleAdd('post')} className="text-sm font-medium text-blue-500">
            Post
          </button>
          <button onClick={() => handleAdd('story')} className="text-sm font-medium text-blue-500">
            Story
          </button>
        </div>
      </div>

      {/* content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">

        {/* image upload */}
        {!preview ? (
          <label
            onClick={() => fileInputRef.current?.click()}
            className="flex flex-col items-center justify-center border border-gray-700 rounded-xl h-60 cursor-pointer hover:bg-gray-900 transition"
          >
            <p className="text-gray-400">Click to select image</p>
            <input
              type="file"
              style={{ display: 'block', opacity: 0, width: 0, height: 0, position: 'absolute', zIndex: -1 }}
              name='image'
              id="image-upload"
              accept="image/*"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  handleImage(e.target.files[0]);
                }
              }}
              ref={fileInputRef}
            />
          </label>
        ) : (
          <div className="relative w-full aspect-[4/5] rounded-xl overflow-hidden">
            <Image
              src={preview}
              alt="preview"
              fill
              className="object-cover"
            />
          </div>
        )}

        {/* caption part */}
        {preview && (
          <textarea
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="Write a caption..."
            className="w-full bg-gray-900 border border-gray-700 rounded-xl p-3 outline-none resize-none"
            rows={3}
          />
        )}
      </div>
    </div>
  );
}

export default AddPost;