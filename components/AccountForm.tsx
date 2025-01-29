import React, { useState } from 'react'

const AccountForm: React.FC = () => {
  const [values, setValues] = useState({
    email: '',
    password: '' // Initialize with defaults
  })

  return (
    <div>AccountForm</div>
  )
}

export default AccountForm 