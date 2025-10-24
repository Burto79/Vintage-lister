import { useState, useEffect } from 'react'
import axios from 'axios'

interface ShopListing {
  id: string
  item: {
    id: string
    imagePaths: string[]
    analysis: {
      title: string
      description: string
      era: string
      condition: string
      category: string
      suggestedPrice: {
        recommended: number
      }
      keywords: string[]
    }
  }
  status: string
  postedAt: string
  ebayUrl?: string
  views: number
}

export default function Shop() {
  const [listings, setListings] = useState<ShopListing[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    loadListings()
  }, [])

  const loadListings = async () => {
    try {
      const response = await axios.get('/api/shop/listings')
      setListings(response.data.listings)
    } catch (error) {
      console.error('Failed to load listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredListings = listings.filter(listing => {
    if (filter === 'all') return true
    return listing.item.analysis.category.toLowerCase().includes(filter.toLowerCase())
  })

  if (loading) {
    return (
      <div className="shop-loading">
        <div className="spinner"></div>
        <p>Loading shop...</p>
      </div>
    )
  }

  return (
    <div className="shop-container">
      <div className="shop-header">
        <h1>Vintage Shop</h1>
        <p className="shop-subtitle">Curated vintage finds, AI-analyzed for authenticity</p>

        <div className="shop-filters">
          <button
            className={filter === 'all' ? 'active' : ''}
            onClick={() => setFilter('all')}
          >
            All Items ({listings.length})
          </button>
          <button
            className={filter === 'clothing' ? 'active' : ''}
            onClick={() => setFilter('clothing')}
          >
            Clothing
          </button>
          <button
            className={filter === 'jewelry' ? 'active' : ''}
            onClick={() => setFilter('jewelry')}
          >
            Jewelry
          </button>
          <button
            className={filter === 'accessories' ? 'active' : ''}
            onClick={() => setFilter('accessories')}
          >
            Accessories
          </button>
        </div>
      </div>

      <div className="shop-grid">
        {filteredListings.map(listing => (
          <div key={listing.id} className="shop-item">
            <div className="shop-item-image">
              <img
                src={listing.item.imagePaths[0]}
                alt={listing.item.analysis.title}
              />
              {listing.ebayUrl && (
                <span className="ebay-badge">Also on eBay</span>
              )}
            </div>

            <div className="shop-item-details">
              <div className="shop-item-era">{listing.item.analysis.era}</div>
              <h3 className="shop-item-title">{listing.item.analysis.title}</h3>

              <div className="shop-item-condition">
                Condition: <strong>{listing.item.analysis.condition}</strong>
              </div>

              <div className="shop-item-price">
                ${listing.item.analysis.suggestedPrice.recommended.toFixed(2)}
              </div>

              <div className="shop-item-tags">
                {listing.item.analysis.keywords.slice(0, 3).map((keyword, i) => (
                  <span key={i} className="shop-tag">{keyword}</span>
                ))}
              </div>

              <div className="shop-item-actions">
                <a
                  href={`/shop/${listing.id}`}
                  className="btn-view-details"
                >
                  View Details
                </a>
                {listing.ebayUrl && (
                  <a
                    href={listing.ebayUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn-ebay"
                  >
                    View on eBay
                  </a>
                )}
              </div>

              <div className="shop-item-stats">
                👁️ {listing.views} views
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredListings.length === 0 && (
        <div className="shop-empty">
          <p>No items found in this category.</p>
        </div>
      )}
    </div>
  )
}
