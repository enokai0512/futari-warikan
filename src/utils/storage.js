// LocalStorageからグループ一覧を取得する
export const getGroups = () => {
  const saved = localStorage.getItem('groups')
  return saved ? JSON.parse(saved) : []
}

// LocalStorageにグループ一覧を保存する
export const saveGroups = (groups) => {
  localStorage.setItem('groups', JSON.stringify(groups))
}

// 特定のグループの支払いを更新して保存する
export const updateGroupPayments = (groupId, newPayments) => {
  const groups = getGroups()
  const updated = groups.map((g) =>
    g.id === groupId ? { ...g, payments: newPayments } : g
  )
  saveGroups(updated)
  return updated
}

// LocalStorageからよく使うメンバーセットを取得する
export const getMemberSets = () => {
  const saved = localStorage.getItem('memberSets')
  return saved ? JSON.parse(saved) : []
}

// LocalStorageによく使うメンバーセットを保存する
export const saveMemberSets = (sets) => {
  localStorage.setItem('memberSets', JSON.stringify(sets))
}