export default function Footer() {
  return (
    <footer className="footer-v2">
      <div className="footer-v2-grid">
        <div className="footer-brand">
          <h3>📦 Đa Năng Rental</h3>
          <p className="footer-quote">
            "Không chỉ là nơi cho thuê thiết bị, mà còn là người bạn đồng hành cho mọi nhu cầu.
            Đa dạng sản phẩm, giá cả hợp lý, giúp bạn có đúng thứ mình cần đúng lúc cần."
          </p>
        </div>

        <div className="footer-contact">
          <h4>Liên hệ</h4>
          <p>🏠 Địa chỉ: 374 Cách mạng tháng 8, Đà Nẵng</p>
          <p>☎️ Hotline & Zalo: 0852 192 629</p>
          <p>🕐 Giờ hoạt động: 7h - 20h (hằng ngày)</p>
        </div>

        <div className="footer-links">
          <h4>Thông tin</h4>
          <p>Điều kiện giao dịch chung</p>
          <p>Vận chuyển và giao nhận</p>
          <p>Các phương thức thanh toán</p>
          <p>Chính sách bảo mật</p>
        </div>
      </div>

      <div className="footer-bottom">
        <p>
          © {new Date().getFullYear()} Đa Năng Rental — Đồ án hệ thống quản lý cho thuê thiết bị,
          phụ kiện đa năng.
        </p>
      </div>
    </footer>
  )
}