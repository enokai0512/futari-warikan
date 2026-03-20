import { useState } from 'react'
import GroupList from './pages/GroupList'
import GroupCreate from './pages/GroupCreate'
import GroupDetail from './pages/GroupDetail'
import PaymentAdd from './pages/PaymentAdd'

function App() {
  // 現在表示する画面を管理する
  const [currentPage, setCurrentPage] = useState('groupList')
  // 選択中のグループを管理する
  const [selectedGroup, setSelectedGroup] = useState(null)

  // グループ一覧画面に戻る
  const goToGroupList = () => {
    setCurrentPage('groupList')
    setSelectedGroup(null)
  }

  // グループ作成画面へ移動
  const goToGroupCreate = () => {
    setCurrentPage('groupCreate')
  }

  // グループ詳細画面へ移動
  const goToGroupDetail = (group) => {
    setSelectedGroup(group)
    setCurrentPage('groupDetail')
  }

  // 支払い追加画面へ移動
  const goToPaymentAdd = () => {
    setCurrentPage('paymentAdd')
  }

  return (
    <div className="app-container">
      {currentPage === 'groupList' && (
        <GroupList
          onGoToCreate={goToGroupCreate}
          onGoToDetail={goToGroupDetail}
        />
      )}
      {currentPage === 'groupCreate' && (
        <GroupCreate
          onGoToList={goToGroupList}
        />
      )}
      {currentPage === 'groupDetail' && (
        <GroupDetail
          group={selectedGroup}
          onGoToList={goToGroupList}
          onGoToPaymentAdd={goToPaymentAdd}
          onUpdateGroup={setSelectedGroup}
        />
      )}
      {currentPage === 'paymentAdd' && (
        <PaymentAdd
          group={selectedGroup}
          onGoToDetail={() => setCurrentPage('groupDetail')}
          onUpdateGroup={setSelectedGroup}
        />
      )}
    </div>
  )
}

export default App