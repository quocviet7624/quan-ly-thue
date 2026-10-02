import { useEffect, useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { getUsers, updateUserRole, updateUserStatus } from '../../services/userService'
import { ROLE_LABELS, ROLE_OPTIONS } from '../../utils/roles'

const errMsg = (err, fallback) => err.response?.data?.message || fallback

export default function ManageUsers() {
  const { user: me } = useAuth()
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
    try {
      await updateUserStatus(user.id, newStatus)
      loadUsers()
    } catch (err) {
      alert(errMsg(err, 'Không cập nhật được trạng thái'))
    }
  }

  async function changeRole(user, role) {
    if (role === user.role) return
    if (!window.confirm(`Đổi vai trò của "${user.full_name}" thành ${ROLE_LABELS[role]}?`)) return
    try {
      await updateUserRole(user.id, role)
      loadUsers()
    } catch (err) {
      alert(errMsg(err, 'Không đổi được vai trò'))
    }
  }

  return (
    <div className="admin-page">
      <h1>Quản lý tài khoản - phân quyền</h1>

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
            {users.map((u) => {
              const isSelf = u.id === me?.id
              return (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.full_name}</td>
                  <td>{u.email}</td>
                  <td>
                    <select
                      className="status-select"
                      value={u.role}
                      disabled={isSelf}
                      onChange={(e) => changeRole(u, e.target.value)}
                    >
                      {ROLE_OPTIONS.map((r) => (
                        <option key={r.value} value={r.value}>
                          {r.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{u.status}</td>
                  <td>
                    <button onClick={() => toggleStatus(u)} disabled={isSelf}>
                      {u.status === 'active' ? 'Khóa' : 'Mở khóa'}
                    </button>
                  </td>
                </tr>
              )
            })}
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