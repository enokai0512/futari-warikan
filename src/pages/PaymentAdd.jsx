import { useState } from 'react'

function PaymentAdd({ group, onGoToDetail, onUpdateGroup }) {
  // 金額を管理する
  const [amount, setAmount] = useState('')
  // 支払った人を管理する
  const [paidBy, setPaidBy] = useState(group.members[0])
  // メモを管理する
  const [memo, setMemo] = useState('')
  // カテゴリを管理する
  const [category, setCategory] = useState('')
  // 日付を管理する
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  // 負担モード（比率／均等）を管理する
  const [splitMode, setSplitMode] = useState('equal')
  // 比率を管理する
  const [ratios, setRatios] = useState(
    group.members.map((m) => ({ name: m, ratio: 1 }))
  )
  // 金額直接入力を管理する
  const [amounts, setAmounts] = useState(
    group.members.map((m) => ({ name: m, amount: '' }))
  )
  // エラーメッセージを管理する
  const [error, setError] = useState('')

  const categories = ['食事', '交通', '宿泊', '娯楽', 'その他']

  // 比率を更新する
  const updateRatio = (name, value) => {
    setRatios(ratios.map((r) => (r.name === name ? { ...r, ratio: Number(value) } : r)))
  }

  // 金額直接入力を更新する
  const updateAmount = (name, value) => {
    setAmounts(amounts.map((a) => (a.name === name ? { ...a, amount: value } : a)))
  }

  // 合計金額と入力金額が一致するか確認する
  const totalAmountMatch = () => {
    const sum = amounts.reduce((s, a) => s + (Number(a.amount) || 0), 0)
    return sum === Number(amount)
  }

  // プレビュー（誰がいくら負担するか）を計算する
  const calcPreview = () => {
    if (!amount || isNaN(Number(amount))) return []
    const total = Number(amount)

    if (splitMode === 'ratio') {
      const ratioSum = ratios.reduce((s, r) => s + r.ratio, 0)
      return ratios.map((r) => ({
        name: r.name,
        share: Math.round((total * r.ratio) / ratioSum),
      }))
    } else if (splitMode === 'amount') {
      return amounts.map((a) => ({
        name: a.name,
        share: Number(a.amount) || 0,
      }))
    } else {
      const share = Math.round(total / group.members.length)
      return group.members.map((m) => ({ name: m, share }))
    }
  }

  // 支払いを追加する
  const handleAdd = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('正しい金額を入力してください')
      return
    }
    if (splitMode === 'amount' && !totalAmountMatch()) {
      setError(`合計が ${Number(amount).toLocaleString()} ${group.currency} になるように入力してください`)
      return
    }

    const newPayment = {
      id: Date.now().toString(),
      amount: Number(amount),
      paidBy,
      memo,
      category,
      date,
      splitMode,
      ratios: splitMode === 'ratio' ? ratios : null,
      amounts: splitMode === 'amount' ? amounts : null,
      settled: false,
    }

    const updatedPayments = [newPayment, ...(group.payments || [])]
    const updatedGroup = { ...group, payments: updatedPayments }

    // LocalStorageに保存する
    const saved = localStorage.getItem('groups')
    const groups = saved ? JSON.parse(saved) : []
    const updatedGroups = groups.map((g) =>
      g.id === group.id ? updatedGroup : g
    )
    localStorage.setItem('groups', JSON.stringify(updatedGroups))
    onUpdateGroup(updatedGroup)
    onGoToDetail()
  }

  const preview = calcPreview()

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <button className="back-button" onClick={onGoToDetail}>←</button>
        <h1>支払いを追加</h1>
      </div>

      <div className="main-content">
        <div className="card">
          {/* 金額入力 */}
          <div className="form-group">
            <label className="form-label">金額（{group.currency}）</label>
            <input
              className="form-input"
              type="number"
              placeholder="0"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError('') }}
            />
          </div>

          {/* 支払った人 */}
          <div className="form-group">
            <label className="form-label">支払った人</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {group.members.map((m) => (
                <button
                  key={m}
                  onClick={() => setPaidBy(m)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: paidBy === m ? '#4A9068' : '#e0ddd8',
                    backgroundColor: paidBy === m ? '#e8f5ee' : 'white',
                    color: paidBy === m ? '#4A9068' : '#2E2C28',
                    fontWeight: paidBy === m ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 負担モード */}
          <div className="form-group">
            <label className="form-label">負担方法</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'equal', label: '均等割り' },
                { key: 'ratio', label: '比率' },
                { key: 'amount', label: '金額指定' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setSplitMode(mode.key)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: splitMode === mode.key ? '#4A9068' : '#e0ddd8',
                    backgroundColor: splitMode === mode.key ? '#e8f5ee' : 'white',
                    color: splitMode === mode.key ? '#4A9068' : '#2E2C28',
                    fontWeight: splitMode === mode.key ? 'bold' : 'normal',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* 比率入力 */}
          {splitMode === 'ratio' && (
            <div className="form-group">
              {ratios.map((r) => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ width: '60px', fontWeight: 'bold' }}>{r.name}</span>
                  <input
                    className="form-input"
                    type="number"
                    value={r.ratio}
                    onChange={(e) => updateRatio(r.name, e.target.value)}
                    style={{ width: '80px' }}
                  />
                  <span className="text-small">
                    {amount && !isNaN(Number(amount))
                      ? `→ ${Math.round((Number(amount) * r.ratio) / ratios.reduce((s, x) => s + x.ratio, 0)).toLocaleString()} ${group.currency}`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 金額直接入力 */}
          {splitMode === 'amount' && (
            <div className="form-group">
              {amounts.map((a) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                  <span style={{ width: '60px', fontWeight: 'bold' }}>{a.name}</span>
                  <input
                    className="form-input"
                    type="number"
                    placeholder="0"
                    value={a.amount}
                    onChange={(e) => { updateAmount(a.name, e.target.value); setError('') }}
                    style={{ width: '120px' }}
                  />
                  <span className="text-small">{group.currency}</span>
                </div>
              ))}
              {amount && (
                <p className={totalAmountMatch() ? 'text-small' : 'error-message'}>
                  合計：{amounts.reduce((s, a) => s + (Number(a.amount) || 0), 0).toLocaleString()} / {Number(amount).toLocaleString()} {group.currency}
                </p>
              )}
            </div>
          )}

          {/* メモ入力 */}
          <div className="form-group">
            <label className="form-label">メモ（任意）</label>
            <input
              className="form-input"
              type="text"
              placeholder="例：ランチ代、電車代"
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          {/* カテゴリ選択 */}
          <div className="form-group">
            <label className="form-label">カテゴリ（任意）</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCategory(category === c ? '' : c)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '20px',
                    border: '2px solid',
                    borderColor: category === c ? '#4A9068' : '#e0ddd8',
                    backgroundColor: category === c ? '#e8f5ee' : 'white',
                    color: category === c ? '#4A9068' : '#2E2C28',
                    cursor: 'pointer',
                    fontSize: '13px',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* 日付入力 */}
          <div className="form-group">
            <label className="form-label">日付</label>
            <input
              className="form-input"
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          {/* プレビュー */}
          {preview.length > 0 && (
            <div style={{ backgroundColor: '#f0f8f4', borderRadius: '8px', padding: '12px', marginBottom: '16px' }}>
              <p style={{ fontWeight: 'bold', marginBottom: '8px', fontSize: '14px' }}>
                👀 負担プレビュー
              </p>
              {preview.map((p) => (
                <p key={p.name} className="text-small" style={{ marginBottom: '4px' }}>
                  {p.name}：{p.share.toLocaleString()} {group.currency}
                </p>
              ))}
            </div>
          )}

          {/* エラーメッセージ */}
          {error && <p className="error-message" style={{ marginBottom: '12px' }}>{error}</p>}

          <hr className="divider" />

          {/* 追加ボタン */}
          <button className="button-primary" onClick={handleAdd}>
            追加する
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentAdd