import { useState, useEffect } from 'react'
import { getGroups, saveGroups, getMemberSets, saveMemberSets } from '../utils/storage'

function GroupCreate({ onGoToList }) {
  const [groupName, setGroupName] = useState('')
  const [members, setMembers] = useState([])
  const [memberInput, setMemberInput] = useState('')
  const [currency, setCurrency] = useState('円')
  const [error, setError] = useState('')
  const [savedSets, setSavedSets] = useState([])
  const [setNameInput, setSetNameInput] = useState('')
  const [showSaveSet, setShowSaveSet] = useState(false)

  useEffect(() => {
    setSavedSets(getMemberSets())
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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') addMember()
  }

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
    const newSet = { name: setNameInput.trim(), members }
    const updated = [newSet, ...savedSets.filter((s) => s.name !== setNameInput.trim())]
    setSavedSets(updated)
    saveMemberSets(updated)
    setSetNameInput('')
    setShowSaveSet(false)
    setError('')
  }

  const deleteSet = (name) => {
    const updated = savedSets.filter((s) => s.name !== name)
    setSavedSets(updated)
    saveMemberSets(updated)
  }

  const loadSet = (set) => {
    setMembers(set.members)
    setError('')
  }

  // グループを作成する
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
      members,
      currency,
      payments: [],
      createdAt: new Date().toISOString(),
    }

    const existing = getGroups()
    saveGroups([newGroup, ...existing])
    onGoToList('グループを作成しました')
  }

  return (
    <div>
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
              <label className="form-label">よく使うメンバー</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {savedSets.map((set) => (
                  <div
                    key={set.name}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      backgroundColor: '#F7F4EE',
                      borderRadius: '10px',
                      padding: '10px 14px',
                      border: '1px solid #EEEBE4',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '700', fontSize: '14px', marginBottom: '2px' }}>{set.name}</p>
                      <p className="text-small">{set.members.join(' · ')}</p>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        onClick={() => loadSet(set)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: 'none',
                          backgroundColor: '#3D7A58',
                          color: 'white',
                          cursor: 'pointer',
                          fontSize: '13px',
                          fontWeight: '700',
                        }}
                      >
                        使う
                      </button>
                      <button
                        onClick={() => deleteSet(set.name)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '8px',
                          border: '1px solid #E0DDD8',
                          backgroundColor: 'white',
                          color: '#9A9690',
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
            <div style={{ marginTop: '10px' }}>
              {members.map((name) => (
                <span key={name} className="chip">
                  {name}
                  <button className="chip-delete" onClick={() => removeMember(name)}>×</button>
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
                    color: '#3D7A58',
                    cursor: 'pointer',
                    fontSize: '13px',
                    padding: '0',
                    textDecoration: 'underline',
                    fontWeight: '500',
                  }}
                >
                  このメンバーをよく使うセットとして保存する
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
                    borderRadius: '10px',
                    border: '1.5px solid',
                    borderColor: currency === c ? '#3D7A58' : '#E0DDD8',
                    backgroundColor: currency === c ? '#EEF7F2' : 'white',
                    color: currency === c ? '#3D7A58' : '#2E2C28',
                    fontWeight: currency === c ? '700' : '400',
                    cursor: 'pointer',
                    fontSize: '14px',
                  }}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>

          {error && <p className="error-message">{error}</p>}
          <hr className="divider" />
          <button className="button-primary" onClick={handleCreate}>
            作成する
          </button>
        </div>
      </div>
    </div>
  )
}

export default GroupCreate