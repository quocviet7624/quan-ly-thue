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
  { title: 'Chuyên tâm', desc: 'Làm nghề bằng sự chăm chút - dù bạn thuê gì, chúng tôi cũng để tâm như nhau.' },
  { title: 'Linh hoạt', desc: 'Tùy theo nhu cầu, không áp đặt combo, không ràng buộc.' },
  { title: 'Trách nhiệm', desc: 'Giao đúng cam kết - để bạn yên tâm sử dụng.' },
]

export default function AboutUs() {
  return (
    <div className="about-page">
      {/* Hero giới thiệu */}
      <section className="about-hero full-bleed">
        <div className="full-bleed-inner">
          <p className="about-eyebrow">Giới thiệu dịch vụ</p>
          <h1 className="about-hero-title">
            Đa Năng Rental – Thiết bị đa dạng, thuê nhanh, dùng an tâm
          </h1>
          <p className="about-hero-desc">
            Dù bạn cần thiết bị cho một chuyến đi, một sự kiện, hay chỉ đơn giản là một món đồ dùng
            tạm thời - Đa Năng Rental luôn có sẵn để bạn thuê đúng thứ mình cần, đúng lúc mình cần,
            mà không phải bỏ tiền mua một món đồ chỉ dùng vài lần.
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
              alt="Đa dạng thiết bị cho thuê"
              className="about-img about-img-front"
            />
          </div>

          <div className="about-text-block">
            <p className="about-section-tag">/ 01</p>
            <h2 className="about-section-heading">Khởi Nguồn</h2>
            <p>
              Có những thứ ta chỉ cần dùng một lần, một dịp, hay một giai đoạn ngắn - nhưng lại phải
              bỏ ra một khoản tiền không nhỏ để sở hữu hẳn. Điều đó thật lãng phí, cả về tiền bạc lẫn
              không gian cất giữ sau này.
            </p>
            <p>
              Đa Năng Rental ra đời để giải quyết chính điều đó. Chúng tôi cho thuê đa dạng thiết bị
              và vật dụng cho nhiều nhu cầu khác nhau trong cuộc sống - từ đồ dùng cá nhân, thiết bị
              sự kiện, dụng cụ thể thao, cho đến các vật dụng chuyên biệt khác - để bạn chỉ trả tiền
              cho đúng thời gian mình sử dụng.
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
            <h2 className="about-section-heading">Dịch Vụ Cho Thuê Đa Năng</h2>
            <p>
              Từ những vật dụng nhỏ gọn cho nhu cầu cá nhân đến các thiết bị lớn hơn cho sự kiện,
              công việc hay các hoạt động ngoài trời - tất cả đều có sẵn tại Đa Năng Rental.
            </p>
            <p>
              Chúng tôi chuẩn bị sẵn sàng từng món đồ: sạch sẽ, đầy đủ phụ kiện, dễ sử dụng. Mỗi
              khách hàng khi nhận thiết bị đều cảm thấy như có người bạn thân đã lo chu toàn trước.
            </p>

            <blockquote className="about-quote">
              "Thiết bị đầy đủ, sạch sẽ, chất lượng tốt. Nhờ Đa Năng Rental mà mình tiết kiệm được
              kha khá chi phí mà vẫn có đủ đồ dùng cần thiết!"
              <footer>— Hoàng Nhật, Khách thuê thiết bị</footer>
            </blockquote>
          </div>

          <img
            src="https://picsum.photos/id/1016/560/480"
            alt="Đa dạng thiết bị cho thuê"
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
              phận nhỏ, đóng gói gọn gàng và sẵn sàng để bạn chỉ việc dùng.
            </p>
            <p>
              Sau mỗi lần sử dụng, thiết bị được vệ sinh sạch sẽ và kiểm tra kỹ lưỡng trước khi quay
              lại kho. Với chúng tôi, mỗi món đồ đều có một câu chuyện, một lần phục vụ - và cần được
              chăm chút đúng nghĩa, bất kể đó là thiết bị gì.
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
            Thiết bị chỉ là phương tiện – trải nghiệm mới là đích đến
          </h2>
          <p className="about-values-desc">
            Tại Đa Năng Rental, mỗi thiết bị được chọn lựa không chỉ vì chức năng, mà còn vì sự tiện
            lợi nó mang lại cho đúng thời điểm bạn cần. Dù là thuê cho một ngày hay một mùa, tất cả
            đều bắt đầu từ sự chuẩn bị chỉn chu.
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
              title="Bản đồ cửa hàng Đa Năng Rental"
              src="https://maps.google.com/maps?q=374%20C%C3%A1ch%20M%E1%BA%A1ng%20Th%C3%A1ng%20T%C3%A1m%2C%20C%E1%BA%A9m%20L%E1%BB%87%2C%20%C4%90%C3%A0%20N%E1%BA%B5ng&z=15&output=embed"
              width="100%"
              height="400"
              style={{ border: 0 }}
              loading="lazy"
            ></iframe>

            <div className="map-info-card">
              <p className="map-info-name">Đa Năng Rental</p>
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