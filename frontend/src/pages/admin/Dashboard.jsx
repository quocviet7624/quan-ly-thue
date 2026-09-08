export default function Dashboard() {
  return (
    <div className="admin-page">
      <h1>Tổng quan</h1>
      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>Đơn thuê hôm nay</h3>
          <p className="dashboard-number">--</p>
        </div>
        <div className="dashboard-card">
          <h3>Doanh thu tháng</h3>
          <p className="dashboard-number">--</p>
        </div>
        <div className="dashboard-card">
          <h3>Thiết bị đang thuê</h3>
          <p className="dashboard-number">--</p>
        </div>
      </div>
      <p className="note-text">
        Số liệu sẽ được nối với API thống kê từ backend sau.
      </p>
    </div>
  )
}