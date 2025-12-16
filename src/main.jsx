import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { registerSW } from 'virtual:pwa-register'

// Register service worker with auto-update
const updateSW = registerSW({
  onNeedRefresh() {
    if (confirm('Ada pembaruan baru tersedia. Muat ulang untuk memperbarui?')) {
      updateSW(true)
    }
  },
  onOfflineReady() {
    console.log('Aplikasi siap untuk mode offline')
  },
  onRegistered(r) {
    console.log('Service Worker terdaftar:', r)
  },
  onRegisterError(error) {
    console.error('Service Worker gagal didaftarkan:', error)
  }
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
