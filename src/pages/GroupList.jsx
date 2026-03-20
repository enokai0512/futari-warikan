import { useState, useEffect } from 'react'

function GroupList({ onGoToCreate, onGoToDetail }) {
  const [groups, setGroups] = useState([])

  // LocalStorageからグループ一覧を読み込む
  useEffect(() => {
    const saved = localStorage.getItem('groups')
    if (saved) setGroups(JSON.parse(saved))
  }, [])

  // 合計金額を計算する
  const calcTotal = (group) => {
    if (!group.payments || group.payments.length === 0) return 0
    return group.payments.reduce((sum, p) => sum + p.amount, 0)
  }

  // 未精算の件数を数える
  const pendingCount = (group) => {
    if (!group.payments) return 0
    return group.payments.filter((p) => !p.settled).length
  }

  // 精算済みかどうか確認する
  const isSettled = (group) => {
    if (!group.payments || group.payments.length === 0) return false
    return group.payments.every((p) => p.settled)
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <h1>💑 ふたりの割り勘メモ</h1>
      </div>

      <div className="main-content">
        {/* グループが0件の場合 */}
        {groups.length === 0 && (
          <div className="card text-center" style={{ padding: '40px 16px' }}>
            <p style={{ fontSize: '40px', marginBottom: '12px' }}>📋</p>
            <p style={{ color: '#888', marginBottom: '8px' }}>
              グループがまだありません
            </p>
            <p className="text-small">
              下のボタンから最初のグループを作ってみましょう！
            </p>
          </div>
        )}

        {/* グループ一覧 */}
        {groups.map((group) => (
          <div
            key={group.id}
            className={pendingCount(group) > 0 ? 'card-pending' : 'card'}
            onClick={() => onGoToDetail(group)}
            style={{ cursor: 'pointer' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <p style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '4px' }}>
                  {group.name}
                </p>
                <p className="text-small">
                  {group.members.join('・')} ／ {group.currency}
                </p>
                {/* 未精算件数を表示する */}
                {pendingCount(group) > 0 && (
                  <span className="badge" style={{ marginTop: '4px' }}>
                    {pendingCount(group)}件未精算
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                {/* 金額を大きく表示する */}
                <p style={{
                  fontWeight: 'bold',
                  fontSize: '26px',
                  color: pendingCount(group) > 0 ? '#4A9068' : '#888',
                  lineHeight: 1.2,
                }}>
                  {calcTotal(group).toLocaleString()}
                  <span style={{ fontSize: '13px' }}> {group.currency}</span>
                </p>
                <span className={isSettled(group) ? 'tag tag-settled' : 'tag tag-pending'}>
                  {isSettled(group) ? '精算済み' : '未精算'}
                </span>
              </div>
            </div>
          </div>
        ))}

        {/* 新しいグループを作成するボタン */}
        <button className="button-primary" onClick={onGoToCreate}>
          ＋ 新しいグループを作成
        </button>
      </div>
    </div>
  )
}

export default GroupList