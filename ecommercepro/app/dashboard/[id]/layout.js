import '../../globals.css'
import dynamic from 'next/dynamic';
import HomeBadge from './HomeBadge';
import CartBadge from './CartBadge';

const Navbar = dynamic(() => import('../../../Componants/navbar'), {
  loading: () => <p>Loading....</p>
})

function LayoutDashboard({ children }) {
  return (
    <div className="h-screen overflow-hidden bg-gray-100 flex flex-col relative">
      {/* Floating Home Button */}
      <HomeBadge />
      <CartBadge/>
      {/* Navbar Container - Fixed in flex flow */}
      <div className="z-50 shrink-0 shadow-sm border-b border-gray-200">
        <Navbar />
      </div>
      
      {/* Scrollable Main Area */}
      <main className="flex-1 overflow-y-auto w-full relative">
        {children}
      </main>
    </div>
  );
}

export default LayoutDashboard;