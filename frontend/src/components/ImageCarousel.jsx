import { useState } from 'react'
import { resolveImageUrl } from '../utils/imageUrl'

export default function ImageCarousel({ images = [], fallback, alt = '', className = '' }) {
  const [index, setIndex] = useState(0)

  const list = images && images.length > 0 ? images : fallback ? [fallback] : []

  function prev(e) {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i === 0 ? list.length - 1 : i - 1))
  }

  function next(e) {
    e.preventDefault()
    e.stopPropagation()
    setIndex((i) => (i === list.length - 1 ? 0 : i + 1))
  }

  if (list.length === 0) {
    return (
      <div className={`image-carousel ${className}`}>
        <img src="https://placehold.co/300x220?text=No+Image" alt={alt} />
      </div>
    )
  }

  return (
    <div className={`image-carousel ${className}`}>
      <img src={resolveImageUrl(list[index])} alt={alt} />

      {list.length > 1 && (
        <>
          <button type="button" className="carousel-nav carousel-nav-prev" onClick={prev} aria-label="Ảnh trước">
            ‹
          </button>
          <button type="button" className="carousel-nav carousel-nav-next" onClick={next} aria-label="Ảnh sau">
            ›
          </button>
          <div className="carousel-dots-mini">
            {list.map((_, i) => (
              <span
                key={i}
                className={`carousel-dot-mini ${i === index ? 'carousel-dot-mini-active' : ''}`}
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  setIndex(i)
                }}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}