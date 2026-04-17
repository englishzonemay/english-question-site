import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import './styles.css'

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }
  static getDerivedStateFromError(error) {
    return { error }
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 40, fontFamily: 'sans-serif' }}>
          <h1 style={{ color: '#C26A60' }}>오류가 발생했습니다</h1>
          <pre style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 8, overflow: 'auto', fontSize: 13 }}>
            {this.state.error.message}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
          <button onClick={() => { localStorage.clear(); window.location.reload() }}
            style={{ marginTop: 16, padding: '10px 20px', background: '#C26A60', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>
            데이터 초기화 후 새로고침
          </button>
        </div>
      )
    }
    return this.props.children
  }
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>,
)
