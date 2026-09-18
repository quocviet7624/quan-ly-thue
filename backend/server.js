const express = require('express')
const cors = require('cors')
const path = require('path')
require('dotenv').config()

const authRoutes = require('./routes/authRoutes')
const categoryRoutes = require('./routes/categoryRoutes')
const productRoutes = require('./routes/productRoutes')
const orderRoutes = require('./routes/orderRoutes')
const userRoutes = require('./routes/userRoutes')
const reviewRoutes = require('./routes/reviewRoutes')
const statsRoutes = require('./routes/statsRoutes')

const app = express()

app.use(cors())
app.use(express.json())

// Cho phép truy cập ảnh đã upload qua URL, VD: http://localhost:5000/uploads/products/xxx.jpg
app.use('/uploads', express.static(path.join(__dirname, 'uploads')))

app.use('/api/auth', authRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/products', productRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/users', userRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/stats', statsRoutes)

app.get('/', (req, res) => {
  res.json({ message: 'API quản lý cho thuê thiết bị dã ngoại đang chạy' })
})

const PORT = process.env.PORT || 5000
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`)
})