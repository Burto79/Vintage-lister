import { useState, useRef, ChangeEvent } from 'react'
import axios from 'axios'
import { VintageItem } from '../App'

interface ImageUploadProps {
  onAnalysisComplete: (result: VintageItem) => void
  isAnalyzing: boolean
  setIsAnalyzing: (analyzing: boolean) => void
}

export default function ImageUpload({ onAnalysisComplete, isAnalyzing, setIsAnalyzing }: ImageUploadProps) {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([])
  const [previewUrls, setPreviewUrls] = useState<string[]>([])
  const [error, setError] = useState<string>('')
  const [useExtendedThinking, setUseExtendedThinking] = useState(true)
  const [autoPostToEbay, setAutoPostToEbay] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const handleFileSelect = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])

    if (files.length === 0) return

    if (files.length > 10) {
      setError('Maximum 10 images allowed')
      return
    }

    setSelectedFiles(files)
    setError('')

    // Create preview URLs
    const urls = files.map(file => URL.createObjectURL(file))
    setPreviewUrls(urls)
  }

  const handleRemoveImage = (index: number) => {
    const newFiles = selectedFiles.filter((_, i) => i !== index)
    const newUrls = previewUrls.filter((_, i) => i !== index)

    URL.revokeObjectURL(previewUrls[index])

    setSelectedFiles(newFiles)
    setPreviewUrls(newUrls)
  }

  const handleUpload = async () => {
    if (selectedFiles.length === 0) {
      setError('Please select at least one image')
      return
    }

    setIsAnalyzing(true)
    setError('')

    try {
      const formData = new FormData()
      selectedFiles.forEach(file => {
        formData.append('images', file)
      })
      formData.append('extendedThinking', String(useExtendedThinking))
      formData.append('autoPostToEbay', String(autoPostToEbay))

      const response = await axios.post('/api/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      })

      if (response.data.success) {
        onAnalysisComplete(response.data.item)

        // Clear previews
        previewUrls.forEach(url => URL.revokeObjectURL(url))
        setSelectedFiles([])
        setPreviewUrls([])
        if (fileInputRef.current) {
          fileInputRef.current.value = ''
        }
      }
    } catch (err) {
      console.error('Upload error:', err)
      setError(axios.isAxiosError(err)
        ? err.response?.data?.error || 'Failed to analyze images'
        : 'An unexpected error occurred'
      )
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <div className="upload-section">
      <div className="upload-box">
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileSelect}
          disabled={isAnalyzing}
          className="file-input"
          id="file-input"
        />
        <label htmlFor="file-input" className="file-label">
          <div className="upload-icon">📸</div>
          <p>Click to select images or drag and drop</p>
          <p className="upload-hint">Up to 10 images (JPG, PNG, GIF, WebP)</p>
        </label>
      </div>

      {previewUrls.length > 0 && (
        <div className="preview-grid">
          {previewUrls.map((url, index) => (
            <div key={index} className="preview-item">
              <img src={url} alt={`Preview ${index + 1}`} />
              <button
                onClick={() => handleRemoveImage(index)}
                className="remove-btn"
                disabled={isAnalyzing}
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}

      <div className="upload-options">
        <label className="checkbox-label">
          <input
            type="checkbox"
            checked={useExtendedThinking}
            onChange={(e) => setUseExtendedThinking(e.target.checked)}
            disabled={isAnalyzing}
          />
          Use Extended Thinking (better description & valuation)
        </label>

        <label className="checkbox-label auto-post-label">
          <input
            type="checkbox"
            checked={autoPostToEbay}
            onChange={(e) => setAutoPostToEbay(e.target.checked)}
            disabled={isAnalyzing}
          />
          <strong>🚀 Auto-Post to eBay</strong> (immediate listing!)
        </label>
      </div>

      {error && <div className="error-message">{error}</div>}

      <button
        onClick={handleUpload}
        disabled={selectedFiles.length === 0 || isAnalyzing}
        className="analyze-btn"
      >
        {isAnalyzing ? '🧠 Describing & Valuing...' : '💎 Describe & Value Item'}
      </button>
    </div>
  )
}
