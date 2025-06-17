import { useState, useEffect, useRef } from 'react'
import { Mic, MicOff, X, Volume2, Search, Sparkles } from 'lucide-react'
import './VoiceSearch.css'

const VoiceSearch = ({ isOpen, onClose, onSearch }) => {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef(null)
  const examples = [
    "Show me action movies",
    "I want to watch something funny", 
    "Find romantic comedies",
    "Search for Stranger Things",
    "I'm in the mood for thriller",
    "Show me movies with Tom Hanks",
    "Find something to watch tonight",
    "Show me horror movies from 2023"
  ]
    useEffect(() => {
    if (!isOpen) {
      // Reset all state when closing
      stopListening()
      setTranscript('')
      setIsProcessing(false)
    } else {
      // Reset state when opening and auto-start listening
      setTranscript('')
      setIsProcessing(false)
      setTimeout(() => startListening(), 500)
    }
  }, [isOpen])

  useEffect(() => {
    // Initialize speech recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.lang = 'en-US'
      recognitionRef.current.continuous = false
      recognitionRef.current.interimResults = true
        recognitionRef.current.onresult = (event) => {
        const current = event.resultIndex
        const transcript = event.results[current][0].transcript
        console.log('🎤 Voice Recognition - Raw transcript:', transcript)
        console.log('🎤 Voice Recognition - Is final:', event.results[current].isFinal)
        setTranscript(transcript)
        
        if (event.results[current].isFinal) {
          console.log('🎤 Voice Recognition - Final transcript captured:', transcript)
          setIsListening(false)
          processVoiceInput(transcript)
        }
      }
        recognitionRef.current.onend = () => {
        console.log('🎤 Voice Recognition - Session ended')
        setIsListening(false)
      }
      
      recognitionRef.current.onerror = (event) => {
        console.error('🎤 Voice Recognition - Error occurred:', event.error)
        console.error('🎤 Voice Recognition - Error details:', event)
        setIsListening(false)
      }
    }
    
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [])
  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      console.log('🎤 Voice Recognition - Starting to listen...')
      setTranscript('')
      setIsListening(true)
      recognitionRef.current.start()
    }
  }

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      console.log('🎤 Voice Recognition - Stopping listening...')
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }
  const processVoiceInput = async (input) => {
    if (!input.trim()) {
      console.log('🎤 Voice Input - Empty input, skipping processing')
      return
    }
    
    console.log('🔄 Processing Voice Input - Starting with:', input)
    setIsProcessing(true)
    try {
      // Just call the onSearch callback - the App component will handle the rest
      console.log('🔄 Processing Voice Input - Calling onSearch callback...')
      await onSearch(input)
      console.log('🔄 Processing Voice Input - onSearch callback completed')
    } catch (error) {
      console.error('🔄 Processing Voice Input - Error occurred:', error)
    } finally {
      setIsProcessing(false)
      console.log('🔄 Processing Voice Input - Process completed')
    }
  }
  const handleExampleClick = (example) => {
    setTranscript(example)
    processVoiceInput(example)
  }

  if (!isOpen) return null
  return (
    <div className={`voice-search-fullscreen ${isOpen ? 'open' : ''}`}>
      <div className="voice-search-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
      </div>
      
      <div className="voice-search-container">        {/* Header */}
        <div className="voice-header">
          <div className="voice-logo">
            <Sparkles size={24} />
            <span>Voice Search</span>
          </div>
          <button className="voice-close-btn" onClick={onClose}>
            <X size={24} />
          </button>
        </div>        {/* Main Content */}
        <div className="voice-main-content">
          {/* Voice Search Interface */}
          <div className="voice-interface">
              {!transcript && !isListening && !isProcessing && (
                <div className="voice-initial-state">
                  <div className="voice-center">
                    <div className="voice-orb-container">
                      <div className="voice-orb">
                        <div className="orb-inner">
                          <Mic size={32} />
                        </div>
                      </div>
                    </div>
                    <h1 className="voice-title">Speak Now</h1>
                    <p className="voice-subtitle">Ask me anything about movies and TV shows</p>
                  </div>

                  <div className="voice-examples">
                    <h3>Try saying:</h3>
                    <div className="examples-grid">
                      {examples.map((example, index) => (
                        <button
                          key={index}
                          className="example-chip"
                          onClick={() => handleExampleClick(example)}
                        >
                          <Volume2 size={14} />
                          {example}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {isListening && (
                <div className="voice-listening-state">
                  <div className="listening-center">
                    <div className="listening-orb-container">
                      <div className="listening-orb">
                        <div className="pulse-wave pulse-1"></div>
                        <div className="pulse-wave pulse-2"></div>
                        <div className="pulse-wave pulse-3"></div>
                        <div className="pulse-wave pulse-4"></div>
                        <div className="orb-core">
                          <Mic size={32} />
                        </div>
                      </div>
                    </div>
                    <h1 className="listening-title">Listening...</h1>
                    <p className="listening-subtitle">I'm ready to help you find something great to watch</p>
                    <div className="waveform">
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                      <div className="wave-bar"></div>
                    </div>
                  </div>
                </div>
              )}

              {transcript && !isProcessing && (
                <div className="voice-transcript-state">
                  <div className="transcript-center">
                    <div className="transcript-orb">
                      <Search size={32} />
                    </div>
                    <h1 className="transcript-title">Got it!</h1>
                    <div className="transcript-bubble">
                      <p>"{transcript}"</p>
                    </div>
                    <button className="retry-btn" onClick={startListening}>
                      <Mic size={16} />
                      Try Again
                    </button>
                  </div>
                </div>
              )}

              {isProcessing && (
                <div className="voice-processing-state">
                  <div className="processing-center">
                    <div className="processing-orb">
                      <div className="processing-spinner">
                        <Sparkles size={32} />
                      </div>
                    </div>
                    <h1 className="processing-title">Finding Results...</h1>
                    <p className="processing-subtitle">Searching through thousands of movies and shows</p>
                    <div className="progress-dots">
                      <div className="dot"></div>                      <div className="dot"></div>
                      <div className="dot"></div>
                    </div>
                  </div>
                </div>
              )}
            </div>
        </div>

        {/* Footer Controls */}
        <div className="voice-footer">            <button
              className={`main-voice-btn ${isListening ? 'listening' : ''}`}
              onClick={isListening ? stopListening : startListening}
              disabled={isProcessing}
            >
              {isListening ? <MicOff size={20} /> : <Mic size={20} />}
              {isListening ? 'Stop Listening' : 'Start Voice Search'}
            </button>
          </div>
      </div>
    </div>
  )
}

export default VoiceSearch
