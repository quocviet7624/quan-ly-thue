import { useEffect, useState } from 'react'
import { getProducts, deleteProduct } from '../../services/productService'

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  function loadProducts() {
    setLoading(true)
    getProducts()
      .then(setProducts)
      .catch(() => setProducts([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadProducts()
  }, [])

  async function handleDelete(id) {
    if (!confirm('Xóa sản phẩm này?')) return
    await deleteProduct(id)
    loadProducts()
  }

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <h1>Quản lý sản phẩm</h1>
        <button className="btn-primary">+ Thêm sản phẩm</button>
      </div>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên sản phẩm</th>
              <th>Giá/ngày</th>
              <th>Tiền cọc</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td>{p.id}</td>
                <td>{p.name}</td>
                <td>{Number(p.rental_price_per_day).toLocaleString('vi-VN')} đ</td>
                <td>{Number(p.deposit_amount).toLocaleString('vi-VN')} đ</td>
                <td>{p.status}</td>
                <td>
                  <button>Sửa</button>
                  <button onClick={() => handleDelete(p.id)}>Xóa</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan="6">Chưa có sản phẩm nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}