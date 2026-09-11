import React, { useMemo, useState } from 'react'
import { useStore } from '../lib/store'
import { Badge, Card, Field, Modal } from '../components/ui'
import { IDR, fmtDate } from '../lib/format'

export default function Finance() {
  const { db, api, canDo } = useStore()
  const [pay, setPay] = useState(null)
  const [amt, setAmt] = useState(0)
  const [inv, setInv] = useState(null)
  const readOnly = !canDo('finance.view')

  const s = useMemo(() => ({
    revenue: db.invoices.reduce((a, i) => a + Number(i.paid || 0), 0),
    billed: db.invoices.reduce((a, i) => a + Number(i.amount || 0), 0),
    expenses: db.expenses.reduce((a, e) => a + Number(e.amount || 0), 0)
  }), [db])
  s.outstanding = s.billed - s.revenue
  s.profit = s.revenue - s.expenses

  if (readOnly) return <Card className="card-pad"><p className="font-bold">Restricted</p><p className="text-sm text-ink-500">Finance is visible to Administrator and Project Manager only.</p></Card>

  return (
    <div className="space-y-4 anim-fadeUp">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div><h1 className="font-display text-xl sm:text-2xl font-extrabold tracking-tight">Finance</h1><p className="text-sm text-ink-500">Agency finance — DP, final payments, expenses. Not a full ERP.</p></div>
        {canDo('finance.manage') && <button className="btn-primary" onClick={() => setInv({ no: `INV-${String(db.invoices.length + 26).padStart(3, '0')}`, clientId: db.clients[0]?.id || '', projectId: db.projects[0]?.id || '', amount: 2500000, paid: 0, status: 'DRAFT', due: '', date: new Date().toISOString().slice(0, 10), note: '' })}>+ New invoice</button>}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[['Revenue (paid)', IDR(s.revenue)], ['Outstanding', IDR(s.outstanding)], ['Expenses', IDR(s.expenses)], ['Est. profit', IDR(s.profit)]].map(([l, v]) => (
          <Card key={l} className="card-pad"><p className="kpi-label">{l}</p><p className="font-display text-xl font-extrabold mt-1">{v}</p></Card>
        ))}
      </div>
      <Card className="overflow-hidden">
        <div className="px-4 pt-4"><h3 className="section-title">Invoices</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[680px]">
            <thead className="bg-ink-50/70"><tr><th className="th">Invoice</th><th className="th">Client</th><th className="th">Amount</th><th className="th">Paid</th><th className="th">Due</th><th className="th">Status</th><th className="th text-right">Pay</th></tr></thead>
            <tbody className="divide-y divide-ink-100">
              {db.invoices.map((i) => (
                <tr key={i.id} className="hover:bg-ink-50/50">
                  <td className="td font-bold">{i.no}<span className="block text-xs font-normal text-ink-500">{fmtDate(i.date)}</span></td>
                  <td className="td text-xs">{db.clients.find((c) => c.id === i.clientId)?.company}</td>
                  <td className="td text-sm font-bold">{IDR(i.amount)}</td>
                  <td className="td text-sm">{IDR(i.paid)}</td>
                  <td className="td text-xs">{fmtDate(i.due)}</td>
                  <td className="td"><Badge value={i.status} /></td>
                  <td className="td text-right">{canDo('finance.manage') && i.status !== 'PAID' && <button className="btn-secondary !py-1.5 !text-xs" onClick={() => { setPay(i); setAmt(Number(i.amount) - Number(i.paid)) }}>Record</button>}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
      <Card className="card-pad">
        <h3 className="section-title mb-2">Expenses</h3>
        {db.expenses.map((e) => <div key={e.id} className="flex justify-between text-sm py-1.5 border-b border-ink-100 last:border-0"><span>{e.title} <span className="text-xs text-ink-500">· {e.date}</span></span><b>{IDR(e.amount)}</b></div>)}
      </Card>
      <Modal open={!!pay} onClose={() => setPay(null)} title={`Record payment — ${pay?.no}`}>
        <Field label="Amount (Rp)"><input className="input" type="number" value={amt} onChange={(e) => setAmt(Number(e.target.value))} /></Field>
        <div className="flex justify-end gap-2 mt-3"><button className="btn-secondary" onClick={() => setPay(null)}>Cancel</button><button className="btn-primary" onClick={() => { api.recordPayment(pay.id, amt); setPay(null) }}>Confirm</button></div>
      </Modal>
      <Modal open={!!inv} onClose={() => setInv(null)} title="New invoice">
        {inv && (
          <div className="grid sm:grid-cols-2 gap-3">
            <Field label="No"><input className="input" value={inv.no} onChange={(e) => setInv({ ...inv, no: e.target.value })} /></Field>
            <Field label="Client"><select className="input" value={inv.clientId} onChange={(e) => setInv({ ...inv, clientId: e.target.value })}>{db.clients.map((c) => <option key={c.id} value={c.id}>{c.company}</option>)}</select></Field>
            <Field label="Amount"><input className="input" type="number" value={inv.amount} onChange={(e) => setInv({ ...inv, amount: Number(e.target.value) })} /></Field>
            <Field label="Due"><input className="input" type="date" value={inv.due} onChange={(e) => setInv({ ...inv, due: e.target.value })} /></Field>
            <div className="sm:col-span-2 flex justify-end gap-2"><button className="btn-secondary" onClick={() => setInv(null)}>Cancel</button><button className="btn-primary" onClick={() => { api.saveInvoice({ ...inv, status: 'SENT' }); setInv(null) }}>Issue invoice</button></div>
          </div>
        )}
      </Modal>
    </div>
  )
}
