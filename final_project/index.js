const express = require('express')
const jwt = require('jsonwebtoken')
const session = require('express-session')
const customer_routes = require('./router/auth_users.js').customer_routes
const general_routes = require('./router/general.js').general_routes

const app = express()

app.use(express.json())

app.use(
  '/customer',
  session({
    secret: 'fingerprint_customer',
    resave: true,
    saveUninitialized: true
  })
)

app.use('/customer/auth/*', function auth (req, res, next) {
  if (req.session.authorization) {
    const token = req.session.authorization.accessToken

    jwt.verify(token, 'fingerprint_customer', (err, user) => {
      if (!err) {
        req.user = user
        next()
      } else {
        return res.status(403).json({ message: 'Invalid token' })
      }
    })
  } else {
    return res.status(401).json({ message: 'User not logged in' })
  }
})

const PORT = 5000

app.use('/customer', customer_routes)
app.use('/', general_routes)

app.listen(PORT, () => console.log('Server is running'))
