import Image from "next/image";
export const profilePageContent = ({
  status,
  setSelectedPost,
  followers,
  followings,
  fdData,
  username,
  posts,
  friend,
  handleFriendRemove,
  handleAAdd,
  handleMessage,
  handleFollowBack,
  handleFollower,
  handleFollowing,
  bio,
  followersCount,
  followingsCount,
}) => {
  return (
    <>
      <div className="max-w-md m-1 mx-auto min-h-screen rounded-sm border-2 border-black">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b">
          <h1 className="font-bold text-lg">{username}</h1>
          <button className="text-xl">☰</button>
        </div>

        {/* Info */}
        <div className="flex items-center gap-5 p-4">
          {/* Profile image */}
          <div className="w-24 h-24 rounded-full border-2 border-pink-500 p-1">
            {fdData?.image && (
              <Image
                src={fdData.image}
                width={96}
                height={96}
                alt="profile"
                className="w-full h-full rounded-full object-cover"
                priority
              />
            )}
          </div>

          {/* Stats */}
          <div className="flex justify-between flex-1 text-center">
            <div>
              <h2 className="font-semibold">{posts?.length}</h2>
              <p className="text-sm text-gray-500">Posts</p>
            </div>

            <div onClick={handleFollower}>
              <h2 className="font-semibold">{followersCount}</h2>
              <p className="text-sm text-gray-500">Followers</p>
            </div>

            <div onClick={handleFollowing}>
              <h2 className="font-semibold">{followingsCount}</h2>
              <p className="text-sm text-gray-500">Following</p>
            </div>
          </div>
        </div>

        {/* BIO */}
        <div className="px-4">
          <h2 className="font-semibold">{fdData?.name}</h2>
          <p className="text-sm">
            {bio}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="px-4 mt-3">
          {/* if it is friend then show this part */}
          {/* {
            friend ? (
              <div className="flex w-full overflow-hidden gap-1">
                <button
                  onClick={handleFriendRemove}
                  className="w-full border rounded-md py-1.5 font-medium bg-gray-500"
                >
                  Following
                </button>
                <button
                  onClick={handleMessage}
                  className="w-full border rounded-md py-1.5 font-medium bg-gray-500"
                >
                  Message
                </button>
              </div>
            ) 
            : // if it is not a friend then show its part
              status == "requested" ? (
                <button
                  disabled={!following}
                  // onClick={clickFollow}
                  // onClick={handleAAdd}
                  className={`w-full rounded-md py-1.5 font-medium ${
                    following
                      ? "bg-blue-500 text-white"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  requested
                </button>
              ) : (
                <button
                  disabled={!following}
                  // onClick={clickFollow}
                  onClick={handleAAdd}
                  className={`w-full rounded-md py-1.5 font-medium ${
                    following
                      ? "bg-blue-500 text-white"
                      : "bg-gray-400 cursor-not-allowed"
                  }`}
                >
                  Follow
                </button>
              )
          } */}
          {
          friend ? (
            <div className="flex w-full overflow-hidden gap-1">
              <button onClick={handleFriendRemove} className="w-full border rounded-md py-1.5 font-medium bg-gray-500">
                Following
              </button>

              <button onClick={handleMessage} className="w-full border rounded-md py-1.5 font-medium bg-gray-500">
                Message
              </button>
            </div>
          ) : status === "requested" ? (
            <button className="w-full rounded-md py-1.5 font-medium bg-blue-500 text-white">
              Requested
            </button>
          ) : status === "followback" ? (
            <button onClick={handleFollowBack} className="w-full rounded-md py-1.5 font-medium bg-green-500 text-white">
              Follow Back
            </button>
          ) : (
            <button onClick={handleAAdd} className="w-full rounded-md py-1.5 font-medium bg-blue-500 text-white">
              Follow
            </button>
          )}
        </div>

        {/* POSTS SECTION */}
        {friend ? (
          <>
            {/* HIGHLIGHTS */}
            <div className="flex gap-4 px-4 mt-5 overflow-x-auto">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex flex-col items-center">
                  <div className="w-16 h-16 border rounded-full p-1 bg-gray-600"></div>
                  <p className="text-xs mt-1">Story</p>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-1 mt-5">
              {posts?.map((i, index) => (
                <div key={index} className="aspect-square bg-gray-200">
                  {i?.post && (
                    <div
                      key={index}
                      className="aspect-square bg-gray-200 cursor-pointer"
                      onClick={() => setSelectedPost(i)} // CLICK TO ZOOM
                    >
                      <Image
                        src={i?.post}
                        alt="post"
                        width={300}
                        height={300}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="text-center mt-10 text-gray-500">
            <h2 className="font-semibold text-lg">This Account is Private</h2>
            <p className="text-sm mt-1">
              Follow to see their photos and videos.
            </p>
          </div>
        )}
      </div>
    </>
  );
};
