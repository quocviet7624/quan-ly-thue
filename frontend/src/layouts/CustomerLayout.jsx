import { Outlet } from 'react-router-dom'
import Navbar from '../components/Navbar'
import Footer from '../components/Footer'

export default function CustomerLayout() {
  return (
    <div className="customer-layout">
      <Navbar />
      <main className="customer-content">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}