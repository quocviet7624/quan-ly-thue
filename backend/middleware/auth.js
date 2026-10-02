const jwt = require('jsonwebtoken')
require('dotenv').config()

function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Chưa đăng nhập' })
  }

  const token = authHeader.split(' ')[1]
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // { id, role }
    next()
  } catch {
    return res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' })
  }
}

// Chỉ Admin được truy cập - dùng cho: quản lý tài khoản/phân quyền, quản lý danh mục, xóa đơn, thống kê doanh thu
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Chỉ quản trị viên mới có quyền thực hiện thao tác này' })
  }
  next()
}

// Nhân viên hoặc Admin đều được - dùng cho: quản lý sản phẩm, xử lý đơn, tạo đơn tại quầy
function requireStaff(req, res, next) {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này' })
  }
  next()
}

// Cho phép vào khu vực quản trị nói chung (cả admin lẫn staff), phân quyền chi tiết hơn do requireAdmin/requireStaff đảm nhiệm ở từng route
function requireAdminArea(req, res, next) {
  if (req.user.role !== 'staff' && req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Bạn không có quyền truy cập khu vực quản trị' })
  }
  next()
}

module.exports = { verifyToken, requireAdmin, requireStaff, requireAdminArea }