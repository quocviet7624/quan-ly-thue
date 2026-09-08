import { useEffect, useState } from 'react'
import ProductCard from '../../components/ProductCard'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'

export default function Products() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getCategories().then(setCategories).catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProducts({ category_id: categoryId || undefined, search: search || undefined })
      .then(setProducts)
      .catch(() => setError('Không tải được danh sách sản phẩm. Kiểm tra backend đã chạy chưa.'))
      .finally(() => setLoading(false))
  }, [categoryId, search])

  return (
    <div className="products-page">
      <h1>Danh sách thiết bị</h1>

      <div className="products-filter">
        <input
          type="text"
          placeholder="Tìm kiếm thiết bị..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      {loading && <p>Đang tải...</p>}
      {error && <p className="error-text">{error}</p>}

      <div className="products-grid">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
        {!loading && !error && products.length === 0 && <p>Không có sản phẩm nào.</p>}
      </div>
    </div>
  )
}