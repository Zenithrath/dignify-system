import React, { useRef, useEffect, useState } from 'react'
import * as Icons from 'lucide-react'

export default function FilterTabs({ tabs, active, onChange, counts, showSettings, onSettings }) {
  const containerRef = useRef(null)
  const tabRefs = useRef({})
  const [indicator, setIndicator] = useState({ left: 0, width: 0 })

  useEffect(() => {
    const el = tabRefs.current[active]
    const container = containerRef.current
    if (el && container) {
      const cRect = container.getBoundingClientRect()
      const tRect = el.getBoundingClientRect()
      setIndicator({
        left: tRect.left - cRect.left,
        width: tRect.width
      })
    }
  }, [active])

  return (
    <div className="flex items-center gap-1 my-2.5 overflow-x-auto pb-1 scrollbar-none">
      <div ref={containerRef} className="relative flex items-center gap-1">
        {/* Sliding background indicator */}
        <div
          className="absolute top-0 h-8 rounded-full pointer-events-none"
          style={{
            left: indicator.left,
            width: indicator.width,
            background: 'radial-gradient(circle at 18% 18%, #165b38 0%, #0a331f 35%, #051d11 70%, #020d07 100%)',
            boxShadow: 'inset 1px 1.5px 2px rgba(255,255,255,0.45), inset -2px -2px 4px rgba(0,0,0,0.9), 0 3px 8px rgba(0,0,0,0.4)',
            border: '1px solid rgba(0,0,0,0.7)',
            transition: 'left 0.3s cubic-bezier(0.4, 0, 0.2, 1), width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
            zIndex: 0
          }}
        >
          {/* Specular highlight */}
          <div
            className="absolute rounded-full pointer-events-none"
            style={{
              top: 2, left: 6,
              width: active ? '55%' : '40%',
              height: active ? '55%' : '45%',
              background: 'radial-gradient(ellipse at center, rgba(255,255,255,0.28) 0%, transparent 75%)',
              transition: 'all 0.3s ease'
            }}
          />
        </div>

        {/* Tab buttons */}
        {tabs.map((t) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              ref={(el) => { tabRefs.current[t.key] = el }}
              onClick={() => onChange(t.key)}
              className={`relative z-10 shrink-0 h-8 rounded-full text-[11px] font-semibold flex items-center cursor-pointer select-none border border-transparent transition-colors duration-200 ${
                isActive ? 'text-white' : 'text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-slate-200'
              }`}
              style={{ paddingLeft: isActive ? 14 : 12, paddingRight: 4, gap: 4 }}
            >
              <span>{t.label}</span>
              {counts && counts[t.key] !== undefined && (
                <span
                  className={`text-[10px] font-black rounded-full h-5 min-w-[20px] flex items-center justify-center px-1.5 transition-all duration-200 ${
                    isActive ? '' : 'bg-gray-100 dark:bg-white/10 text-gray-400 dark:text-slate-500'
                  }`}
                  style={isActive ? {
                    background: 'radial-gradient(circle at 30% 25%, #ffffff 0%, #edf0e6 60%, #c8cebe 100%)',
                    boxShadow: 'inset 1px 1px 1.5px rgba(255,255,255,1), inset -1px -1px 2px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.5)',
                    color: '#0f1d15',
                    border: '1px solid rgba(0,0,0,0.25)'
                  } : {}}
                >
                  {counts[t.key]}
                </span>
              )}
            </button>
          )
        })}
      </div>
      {showSettings && (
        <button onClick={onSettings} className="shrink-0 p-1.5 rounded-lg text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-white/5 transition ml-1">
          <Icons.SlidersHorizontal size={14} />
        </button>
      )}
    </div>
  )
}
