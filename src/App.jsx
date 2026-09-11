import React from 'react'
import { Navigate, Route, Routes } from 'react-router-dom'
import Login from './pages/Login'
import CrmPage from './pages/crm'
import { useStore } from './lib/store'

function Guard({ children }) {
  const { me } = useStore()
  if (!me) return <Navigate to="/login" replace />
  return children
}

export default function App() {
  const { toasts } = useStore()
  return (
    <>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/crm/*" element={<Guard><CrmPage /></Guard>} />
        <Route path="*" element={<Navigate to="/crm" replace />} />
      </Routes>
      <div className="fixed bottom-20 lg:bottom-6 right-4 z-50 space-y-2 max-w-xs">
        {toasts.map((t) => (
          <div key={t.id} className={`rounded-2xl px-4 py-3 text-sm font-semibold shadow-pop border anim-fadeUp ${t.kind === 'err' ? 'bg-red-600 text-white border-red-600' : 'bg-ink-900 text-white border-ink-900 dark:bg-white dark:text-ink-900 dark:border-white'}`}>{t.msg}</div>
        ))}
      </div>
    </>
  )
}
