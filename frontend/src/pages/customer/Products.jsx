import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import ProductCard from '../../components/ProductCard'
import { getProducts } from '../../services/productService'
import { getCategories } from '../../services/categoryService'

export default function Products() {
  const [searchParams] = useSearchParams()
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [categoryId, setCategoryId] = useState(searchParams.get('category') || '')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Nếu người dùng vào lại từ link có ?category=..., cập nhật lại filter
  useEffect(() => {
    const paramCategory = searchParams.get('category') || ''
    setCategoryId(paramCategory)
  }, [searchParams])

  // Debounce ô tìm kiếm 400ms để tránh gọi API liên tục khi gõ
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch(() => {})
  }, [])

  useEffect(() => {
    setLoading(true)
    setError(null)
    getProducts({ category_id: categoryId || undefined, search: debouncedSearch || undefined })
      .then(setProducts)
      .catch(() => setError('Không tải được danh sách sản phẩm. Kiểm tra backend đã chạy chưa.'))
      .finally(() => setLoading(false))
  }, [categoryId, debouncedSearch])

  const sortedProducts = useMemo(() => {
    const list = [...products]
    switch (sortBy) {
      case 'price-asc':
        return list.sort((a, b) => a.rental_price_per_day - b.rental_price_per_day)
      case 'price-desc':
        return list.sort((a, b) => b.rental_price_per_day - a.rental_price_per_day)
      case 'name-asc':
        return list.sort((a, b) => a.name.localeCompare(b.name))
      default:
        return list
    }
  }, [products, sortBy])

  const selectedCategoryName = categories.find((c) => String(c.id) === String(categoryId))?.name
  const hasActiveFilters = categoryId || search

  function handleClearFilters() {
    setSearch('')
    setCategoryId('')
    setSortBy('newest')
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1>Danh sách thiết bị</h1>
        <p className="products-subtitle">
          Đầy đủ lều trại, túi ngủ, bếp gas, đèn chiếu sáng, balo... cho chuyến đi của bạn
        </p>
      </div>

      <div className="products-filter">
        <div className="search-box">
          <span className="search-icon">🔍</span>
          <input
            type="text"
            placeholder="Tìm kiếm thiết bị..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <select value={categoryId} onChange={(e) => setCategoryId(e.target.value)}>
          <option value="">Tất cả danh mục</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
          <option value="newest">Mới nhất</option>
          <option value="price-asc">Giá: thấp đến cao</option>
          <option value="price-desc">Giá: cao đến thấp</option>
          <option value="name-asc">Tên: A-Z</option>
        </select>

        {hasActiveFilters && (
          <button className="btn-clear-filter" onClick={handleClearFilters}>
            ✕ Xóa bộ lọc
          </button>
        )}
      </div>

      {!loading && !error && (
        <p className="products-result-count">
          {sortedProducts.length > 0
            ? `${sortedProducts.length} thiết bị${selectedCategoryName ? ` trong "${selectedCategoryName}"` : ''}`
            : null}
        </p>
      )}

      {loading && (
        <div className="products-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div className="product-card-skeleton" key={i}>
              <div className="skeleton-img" />
              <div className="skeleton-line skeleton-line-title" />
              <div className="skeleton-line skeleton-line-price" />
            </div>
          ))}
        </div>
      )}

      {error && (
        <div className="products-error-box">
          <span className="error-icon">⚠️</span>
          <p>{error}</p>
          <button className="btn-primary" onClick={() => window.location.reload()}>
            Thử lại
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          {sortedProducts.length > 0 ? (
            <div className="products-grid">
              {sortedProducts.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="products-empty-state">
              <span className="empty-icon">🏕️</span>
              <h3>Không tìm thấy thiết bị nào</h3>
              <p>Thử đổi từ khóa tìm kiếm hoặc chọn danh mục khác xem sao.</p>
              {hasActiveFilters && (
                <button className="btn-primary" onClick={handleClearFilters}>
                  Xóa bộ lọc
                </button>
              )}
            </div>
          )}
        </>
      )}
    </div>
  )
}