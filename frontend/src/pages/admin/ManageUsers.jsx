import { useEffect, useState } from 'react'
import { getUsers, updateUserStatus } from '../../services/userService'

export default function ManageUsers() {
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)

  function loadUsers() {
    setLoading(true)
    getUsers()
      .then(setUsers)
      .catch(() => setUsers([]))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    loadUsers()
  }, [])

  async function toggleStatus(user) {
    const newStatus = user.status === 'active' ? 'locked' : 'active'
    await updateUserStatus(user.id, newStatus)
    loadUsers()
  }

  return (
    <div className="admin-page">
      <h1>Quản lý người dùng</h1>

      {loading ? (
        <p>Đang tải...</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Trạng thái</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td>{u.id}</td>
                <td>{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.role}</td>
                <td>{u.status}</td>
                <td>
                  <button onClick={() => toggleStatus(u)}>
                    {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                  </button>
                </td>
              </tr>
            ))}
            {users.length === 0 && (
              <tr>
                <td colSpan="6">Chưa có người dùng nào.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  )
}