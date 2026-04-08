"use client";
import { useSelector, useDispatch } from "react-redux";
import { useProducts } from "@/lib/useProducts";
import { addItem, removeItem } from "@/redux/cartSlice";
import Image from "next/image";

function Dashboard() {
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cart.items);

  const { data, isLoading, error } = useProducts();

  if (isLoading)
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[70vh] space-y-4">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="text-xl font-semibold text-gray-600 tracking-wide animate-pulse">
          Lagse var pan aavse majaaa... 😄
        </p>
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col justify-center items-center h-full min-h-[70vh] space-y-2">
        <div className="text-5xl">⚠️</div>
        <p className="text-red-500 text-xl font-medium">Error loading products...</p>
      </div>
    );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 md:px-8 py-8 pb-24">
      {/* Title */}
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight">
          Discover <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-teal-400">Products</span>
        </h1>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-8">
        {data.map((i) => {
          const isInCart = cartItems.find((item) => item.id === i.id);

          return (
            <div
              key={i.id}
              className="group bg-white rounded-2xl md:rounded-3xl shadow-sm hover:shadow-xl hover:-translate-y-2 transition-all duration-300 overflow-hidden flex flex-col border border-slate-100"
            >
              {/* Image Container */}
              <div className="relative w-full h-36 md:h-56 overflow-hidden bg-slate-50">
                <Image
                  src={i.thumbnail}
                  alt={i.title}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-500 ease-out"
                />

                {/* Brand Badge */}
                {i.brand && (
                  <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold text-slate-800 border border-white/40 shadow-sm">
                    {i.brand}
                  </div>
                )}

                {/* Rating Badge */}
                <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-md px-2 py-1 rounded-full text-xs font-bold text-slate-800 shadow-sm flex items-center gap-1">
                  <span className="text-yellow-400">★</span> {i.rating}
                </div>
              </div>

              {/* Content Context */}
              <div className="p-3 md:p-5 flex flex-col flex-grow">
                <h3 className="font-bold text-sm md:text-lg text-slate-800 line-clamp-1 mb-1">
                  {i.title}
                </h3>

                <p className="text-xs md:text-sm text-slate-500 line-clamp-2 mb-2 md:mb-4 flex-grow">
                  {i.description || "A wonderful product to elevate your daily routine and add more joy to your life."}
                </p>

                <p className="text-lg md:text-2xl font-black text-emerald-600 tracking-tight mb-3 md:mb-5">
                  ${i.price}
                </p>

                {/* Button Base */}
                <div className="mt-auto">
                  {isInCart ? (
                    <button
                      onClick={() => dispatch(removeItem(i))}
                      className="w-full active:scale-95 bg-gradient-to-r from-red-50 to-rose-100 hover:from-red-100 hover:to-rose-200 text-rose-600 font-semibold py-2 md:py-3 text-xs md:text-base rounded-xl md:rounded-2xl transition-all duration-200 border border-red-200 flex items-center justify-center gap-1 md:gap-2 shadow-sm"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                      </svg>
                      Remove
                    </button>
                  ) : (
                    <button
                      onClick={() => dispatch(addItem(i))}
                      className="w-full active:scale-95 bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-semibold py-2 md:py-3 text-xs md:text-base rounded-xl md:rounded-2xl transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-1 md:gap-2"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z" />
                      </svg>
                      Add
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Dashboard;