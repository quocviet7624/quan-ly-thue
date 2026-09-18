const originTags = [
  'Lắng nghe nhu cầu thực tế',
  'Chọn lọc thiết bị dễ sử dụng',
  'Kiểm định độ an toàn và bền bỉ',
  'Tập trung vào trải nghiệm khách hàng',
]

const coreValues = [
  { title: 'Thật thà', desc: 'Nói đúng khả năng, cho thuê đúng chất lượng - không hứa hẹn thừa.' },
  { title: 'Chỉn chu', desc: 'Mỗi món đồ đều được kiểm tra, vệ sinh trước và sau khi thuê.' },
  { title: 'Thân thiện', desc: 'Hỗ trợ nhẹ nhàng, không thúc ép, luôn sẵn sàng lắng nghe.' },
  { title: 'Chuyên tâm', desc: 'Làm nghề bằng sự chăm chút - vì chúng tôi cũng yêu thiên nhiên như bạn.' },
  { title: 'Linh hoạt', desc: 'Tùy theo nhu cầu, không áp đặt combo, không ràng buộc.' },
  { title: 'Trách nhiệm', desc: 'Giao đúng cam kết - để bạn yên tâm mà đi.' },
]

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero giới thiệu */}
      <section className="about-hero full-bleed">
        <div className="full-bleed-inner">
          <p className="about-eyebrow">Giới thiệu dịch vụ</p>
          <h1 className="about-hero-title">
            Dã Ngoại Rental – Thiết bị chỉn chu, trải nghiệm trọn vẹn
          </h1>
          <p className="about-hero-desc">
            Mỗi chuyến đi bắt đầu bằng một hành trang gọn gàng. Với Dã Ngoại Rental, bạn không chỉ
            thuê thiết bị dã ngoại - bạn mang theo sự an tâm, cảm hứng và tinh thần sẵn sàng cho
            những trải nghiệm giữa thiên nhiên.
          </p>
        </div>
      </section>

      {/* Khởi nguồn */}
      <section className="about-section full-bleed">
        <div className="full-bleed-inner about-grid-2col">
          <div className="about-image-collage">
            <img
              src="https://picsum.photos/id/1043/500/400"
              alt="Khởi nguồn dịch vụ"
              className="about-img about-img-back"
            />
            <img
              src="https://picsum.photos/id/1015/380/300"
              alt="Chuyến đi dã ngoại"
              className="about-img about-img-front"
            />
          </div>

          <div className="about-text-block">
            <p className="about-section-tag">/ 01</p>
            <h2 className="about-section-heading">Khởi Nguồn</h2>
            <p>
              Có những ngày cuối tuần, chỉ cần rời thành phố một đoạn, dựng tạm chiếc lều bên suối
              mát hay dưới tán cây rừng, ta đã thấy lòng nhẹ tênh. Nhưng không phải ai cũng có đủ đồ
              nghề để bắt đầu.
            </p>
            <p>
              Dã Ngoại Rental được sinh ra từ chính sự thiếu thốn nhỏ ấy - và cả mong muốn sẻ chia.
              Chúng tôi cho thuê những món đồ cần thiết để bạn không cần sắm sửa vội vàng: từ lều
              trại, bếp nướng đến đèn pin và túi ngủ.
            </p>

            <div className="about-chip-grid">
              {originTags.map((tag) => (
                <span className="about-chip" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Dịch vụ cho thuê thiết bị */}
      <section className="about-section about-section-alt full-bleed">
        <div className="full-bleed-inner about-grid-2col about-grid-reverse">
          <div className="about-text-block">
            <p className="about-section-tag">/ 02</p>
            <h2 className="about-section-heading">Dịch Vụ Cho Thuê Thiết Bị</h2>
            <p>
              Từ một chiếc lều 2 người đến một bộ bàn ghế nhỏ gọn, từ bếp gas mini đến đèn chiếu
              sáng dịu nhẹ trong đêm - tất cả đều có sẵn tại Dã Ngoại Rental.
            </p>
            <p>
              Chúng tôi chuẩn bị sẵn sàng từng món đồ: sạch sẽ, đầy đủ phụ kiện, dễ sử dụng. Mỗi
              khách hàng khi nhận thiết bị đều cảm thấy như có người bạn thân đã lo chu toàn trước.
            </p>

            <blockquote className="about-quote">
              "Thiết bị đầy đủ, sạch sẽ, chất lượng tốt. Nhờ Dã Ngoại Rental mà nhóm mình có buổi
              cắm trại đầu tiên rất suôn sẻ và vui vẻ!"
              <footer>— Hoàng Nhật, Khách thuê thiết bị</footer>
            </blockquote>
          </div>

          <img
            src="https://picsum.photos/id/1016/560/480"
            alt="Thiết bị dã ngoại"
            className="about-img-single"
          />
        </div>
      </section>

      {/* Vận hành & chăm sóc */}
      <section className="about-section full-bleed">
        <div className="full-bleed-inner about-grid-2col">
          <img
            src="https://picsum.photos/id/1024/560/480"
            alt="Vận hành và chăm sóc thiết bị"
            className="about-img-single"
          />

          <div className="about-text-block">
            <p className="about-section-tag">/ 03</p>
            <h2 className="about-section-heading">Vận Hành &amp; Chăm Sóc</h2>
            <p>
              Khi bạn đặt thuê, chúng tôi không chỉ giao đồ. Chúng tôi chuẩn bị kỹ, kiểm tra từng bộ
              phận nhỏ, gấp gọn và sẵn sàng để bạn chỉ việc dùng.
            </p>
            <p>
              Sau mỗi lần sử dụng, đồ được vệ sinh sạch sẽ, phơi khô và kiểm tra kỹ lưỡng trước khi
              quay lại kho. Với chúng tôi, mỗi món đồ đều có một câu chuyện, một lần phục vụ - và cần
              được chăm chút đúng nghĩa.
            </p>

            <div className="about-chip-grid">
              <span className="about-chip">Thiết bị đã sẵn sàng</span>
              <span className="about-chip">Chăm sóc sau sử dụng</span>
            </div>
          </div>
        </div>
      </section>

      {/* Giá trị cốt lõi */}
      <section className="about-values-section full-bleed">
        <div className="full-bleed-inner">
          <p className="about-eyebrow">Giá trị cốt lõi</p>
          <h2 className="about-values-heading">
            Dụng cụ chỉ là phương tiện – trải nghiệm mới là đích đến
          </h2>
          <p className="about-values-desc">
            Tại Dã Ngoại Rental, mỗi thiết bị được chọn lựa không chỉ vì chức năng, mà còn vì cảm
            giác nó mang lại. Một đêm ngủ ngon trong lều ấm, một bữa tối bên bếp than đỏ lửa - tất
            cả bắt đầu từ sự chuẩn bị chỉn chu.
          </p>

          <div className="core-values-grid">
            {coreValues.map((v) => (
              <div className="core-value-item" key={v.title}>
                <h3>{v.title}</h3>
                <p>{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Bản đồ vị trí */}
      <section className="about-map-section full-bleed">
        <div className="full-bleed-inner">
          <h2 className="about-values-heading">Ghé thăm cửa hàng của chúng tôi</h2>
          <div className="map-wrapper">
            <iframe
              title="Bản đồ cửa hàng Dã Ngoại Rental"
              src="https://maps.google.com/maps?q=374%20C%C3%A1ch%20M%E1%BA%A1ng%20Th%C3%A1ng%20T%C3%A1m%2C%20C%E1%BA%A9m%20L%E1%BB%87%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&z=15&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>

            <div className="map-info-card">
              <p className="map-info-name">Dã Ngoại Rental</p>
              <p className="map-info-address">374 Cách Mạng Tháng 8, Cẩm Lệ, Đà Nẵng</p>
              <div className="map-info-rating">
                <span className="star-filled">★★★★★</span>
                <span>5.0 (đánh giá khách hàng)</span>
              </div>
              <a
                href="https://zalo.me/0900000000"
                className="btn-primary map-info-btn"
              >
                Liên hệ ngay
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}