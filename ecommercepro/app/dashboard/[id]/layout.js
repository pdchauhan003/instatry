import '../../globals.css'
import dynamic from 'next/dynamic';

const Navbar = dynamic(() => import('../../../Componants/navbar'), {
  loading: () => <p>Loading....</p>
})

function LayoutDashboard({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Navbar />

      {/* Scrollable content area */}
      <main className="flex-1 overflow-y-auto p-4">
        {children}
      </main>
    </div>
  );
}

export default LayoutDashboard;