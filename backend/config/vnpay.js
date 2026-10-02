// Cấu hình VNPay — lấy từ biến môi trường (.env), KHÔNG hard-code secret trong code.

console.log('[DEBUG] VNPAY_TMN_CODE =', process.env.VNPAY_TMN_CODE)
console.log('[DEBUG] VNPAY_HASH_SECRET =', process.env.VNPAY_HASH_SECRET)

module.exports = {
  vnp_TmnCode: process.env.VNPAY_TMN_CODE,
  vnp_HashSecret: process.env.VNPAY_HASH_SECRET,
  vnp_Url: process.env.VNPAY_URL || 'https://sandbox.vnpayment.vn/paymentv2/vpcpay.html',
  vnp_ReturnUrl:
    process.env.VNPAY_RETURN_URL ||
    `${process.env.FRONTEND_URL || 'http://localhost:5173'}/payment-result`,
}