import { VintageItem } from '../App'

interface AnalysisResultsProps {
  item: VintageItem
  isAnalyzing: boolean
}

export default function AnalysisResults({ item, isAnalyzing }: AnalysisResultsProps) {
  const { analysis, imagePaths } = item

  if (isAnalyzing) {
    return (
      <div className="results-section loading">
        <div className="spinner"></div>
        <p>Analyzing your vintage item with Claude Extended Thinking...</p>
      </div>
    )
  }

  return (
    <div className="results-section">
      <h2 className="results-title">Analysis Results</h2>

      <div className="results-grid">
        {/* Images */}
        <div className="results-images">
          <div className="image-carousel">
            {imagePaths.map((path, index) => (
              <img
                key={index}
                src={path}
                alt={`Item ${index + 1}`}
                className="result-image"
              />
            ))}
          </div>
        </div>

        {/* Details */}
        <div className="results-details">
          <div className="detail-card">
            <h3 className="detail-label">Title</h3>
            <p className="detail-value title-value">{analysis.title}</p>
          </div>

          <div className="detail-row">
            <div className="detail-card">
              <h3 className="detail-label">Era</h3>
              <p className="detail-value">{analysis.era}</p>
            </div>

            <div className="detail-card">
              <h3 className="detail-label">Condition</h3>
              <p className="detail-value">{analysis.condition}</p>
            </div>

            <div className="detail-card">
              <h3 className="detail-label">Category</h3>
              <p className="detail-value">{analysis.category}</p>
            </div>
          </div>

          {analysis.brandOrMaker && (
            <div className="detail-card">
              <h3 className="detail-label">Brand/Maker</h3>
              <p className="detail-value">{analysis.brandOrMaker}</p>
            </div>
          )}

          {/* Pricing */}
          <div className="detail-card price-card">
            <h3 className="detail-label">Suggested Price</h3>
            <div className="price-info">
              <div className="price-recommended">
                ${analysis.suggestedPrice.recommended}
              </div>
              <div className="price-range">
                Range: ${analysis.suggestedPrice.low} - ${analysis.suggestedPrice.high}
              </div>
              <p className="price-reasoning">{analysis.suggestedPrice.reasoning}</p>
            </div>
          </div>

          {/* Keywords */}
          <div className="detail-card">
            <h3 className="detail-label">Keywords</h3>
            <div className="keywords">
              {analysis.keywords.map((keyword, index) => (
                <span key={index} className="keyword-tag">
                  {keyword}
                </span>
              ))}
            </div>
          </div>

          {/* Flaws */}
          {analysis.flaws && analysis.flaws.length > 0 && (
            <div className="detail-card flaws-card">
              <h3 className="detail-label">⚠️ Noted Flaws</h3>
              <ul className="flaws-list">
                {analysis.flaws.map((flaw, index) => (
                  <li key={index}>{flaw}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Description */}
          <div className="detail-card">
            <h3 className="detail-label">Description</h3>
            <p className="description-text">{analysis.description}</p>
          </div>

          {/* Extended Thinking */}
          {analysis.reasoning && (
            <div className="detail-card reasoning-card">
              <h3 className="detail-label">🧠 Extended Thinking Summary</h3>
              <p className="reasoning-text">
                {analysis.reasoning.substring(0, 500)}...
              </p>
              <details className="reasoning-full">
                <summary>Show full reasoning</summary>
                <p className="reasoning-text">{analysis.reasoning}</p>
              </details>
            </div>
          )}

          {/* Actions */}
          <div className="action-buttons">
            <button className="action-btn primary">
              📤 Post to eBay
            </button>
            <button className="action-btn secondary">
              📋 Copy Listing
            </button>
            <button className="action-btn secondary">
              💾 Save Draft
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
