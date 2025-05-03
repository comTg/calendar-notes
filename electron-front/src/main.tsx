import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

import './index.css'

// 暂时注释掉这行，因为它导致了错误
// import './demos/ipc'
// If you want use Node.js, the`nodeIntegration` needs to be enabled in the Main process.
// import './demos/node'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)

postMessage({ payload: 'removeLoading' }, '*')
