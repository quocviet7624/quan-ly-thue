const crypto = require('crypto')
const qs = require('qs')

function sortObject(obj) {
  const sorted = {}
  const keys = Object.keys(obj).sort()
  for (const key of keys) {
    sorted[key] = obj[key]
  }
  return sorted
}

function formatDate(date) {
  const pad = (n) => n.toString().padStart(2, '0')
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  )
}

/**
 * Tạo URL thanh toán VNPay.
 * @param {object} config - { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl }
 * @param {object} params - { orderId, amount (VNĐ, chưa nhân 100), orderInfo, ipAddr }
 * @returns {{ paymentUrl: string, vnp_TxnRef: string }}
 */
function buildPaymentUrl(config, { orderId, amount, orderInfo, ipAddr }) {
  const { vnp_TmnCode, vnp_HashSecret, vnp_Url, vnp_ReturnUrl } = config

  if (!vnp_TmnCode || !vnp_HashSecret) {
    throw new Error(
      'Thiếu cấu hình VNPay (VNPAY_TMN_CODE / VNPAY_HASH_SECRET). Kiểm tra file .env.'
    )
  }

  const date = new Date()
  const createDate = formatDate(date)
  const vnp_TxnRef = `${orderId}_${date.getTime()}`

  let vnp_Params = {
    vnp_Version: '2.1.0',
    vnp_Command: 'pay',
    vnp_TmnCode,
    vnp_Locale: 'vn',
    vnp_CurrCode: 'VND',
    vnp_TxnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: 'other',
    vnp_Amount: Math.round(amount) * 100, // VNPay yêu cầu nhân 100 (không có phần thập phân)
    vnp_ReturnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
  }

  vnp_Params = sortObject(vnp_Params)
  const signData = qs.stringify(vnp_Params, { encode: false })
  const hmac = crypto.createHmac('sha512', vnp_HashSecret)
  const signed = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')
  vnp_Params.vnp_SecureHash = signed

  const paymentUrl = `${vnp_Url}?${qs.stringify(vnp_Params, { encode: false })}`
  return { paymentUrl, vnp_TxnRef }
}

/**
 * Kiểm tra chữ ký của VNPay khi redirect/IPN trả về.
 * @param {string} vnp_HashSecret
 * @param {object} query - req.query nhận từ VNPay
 * @returns {boolean}
 */
function verifyReturn(vnp_HashSecret, query) {
  const vnp_Params = { ...query }
  const secureHash = vnp_Params.vnp_SecureHash
  delete vnp_Params.vnp_SecureHash
  delete vnp_Params.vnp_SecureHashType

  const sorted = sortObject(vnp_Params)
  const signData = qs.stringify(sorted, { encode: false })
  const hmac = crypto.createHmac('sha512', vnp_HashSecret)
  const checkSum = hmac.update(Buffer.from(signData, 'utf-8')).digest('hex')

  return Boolean(secureHash) && checkSum === secureHash
}

module.exports = { sortObject, buildPaymentUrl, verifyReturn }