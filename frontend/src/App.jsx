import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { RequireAuth, RequireAdmin } from './components/ProtectedRoute'

import CustomerLayout from './layouts/CustomerLayout'
import AdminLayout from './layouts/AdminLayout'

import Home from './pages/customer/Home'
import Products from './pages/customer/Products'
import ProductDetail from './pages/customer/ProductDetail'
import Cart from './pages/customer/Cart'
import MyOrders from './pages/customer/MyOrders'
import Login from './pages/customer/Login'
import Register from './pages/customer/Register'
import Profile from './pages/customer/Profile'

import Dashboard from './pages/admin/Dashboard'
import ManageProducts from './pages/admin/ManageProducts'
import ManageCategories from './pages/admin/ManageCategories'
import ManageOrders from './pages/admin/ManageOrders'
import ManageUsers from './pages/admin/ManageUsers'

import './styles/global.css'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Nhóm route phía khách hàng */}
          <Route element={<CustomerLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/products" element={<Products />} />
            <Route path="/products/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route
              path="/orders"
              element={
                <RequireAuth>
                  <MyOrders />
                </RequireAuth>
              }
            />
            <Route
              path="/profile"
              element={
                <RequireAuth>
                  <Profile />
                </RequireAuth>
              }
            />
          </Route>

          {/* Nhóm route phía admin - yêu cầu quyền admin/staff */}
          <Route
            path="/admin"
            element={
              <RequireAdmin>
                <AdminLayout />
              </RequireAdmin>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="products" element={<ManageProducts />} />
            <Route path="categories" element={<ManageCategories />} />
            <Route path="orders" element={<ManageOrders />} />
            <Route path="users" element={<ManageUsers />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App