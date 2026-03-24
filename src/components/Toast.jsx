function Toast({ message }) {
  if (!message) return null

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      left: '50%',
      transform: 'translateX(-50%)',
      backgroundColor: '#2E2C28',
      color: 'white',
      padding: '12px 24px',
      borderRadius: '24px',
      fontSize: '14px',
      fontWeight: '500',
      zIndex: 100,
      whiteSpace: 'nowrap',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      animation: 'fadeInUp 0.2s ease',
    }}>
      {message}
    </div>
  )
}

export default Toast