import { useState } from 'react'

function GroupDetail({ group, onGoToList, onGoToPaymentAdd, onGoToPaymentEdit, onUpdateGroup }) {
  const [payments, setPayments] = useState(group.payments || [])
  const [filter, setFilter] = useState('pending')

  // 精算結果を計算する
  const calcSettlement = () => {
    const totals = {}
    group.members.forEach((m) => (totals[m] = 0))

    payments.forEach((p) => {
      const paid = p.paidBy
      const amount = p.amount

      if (p.splitMode === 'ratio' && p.ratios) {
        // 比率モードの場合
        const ratioSum = p.ratios.reduce((s, r) => s + r.ratio, 0)
        p.ratios.forEach((r) => {
          const share = (amount * r.ratio) / ratioSum
          if (r.name === paid) {
            totals[paid] += amount - share
          } else {
            totals[r.name] -= share
          }
        })
      } else if (p.splitMode === 'amount' && p.amounts) {
        // 金額指定モードの場合
        p.amounts.forEach((a) => {
          if (a.name === paid) {
            // 支払った人は（合計 - 自分の負担額）分を受け取れる
            totals[paid] += amount - Number(a.amount)
          } else {
            // それ以外は自分の負担額を返す必要がある
            totals[a.name] -= Number(a.amount)
          }
        })
      } else {
        // 均等割りの場合
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

  // 支払いを削除する
  const handleDelete = (id) => {
    if (!window.confirm('この支払いを削除しますか？')) return
    const updated = payments.filter((p) => p.id !== id)
    setPayments(updated)
    savePayments(updated)
  }

  // LocalStorageに保存する
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

  const filteredPayments = payments.filter((p) => {
    if (filter === 'settled') return p.settled
    if (filter === 'pending') return !p.settled
    return true
  })

  const pendingCount = payments.filter((p) => !p.settled).length
  const settlement = calcSettlement()
  const allSettled = payments.length > 0 && payments.every((p) => p.settled)

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <button className="back-button" onClick={onGoToList}>←</button>
        <h1>{group.name}</h1>
        {pendingCount > 0 && (
          <span className="badge">{pendingCount}件未精算</span>
        )}
      </div>

      <div className="main-content">
        {/* 精算結果カード */}
        <div className="card">
          <p style={{ fontWeight: '700', fontSize: '13px', color: '#6B6860', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '12px' }}>
            精算結果
          </p>
          {settlement.length === 0 ? (
            <p className="text-small text-center">
              {payments.length === 0
                ? '支払いを追加すると精算結果が表示されます'
                : '精算完了！'}
            </p>
          ) : (
            settlement.map((s, i) => (
              <div key={i} style={{ marginBottom: '10px', padding: '12px', backgroundColor: '#F7F4EE', borderRadius: '10px' }}>
                <span style={{ fontWeight: '700', color: '#B03020' }}>{s.from}</span>
                <span className="text-small"> が </span>
                <span style={{ fontWeight: '700', color: '#3D7A58' }}>{s.to}</span>
                <span className="text-small"> に </span>
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: '600', fontSize: '20px', letterSpacing: '-0.02em' }}>
                  {s.amount.toLocaleString()} {group.currency}
                </span>
                <span className="text-small"> を返す</span>
              </div>
            ))
          )}
        </div>

        {/* フィルタータブ */}
        <div style={{ display: 'flex', gap: '6px', marginBottom: '12px' }}>
          {[
            { key: 'pending', label: '未精算', count: pendingCount },
            { key: 'all', label: 'すべて' },
            { key: 'settled', label: '精算済み' },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key)}
              style={{
                flex: 1,
                padding: '8px',
                borderRadius: '10px',
                border: '1.5px solid',
                borderColor: filter === tab.key ? '#3D7A58' : '#E0DDD8',
                backgroundColor: filter === tab.key ? '#EEF7F2' : 'white',
                color: filter === tab.key ? '#3D7A58' : '#9A9690',
                fontWeight: filter === tab.key ? '700' : '400',
                cursor: 'pointer',
                fontSize: '13px',
              }}
            >
              {tab.label}
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
          <div className="card text-center" style={{ padding: '36px 16px' }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              backgroundColor: '#EEF7F2',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                <path d="M5 13l4 4L19 7" stroke="#3D7A58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: '700', marginBottom: '4px' }}>
              {filter === 'pending' ? '未精算はありません' : '支払いがありません'}
            </p>
            <p className="text-small">
              {filter === 'pending' ? 'すべて精算済みです' : '支払いを追加してみましょう'}
            </p>
          </div>
        ) : (
          filteredPayments
            .slice()
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .map((payment) => (
              <div key={payment.id} className={payment.settled ? 'card-settled' : 'card-pending'}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <p style={{ fontWeight: '700', marginBottom: '4px', fontSize: '15px' }}>
                      {payment.memo || '（メモなし）'}
                    </p>
                    <p className="text-small">
                      {payment.paidBy} が支払い · {payment.date}
                    </p>
                    {payment.category && (
                      <p className="text-small" style={{ marginTop: '2px' }}>{payment.category}</p>
                    )}
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{
                      fontFamily: "'DM Sans', sans-serif",
                      fontWeight: '600',
                      fontSize: '24px',
                      color: payment.settled ? '#9A9690' : '#3D7A58',
                      letterSpacing: '-0.02em',
                      lineHeight: 1.2,
                    }}>
                      {payment.amount.toLocaleString()}
                      <span style={{ fontSize: '13px', fontWeight: '400' }}> {group.currency}</span>
                    </p>
                    <span className={payment.settled ? 'tag tag-settled' : 'tag tag-pending'}>
                      {payment.settled ? '精算済み' : '未精算'}
                    </span>
                  </div>
                </div>

                {/* 編集・削除ボタン */}
                <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
                  <button
                    onClick={() => onGoToPaymentEdit(payment)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '8px',
                      border: '1.5px solid #E0DDD8',
                      backgroundColor: 'white',
                      color: '#6B6860',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    編集
                  </button>
                  <button
                    onClick={() => handleDelete(payment.id)}
                    style={{
                      flex: 1,
                      padding: '7px',
                      borderRadius: '8px',
                      border: '1.5px solid #E0DDD8',
                      backgroundColor: 'white',
                      color: '#B03020',
                      cursor: 'pointer',
                      fontSize: '13px',
                      fontWeight: '500',
                    }}
                  >
                    削除
                  </button>
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
            + 支払いを追加
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupDetail