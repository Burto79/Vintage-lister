import { useState } from 'react'
import ImageUpload from './components/ImageUpload'
import AnalysisResults from './components/AnalysisResults'
import './App.css'

export interface VintageAnalysis {
  title: string
  description: string
  era: string
  condition: string
  category: string
  brandOrMaker?: string
  suggestedPrice: {
    recommended: number
    low: number
    high: number
    reasoning: string
  }
  keywords: string[]
  flaws?: string[]
  reasoning?: string
}

export interface VintageItem {
  id: string
  imagePaths: string[]
  analysis: VintageAnalysis
  createdAt: Date
}

function App() {
  const [analysisResult, setAnalysisResult] = useState<VintageItem | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="app">
      <header className="header">
        <h1>Vintage Lister</h1>
        <p className="subtitle">AI-Powered Item Description & Valuation with Claude</p>
      </header>

      <main className="main-content">
        <ImageUpload
          onAnalysisComplete={setAnalysisResult}
          isAnalyzing={isAnalyzing}
          setIsAnalyzing={setIsAnalyzing}
        />

        {analysisResult && (
          <AnalysisResults
            item={analysisResult}
            isAnalyzing={isAnalyzing}
          />
        )}
      </main>

      <footer className="footer">
        <p>Powered by Claude Extended Thinking</p>
      </footer>
    </div>
  )
}

export default App
