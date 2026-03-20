import { useState, useEffect } from 'react'

function GroupCreate({ onGoToList }) {
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [currency, setCurrency] = useState('円')
  const [error, setError] = useState('')
  // よく使うメンバーセットを管理する
  const [savedSets, setSavedSets] = useState([])
  // セット名入力を管理する
  const [setNameInput, setSetNameInput] = useState('')
  // セット保存UIの表示を管理する
  const [showSaveSet, setShowSaveSet] = useState(false)

  // LocalStorageからよく使うメンバーセットを読み込む
  useEffect(() => {
    const saved = localStorage.getItem('memberSets')
    if (saved) setSavedSets(JSON.parse(saved))
  }, [])

  // メンバーを追加する
  const addMember = () => {
    if (memberInput.trim() === '') return
    if (members.includes(memberInput.trim())) {
      setError('同じ名前のメンバーがいます')
      return
    }
    setMembers([...members, memberInput.trim()])
    setMemberInput('')
    setError('')
  }

  // Enterキーでメンバーを追加する
  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addMember()
  }

  // メンバーを削除する
  const removeMember = (name) => {
    setMembers(members.filter((m) => m !== name))
  }

  // よく使うメンバーセットを保存する
  const saveSet = () => {
    if (members.length < 2) {
      setError('メンバーを2人以上追加してからセットを保存してください')
      return
    }
    if (setNameInput.trim() === '') {
      setError('セット名を入力してください')
      return
    }
    const newSet = { name: setNameInput.trim(), members: members }
    const updated = [newSet, ...savedSets.filter((s) => s.name !== setNameInput.trim())]
    setSavedSets(updated)
    localStorage.setItem('memberSets', JSON.stringify(updated))
    setSetNameInput('')
    setShowSaveSet(false)
    setError('')
  }

  // よく使うメンバーセットを削除する
  const deleteSet = (name) => {
    const updated = savedSets.filter((s) => s.name !== name)
    setSavedSets(updated)
    localStorage.setItem('memberSets', JSON.stringify(updated))
  }

  // よく使うメンバーセットからメンバーを読み込む
  const loadSet = (set) => {
    setMembers(set.members)
    setError('')
  }

  // グループを作成してLocalStorageに保存する
  const handleCreate = () => {
    if (groupName.trim() === '') {
      setError('グループ名を入力してください')
      return
    }
    if (members.length < 2) {
      setError('メンバーを2人以上追加してください')
      return
    }

    const newGroup = {
      id: Date.now().toString(),
      name: groupName.trim(),
      members: members,
      currency: currency,
      payments: [],
      createdAt: new Date().toISOString(),
    }

    const saved = localStorage.getItem('groups')
    const existing = saved ? JSON.parse(saved) : []
    const updated = [newGroup, ...existing]
    localStorage.setItem('groups', JSON.stringify(updated))
    onGoToList()
  }

  return (
    <div>
      {/* ヘッダー */}
      <div className="header">
        <button className="back-button" onClick={onGoToList}>←</button>
        <h1>グループを作成</h1>
      </div>

      <div className="main-content">
        <div className="card">
          {/* グループ名入力 */}
          <div className="form-group">
            <label className="form-label">グループ名</label>
            <input
              className="form-input"
              type="text"
              placeholder="例：3月のデート、年越し旅行"
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
            />
          </div>

          {/* よく使うメンバーセット */}
          {savedSets.length > 0 && (
            <div className="form-group">
              <label className="form-label">⭐ よく使うメンバー</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedSets.map((set) => (
                  <div
                    key={set.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#f0f8f4',
                      borderRadius: '8px',
                      padding: '10px 12px',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: 'bold', fontSize: '14px' }}>{set.name}</p>
                      <p className="text-small">{set.members.join('・')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => loadSet(set)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '2px solid #4A9068',
                          backgroundColor: '#4A9068',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: 'bold',
                        }}
                      >
                        使う
                      </button>
                      <button
                        onClick={() => deleteSet(set.name)}
                        style={{
                          padding: '6px 12px',
                          borderRadius: '6px',
                          border: '2px solid #e0ddd8',
                          backgroundColor: 'white',
                          color: '#888',
                          cursor: 'pointer',
                          fontSize: '13px',
                        }}
                      >
                        削除
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* メンバー入力 */}
          <div className="form-group">
            <label className="form-label">メンバー</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              <input
                className="form-input"
                type="text"
                placeholder="名前を入力してEnter"
                value={memberInput}
                onChange={(e) => setMemberInput(e.target.value)}
                onKeyDown={handleKeyDown}
                style={{ flex: 1 }}
              />
              <button
                className="button-primary"
                onClick={addMember}
                style={{ width: 'auto', padding: '12px 16px' }}
              >
                追加
              </button>
            </div>

            {/* メンバーチップ一覧 */}
            <div style={{ marginTop: '10px' }}>
              {members.map((name) => (
                <span key={name} className="chip">
                  {name}
                  <button
                    className="chip-delete"
                    onClick={() => removeMember(name)}
                  >
                    ×
                  </button>
                </span>
              ))}
            </div>
          </div>

          {/* よく使うメンバーセットとして保存 */}
          {members.length >= 2 && (
            <div className="form-group">
              {!showSaveSet ? (
                <button
                  onClick={() => setShowSaveSet(true)}
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#4A9068',
                    cursor: 'pointer',
                    fontSize: '14px',
                    padding: '0',
                    textDecoration: 'underline',
                  }}
                >
                  ⭐ このメンバーをよく使うセットとして保存する
                </button>
              ) : (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    className="form-input"
                    type="text"
                    placeholder="セット名（例：彼女と2人）"
                    value={setNameInput}
                    onChange={(e) => setSetNameInput(e.target.value)}
                    style={{ flex: 1 }}
                  />
                  <button
                    className="button-primary"
                    onClick={saveSet}
                    style={{ width: 'auto', padding: '12px 16px' }}
                  >
                    保存
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 通貨選択 */}
          <div className="form-group">
            <label className="form-label">通貨</label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {['円', 'USD', 'EUR'].map((c) => (
                <button
                  key={c}
                  onClick={() => setCurrency(c)}
                  style={{
                    flex: 1,
                    padding: '10px',
                    borderRadius: '8px',
                    border: '2px solid',
                    borderColor: currency === c ? '#4A9068' : '#e0ddd8',
                    backgroundColor: currency === c ? '#e8f5ee' : 'white',
                    color: currency === c ? '#4A9068' : '#2E2C28',
                    fontWeight: currency === c ? 'bold' : 'normal',
                    cursor: 'pointer',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {/* エラーメッセージ */}
          {error && <p className="error-message">{error}</p>}

          <hr className="divider" />

          {/* 作成ボタン */}
          <button className="button-primary" onClick={handleCreate}>
            作成する
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupCreate