import { useState } from 'react'

function PaymentAdd({ group, editingPayment, onGoToDetail, onUpdateGroup }) {
  const [amount, setAmount] = useState(editingPayment ? String(editingPayment.amount) : '')
  const [paidBy, setPaidBy] = useState(editingPayment ? editingPayment.paidBy : group.members[0])
  const [memo, setMemo] = useState(editingPayment ? editingPayment.memo : '')
  const [category, setCategory] = useState(editingPayment ? editingPayment.category : '')
  const [date, setDate] = useState(editingPayment ? editingPayment.date : new Date().toISOString().split('T')[0])
  // デフォルトを「比率」にして均等割りを廃止する
  const [splitMode, setSplitMode] = useState(
    editingPayment ? (editingPayment.splitMode === 'equal' ? 'ratio' : editingPayment.splitMode) : 'ratio'
  )
  // デフォルトの比率を5：5にする
  const [ratios, setRatios] = useState(
    editingPayment?.ratios || group.members.map((m) => ({ name: m, ratio: 5 }))
  )
  const [amounts, setAmounts] = useState(
    editingPayment?.amounts || group.members.map((m) => ({ name: m, amount: '' }))
  )
  const [error, setError] = useState('')

  const categories = ['食事', '交通', '宿泊', '娯楽', 'その他']

  // 比率を更新する（片方を変えたらもう片方は10-入力値になる）
  const updateRatio = (name, value) => {
    const intValue = Math.min(9, Math.max(1, Math.round(Number(value))))
    const updated = ratios.map((r) => {
      if (r.name === name) return { ...r, ratio: intValue }
      return { ...r, ratio: 10 - intValue }
    })
    setRatios(updated)
  }

  // 金額を更新する（片方を入力したらもう片方は残りになる）
  const updateAmount = (name, value) => {
    const inputVal = Number(value) || 0
    const total = Number(amount) || 0
    const updated = amounts.map((a) => {
      if (a.name === name) return { ...a, amount: value }
      return { ...a, amount: String(Math.max(0, total - inputVal)) }
    })
    setAmounts(updated)
    setError('')
  }

  const totalAmountMatch = () => {
    const sum = amounts.reduce((s, a) => s + (Number(a.amount) || 0), 0)
    return sum === Number(amount)
  }

  // プレビューを計算する
  const calcPreview = () => {
    if (!amount || isNaN(Number(amount))) return []
    const total = Number(amount)

    if (splitMode === 'ratio') {
      const ratioSum = ratios.reduce((s, r) => s + r.ratio, 0)
      return ratios.map((r) => ({
        name: r.name,
        share: Math.round((total * r.ratio) / ratioSum),
      }))
    } else {
      return amounts.map((a) => ({
        name: a.name,
        share: Number(a.amount) || 0,
      }))
    }
  }

  // 追加または保存する
  const handleAdd = () => {
    if (!amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      setError('正しい金額を入力してください')
      return
    }
    if (splitMode === 'amount' && !totalAmountMatch()) {
      setError(`合計が ${Number(amount).toLocaleString()} ${group.currency} になるように入力してください`)
      return
    }

    const paymentData = {
      id: editingPayment ? editingPayment.id : Date.now().toString(),
      amount: Number(amount),
      paidBy,
      memo,
      category,
      date,
      splitMode,
      ratios: splitMode === 'ratio' ? ratios : null,
      amounts: splitMode === 'amount' ? amounts : null,
      settled: editingPayment ? editingPayment.settled : false,
    }

    const saved = localStorage.getItem('groups')
    const groups = saved ? JSON.parse(saved) : []

    const updatedGroups = groups.map((g) => {
      if (g.id !== group.id) return g
      let updatedPayments
      if (editingPayment) {
        updatedPayments = g.payments.map((p) =>
          p.id === editingPayment.id ? paymentData : p
        )
      } else {
        updatedPayments = [paymentData, ...(g.payments || [])]
      }
      return { ...g, payments: updatedPayments }
    })

    localStorage.setItem('groups', JSON.stringify(updatedGroups))
    onUpdateGroup({ ...group, payments: updatedGroups.find((g) => g.id === group.id).payments })
    onGoToDetail()
  }

  const preview = calcPreview()

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <button className="back-button" onClick={onGoToDetail}>←</button>
        <h1>{editingPayment ? '支払いを編集' : '支払いを追加'}</h1>
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
              style={{ fontSize: '24px', fontWeight: '600', letterSpacing: '-0.02em' }}
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
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: paidBy === m ? '#3D7A58' : '#E0DDD8',
                    backgroundColor: paidBy === m ? '#EEF7F2' : 'white',
                    color: paidBy === m ? '#3D7A58' : '#2E2C28',
                    fontWeight: paidBy === m ? '700' : '400',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>

          {/* 負担モード（比率と金額指定の2つのみ） */}
          <div className="form-group">
            <label className="form-label">負担方法</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[
                { key: 'ratio', label: '比率' },
                { key: 'amount', label: '金額指定' },
              ].map((mode) => (
                <button
                  key={mode.key}
                  onClick={() => setSplitMode(mode.key)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: splitMode === mode.key ? '#3D7A58' : '#E0DDD8',
                    backgroundColor: splitMode === mode.key ? '#EEF7F2' : 'white',
                    color: splitMode === mode.key ? '#3D7A58' : '#2E2C28',
                    fontWeight: splitMode === mode.key ? '700' : '400',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {mode.label}
                </button>
              ))}
            </div>
          </div>

          {/* 比率入力（デフォルト5：5） */}
          {splitMode === 'ratio' && (
            <div className="form-group">
              <label className="form-label">比率（合計10）</label>
              {ratios.map((r, index) => (
                <div key={r.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    minWidth: '64px',
                    maxWidth: '64px',
                    fontWeight: '700',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {r.name}
                  </span>
                  {index === 0 ? (
                    <input
                      className="form-input"
                      type="number"
                      min="1"
                      max="9"
                      value={r.ratio}
                      onChange={(e) => updateRatio(r.name, e.target.value)}
                      style={{ width: '80px', textAlign: 'center' }}
                    />
                  ) : (
                    <div style={{
                      width: '80px',
                      padding: '12px 14px',
                      border: '1.5px solid #EEEBE4',
                      borderRadius: '10px',
                      textAlign: 'center',
                      backgroundColor: '#F7F4EE',
                      fontWeight: '700',
                      color: '#3D7A58',
                    }}>
                      {r.ratio}
                    </div>
                  )}
                  <span className="text-small" style={{ flex: 1 }}>
                    {amount && !isNaN(Number(amount))
                      ? `→ ${Math.round(Number(amount) * r.ratio / 10).toLocaleString()} ${group.currency}`
                      : ''}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* 金額直接入力 */}
          {splitMode === 'amount' && (
            <div className="form-group">
              <label className="form-label">金額を入力</label>
              {amounts.map((a, index) => (
                <div key={a.name} style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '10px' }}>
                  <span style={{
                    minWidth: '64px',
                    maxWidth: '64px',
                    fontWeight: '700',
                    fontSize: '13px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {a.name}
                  </span>
                  {index === 0 ? (
                    <input
                      className="form-input"
                      type="number"
                      placeholder="0"
                      value={a.amount}
                      onChange={(e) => updateAmount(a.name, e.target.value)}
                      style={{ width: '120px' }}
                    />
                  ) : (
                    <div style={{
                      width: '120px',
                      padding: '12px 14px',
                      border: '1.5px solid #EEEBE4',
                      borderRadius: '10px',
                      textAlign: 'center',
                      backgroundColor: '#F7F4EE',
                      fontWeight: '700',
                      color: '#3D7A58',
                    }}>
                      {a.amount || 0}
                    </div>
                  )}
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
                    padding: '7px 14px',
                    borderRadius: '20px',
                    border: '1.5px solid',
                    borderColor: category === c ? '#3D7A58' : '#E0DDD8',
                    backgroundColor: category === c ? '#EEF7F2' : 'white',
                    color: category === c ? '#3D7A58' : '#9A9690',
                    fontWeight: category === c ? '700' : '400',
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
            <div style={{
              backgroundColor: '#F7F4EE',
              borderRadius: '10px',
              padding: '14px',
              marginBottom: '16px',
              border: '1px solid #EEEBE4',
            }}>
              <p style={{ fontWeight: '700', fontSize: '13px', color: '#6B6860', letterSpacing: '0.04em', textTransform: 'uppercase', marginBottom: '10px' }}>
                負担プレビュー
              </p>
              {preview.map((p) => (
                <div key={p.name} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '14px', fontWeight: '500' }}>{p.name}</span>
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: '600', fontSize: '16px', color: '#3D7A58' }}>
                    {p.share.toLocaleString()} {group.currency}
                  </span>
                </div>
              ))}
            </div>
          )}

          {error && <p className="error-message" style={{ marginBottom: '12px' }}>{error}</p>}

          <hr className="divider" />

          <button className="button-primary" onClick={handleAdd}>
            {editingPayment ? '変更を保存する' : '追加する'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default PaymentAdd