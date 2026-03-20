import { useState } from 'react'

function GroupDetail({ group, onGoToList, onGoToPaymentAdd, onUpdateGroup }) {
  const [payments, setPayments] = useState(group.payments || [])
  // デフォルトを「未精算」に変更する
  const [filter, setFilter] = useState('pending')

  // 精算結果（誰が誰にいくら返すか）を計算する
  const calcSettlement = () => {
    const totals = {}
    group.members.forEach((m) => (totals[m] = 0))

    payments.forEach((p) => {
      const paid = p.paidBy
      const amount = p.amount

      if (p.splitMode === 'ratio') {
        const ratioSum = p.ratios.reduce((s, r) => s + r.ratio, 0)
        p.ratios.forEach((r) => {
          const share = (amount * r.ratio) / ratioSum
          if (r.name === paid) {
            totals[paid] += amount - share
          } else {
            totals[r.name] -= share
          }
        })
      } else {
        const share = amount / group.members.length
        group.members.forEach((m) => {
          if (m === paid) {
            totals[m] += amount - share
          } else {
            totals[m] -= share
          }
        })
      }
    })

    const results = []
    const debtors = group.members.filter((m) => totals[m] < 0)
    const creditors = group.members.filter((m) => totals[m] > 0)

    debtors.forEach((debtor) => {
      let debt = Math.abs(totals[debtor])
      creditors.forEach((creditor) => {
        if (debt > 0 && totals[creditor] > 0) {
          const amount = Math.min(debt, totals[creditor])
          results.push({ from: debtor, to: creditor, amount: Math.round(amount) })
          debt -= amount
          totals[creditor] -= amount
        }
      })
    })

    return results
  }

  // 一括精算する
  const handleSettleAll = () => {
    const updated = payments.map((p) => ({ ...p, settled: true }))
    setPayments(updated)
    savePayments(updated)
  }

  // LocalStorageに支払いを保存する
  const savePayments = (newPayments) => {
    const saved = localStorage.getItem('groups')
    const groups = saved ? JSON.parse(saved) : []
    const updatedGroups = groups.map((g) => {
      if (g.id === group.id) return { ...g, payments: newPayments }
      return g
    })
    localStorage.setItem('groups', JSON.stringify(updatedGroups))
    onUpdateGroup({ ...group, payments: newPayments })
  }

  // フィルターに応じた支払い一覧を返す
  const filteredPayments = payments.filter((p) => {
    if (filter === 'settled') return p.settled
    if (filter === 'pending') return !p.settled
    return true
  })

  // 未精算の件数を数える
  const pendingCount = payments.filter((p) => !p.settled).length

  const settlement = calcSettlement()
  const allSettled = payments.length > 0 && payments.every((p) => p.settled)

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <button className="back-button" onClick={onGoToList}>←</button>
        <h1>{group.name}</h1>
        {/* 未精算バッジ */}
        {pendingCount > 0 && (
          <span className="badge">{pendingCount}件未精算</span>
        )}
      </div>

      <div className="main-content">
        {/* 精算結果カード */}
        <div className="card">
          <p style={{ fontWeight: 'bold', marginBottom: '12px' }}>💰 精算結果</p>
          {settlement.length === 0 ? (
            <p className="text-small text-center">
              {payments.length === 0
                ? '支払いを追加すると精算結果が表示されます'
                : '✅ 精算完了！'}
            </p>
          ) : (
            settlement.map((s, i) => (
              <div key={i} style={{ marginBottom: '8px' }}>
                <span style={{ fontWeight: 'bold', color: '#C03928' }}>{s.from}</span>
                <span className="text-small"> が </span>
                <span style={{ fontWeight: 'bold', color: '#4A9068' }}>{s.to}</span>
                <span className="text-small"> に </span>
                <span style={{ fontWeight: 'bold', fontSize: '20px' }}>
                  {s.amount.toLocaleString()} {group.currency}
                </span>
                <span className="text-small"> 返す</span>
              </div>
            ))
          )}
        </div>

        {/* フィルタータブ */}
        <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
          {[
            { key: 'pending', label: '未精算', count: payments.filter((p) => !p.settled).length },
            { key: 'all', label: '全て', count: null },
            { key: 'settled', label: '精算済み', count: null },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '8px',
                border: '2px solid',
                borderColor: filter === tab.key ? '#4A9068' : '#e0ddd8',
                backgroundColor: filter === tab.key ? '#e8f5ee' : 'white',
                color: filter === tab.key ? '#4A9068' : '#2E2C28',
                fontWeight: filter === tab.key ? 'bold' : 'normal',
                cursor: 'pointer',
                fontSize: '14px',
                position: 'relative',
              }}
            >
              {tab.label}
              {/* 未精算タブに件数バッジを表示する */}
              {tab.key === 'pending' && tab.count > 0 && (
                <span className="badge" style={{ marginLeft: '4px', fontSize: '11px' }}>
                  {tab.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* 支払い一覧 */}
        {filteredPayments.length === 0 ? (
          <div className="card text-center" style={{ padding: '30px 16px' }}>
            <p style={{ fontSize: '32px', marginBottom: '8px' }}>
              {filter === 'pending' ? '🎉' : '📋'}
            </p>
            <p className="text-small">
              {filter === 'pending' ? '未精算の支払いはありません！' : '支払いがありません'}
            </p>
          </div>
        ) : (
          filteredPayments
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((payment) => (
              <div
                key={payment.id}
                className={payment.settled ? 'card-settled' : 'card-pending'}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                      {payment.memo || '（メモなし）'}
                    </p>
                    <p className="text-small">
                      {payment.paidBy} が支払い ／ {payment.date}
                    </p>
                    {payment.category && (
                      <p className="text-small">{payment.category}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {/* 金額を大きく表示する */}
                    <p style={{
                      fontWeight: 'bold',
                      fontSize: '26px',
                      color: payment.settled ? '#888' : '#4A9068',
                      lineHeight: 1.2,
                    }}>
                      {payment.amount.toLocaleString()}
                      <span style={{ fontSize: '14px' }}> {group.currency}</span>
                    </p>
                    <span className={payment.settled ? 'tag tag-settled' : 'tag tag-pending'}>
                      {payment.settled ? '精算済み' : '未精算'}
                    </span>
                  </div>
                </div>
              </div>
            ))
        )}

        {/* 一括精算ボタン */}
        {!allSettled && payments.length > 0 && (
          <div style={{ marginTop: '8px' }}>
            <button className="button-secondary" onClick={handleSettleAll}>
              一括精算する
            </button>
          </div>
        )}

        {/* 支払い追加ボタン */}
        <div style={{ marginTop: '12px' }}>
          <button className="button-primary" onClick={onGoToPaymentAdd}>
            ＋ 支払いを追加
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupDetail