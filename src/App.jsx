import { useState } from 'react'
import GroupList from './pages/GroupList'
import GroupCreate from './pages/GroupCreate'
import GroupDetail from './pages/GroupDetail'
import PaymentAdd from './pages/PaymentAdd'
import Toast from './components/Toast'

function App() {
  const [currentPage, setCurrentPage] = useState('groupList')
  const [selectedGroup, setSelectedGroup] = useState(null)
  const [editingPayment, setEditingPayment] = useState(null)
  const [groups, setGroups] = useState(() => {
    const saved = localStorage.getItem('groups')
    return saved ? JSON.parse(saved) : []
  })
  // トースト通知のメッセージを管理する
  const [toastMessage, setToastMessage] = useState('')

  // トースト通知を表示する（2秒後に自動で消える）
  const showToast = (message) => {
    setToastMessage(message)
    setTimeout(() => setToastMessage(''), 2000)
  }

  const updateGroups = (newGroups) => {
    setGroups(newGroups)
    localStorage.setItem('groups', JSON.stringify(newGroups))
  }

  const goToGroupList = () => {
    const saved = localStorage.getItem('groups')
    setGroups(saved ? JSON.parse(saved) : [])
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

  const goToPaymentAdd = () => {
    setEditingPayment(null)
    setCurrentPage('paymentAdd')
  }

  const goToPaymentEdit = (payment) => {
    setEditingPayment(payment)
    setCurrentPage('paymentAdd')
  }

  const handleUpdateGroup = (updatedGroup) => {
    const newGroups = groups.map((g) =>
      g.id === updatedGroup.id ? updatedGroup : g
    )
    updateGroups(newGroups)
    setSelectedGroup(updatedGroup)
  }

  return (
    <div className="app-container">
      {currentPage === 'groupList' && (
        <GroupList
          groups={groups}
          onGoToCreate={goToGroupCreate}
          onGoToDetail={goToGroupDetail}
        />
      )}
      {currentPage === 'groupCreate' && (
        <GroupCreate
          onGoToList={(msg) => {
            goToGroupList()
            if (msg) showToast(msg)
          }}
        />
      )}
      {currentPage === 'groupDetail' && (
        <GroupDetail
          group={selectedGroup}
          onGoToList={goToGroupList}
          onGoToPaymentAdd={goToPaymentAdd}
          onGoToPaymentEdit={goToPaymentEdit}
          onUpdateGroup={handleUpdateGroup}
          onShowToast={showToast}
        />
      )}
      {currentPage === 'paymentAdd' && (
        <PaymentAdd
          group={selectedGroup}
          editingPayment={editingPayment}
          onGoToDetail={(msg) => {
            setCurrentPage('groupDetail')
            if (msg) showToast(msg)
          }}
          onUpdateGroup={handleUpdateGroup}
        />
      )}

      {/* トースト通知 */}
      <Toast message={toastMessage} />
    </div>
  )
}

export default App