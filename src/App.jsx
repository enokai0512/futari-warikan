import { useState } from 'react'
import GroupList from './pages/GroupList'
import GroupCreate from './pages/GroupCreate'
import GroupDetail from './pages/GroupDetail'
import PaymentAdd from './pages/PaymentAdd'

function App() {
  const [currentPage, setCurrentPage] = useState('groupList')
  const [selectedGroup, setSelectedGroup] = useState(null)
  // 編集中の支払いを管理する（nullなら新規追加）
  const [editingPayment, setEditingPayment] = useState(null)

  const goToGroupList = () => {
    setCurrentPage('groupList')
    setSelectedGroup(null)
    setEditingPayment(null)
  }

  const goToGroupCreate = () => {
    setCurrentPage('groupCreate')
  }

  const goToGroupDetail = (group) => {
    setSelectedGroup(group)
    setCurrentPage('groupDetail')
    setEditingPayment(null)
  }

  // 新規支払い追加
  const goToPaymentAdd = () => {
    setEditingPayment(null)
    setCurrentPage('paymentAdd')
  }

  // 編集モードで支払い追加画面へ移動する
  const goToPaymentEdit = (payment) => {
    setEditingPayment(payment)
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
          onGoToPaymentEdit={goToPaymentEdit}
          onUpdateGroup={setSelectedGroup}
        />
      )}
      {currentPage === 'paymentAdd' && (
        <PaymentAdd
          group={selectedGroup}
          editingPayment={editingPayment}
          onGoToDetail={() => setCurrentPage('groupDetail')}
          onUpdateGroup={setSelectedGroup}
        />
      )}
    </div>
  )
}

export default App