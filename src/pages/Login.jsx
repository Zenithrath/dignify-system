import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../lib/store'

const DEMOS = [
  { email: 'admin@dignify.id', role: 'ADMIN', label: 'Administrator — full business view' },
  { email: 'pm@dignify.id', role: 'PM', label: 'Project Manager — ops & team' },
  { email: 'ignas@dignify.id', role: 'STAFF', label: 'Staff — personal workspace' }
]

export default function Login() {
  const { login } = useStore()
  const nav = useNavigate()
  const [email, setEmail] = useState('admin@dignify.id')
  const [password, setPassword] = useState('dignify123')
  const [err, setErr] = useState('')

  const submit = (e) => {
    e.preventDefault()
    const r = login(email, password)
    if (r.error) setErr(r.error)
    else nav('/crm')
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="flex items-center justify-center p-6 sm:p-12">
        <form onSubmit={submit} className="w-full max-w-md anim-fadeUp">
          <div className="flex items-center gap-2.5 mb-8">
            <span className="w-10 h-10 rounded-2xl bg-gradient-to-br from-brand-500 to-brand-800 text-white flex items-center justify-center font-display font-extrabold text-lg">D</span>
            <span className="font-display font-extrabold text-xl tracking-tight">DIGNIFY OS</span>
          </div>
          <h1 className="font-display text-2xl sm:text-3xl font-extrabold tracking-tight">Welcome back.</h1>
          <p className="text-ink-500 text-sm mt-1.5 mb-6">Sign in to your role-based workspace. LEAD → CLIENT → PROJECT → CASH.</p>
          {err && <div className="mb-4 text-sm font-semibold bg-red-50 border border-red-200 text-red-700 rounded-xl px-3.5 py-2.5">{err}</div>}
          <label className="label">Work email</label>
          <input className="input mb-4" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />
          <label className="label">Password</label>
          <input className="input" type="password" value={password} onChange={(e) => setPassword(e.target.value)} autoComplete="current-password" />
          <button className="btn-primary w-full mt-5 !py-3">Sign in →</button>
          <div className="mt-6 space-y-2">
            <p className="label !mb-1">One-click demo (password: dignify123)</p>
            {DEMOS.map((d) => (
              <button type="button" key={d.email} onClick={() => { setEmail(d.email); setPassword('dignify123'); setErr('') }} className="w-full text-left card card-pad !p-3 flex items-center justify-between hover:border-brand-400 transition">
                <span><span className="block text-sm font-bold">{d.role} · {d.email}</span><span className="block text-xs text-ink-500">{d.label}</span></span>
                <span className="text-brand-700 font-bold">→</span>
              </button>
            ))}
          </div>
        </form>
      </div>
      <div className="hidden lg:flex relative overflow-hidden bg-gradient-to-br from-brand-800 via-brand-900 to-ink-900 text-white p-12 flex-col justify-between">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-brand-500/20 blur-3xl" />
        <div className="relative text-sm font-semibold text-brand-200">● INTERNAL BUSINESS OPERATING SYSTEM</div>
        <div className="relative">
          <h2 className="font-display text-4xl font-extrabold leading-tight">The whole agency,<br />one calm workspace.</h2>
          <div className="grid grid-cols-2 gap-3 mt-8 max-w-md">
            {[['884+', 'leads in pipeline'], ['60%', 'avg. project progress'], ['Rp24.8jt', 'pipeline value'], ['100%', 'RBAC enforced']].map(([v, l]) => (
              <div key={l} className="rounded-2xl bg-white/10 border border-white/15 p-4"><p className="font-display text-2xl font-extrabold">{v}</p><p className="text-xs text-brand-200">{l}</p></div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-2 text-xs text-brand-200">
            {['LEAD', 'CLIENT', 'PROJECT', 'TASK', 'DELIVERY', 'PAYMENT'].map((s, i) => (
              <span key={s} className="flex items-center gap-2">{i > 0 && <span>→</span>}<span className="font-bold text-white">{s}</span></span>
            ))}
          </div>
        </div>
        <p className="relative text-xs text-brand-300">Google Sheets stays the database · Apps Script runs automation · This app is the interface.</p>
      </div>
    </div>
  )
}
