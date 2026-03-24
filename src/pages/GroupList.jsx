function GroupList({ groups, onGoToCreate, onGoToDetail }) {
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
        <h1>ふたりの割り勘メモ</h1>
      </div>

      <div className="main-content">
        {/* グループが0件の場合 */}
        {groups.length === 0 && (
          <div className="card text-center" style={{ padding: '48px 16px' }}>
            <div style={{
              width: '48px',
              height: '48px',
              borderRadius: '50%',
              backgroundColor: '#EEF7F2',
              margin: '0 auto 16px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" stroke="#3D7A58" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <p style={{ fontWeight: '700', marginBottom: '6px', color: '#2E2C28' }}>
              グループがありません
            </p>
            <p className="text-small">
              下のボタンから作成してみましょう
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
                <p style={{ fontWeight: '700', fontSize: '15px', marginBottom: '4px' }}>
                  {group.name}
                </p>
                <p className="text-small">
                  {group.members.join(' · ')} / {group.currency}
                </p>
                {pendingCount(group) > 0 && (
                  <span className="badge" style={{ marginTop: '6px', marginLeft: '0' }}>
                    {pendingCount(group)}件未精算
                  </span>
                )}
              </div>
              <div style={{ textAlign: 'right' }}>
                <p style={{
                  fontFamily: "'DM Sans', sans-serif",
                  fontWeight: '600',
                  fontSize: '24px',
                  color: pendingCount(group) > 0 ? '#3D7A58' : '#9A9690',
                  letterSpacing: '-0.02em',
                  lineHeight: 1.2,
                }}>
                  {calcTotal(group).toLocaleString()}
                  <span style={{ fontSize: '13px', fontWeight: '400' }}> {group.currency}</span>
                </p>
                <span className={isSettled(group) ? 'tag tag-settled' : 'tag tag-pending'}>
                  {isSettled(group) ? '精算済み' : '未精算'}
                </span>
              </div>
            </div>
          </div>
        ))}

        <div style={{ marginTop: '8px' }}>
          <button className="button-primary" onClick={onGoToCreate}>
            + 新しいグループを作成
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupList