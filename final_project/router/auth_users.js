const express = require('express')
const jwt = require('jsonwebtoken')
let books = require('./booksdb.js')
const regd_users = express.Router()

let users = [
  { username: 'juan', password: '1234' },
  { username: 'ana', password: 'abcd' },
  { username: 'rodro', password: '123' }
]

const forRegistration = username => {
  // Valida si el usuario NO existe
  const userExists = users.some(user => user.username === username)
  return !userExists
}

const authenticatedUser = (username, password) => {
  return users.some(
    user => user.username === username && user.password === password
  )
}

//only registered users can login
regd_users.post('/login', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: 'Invalid credentials' })
  }

  const accessToken = jwt.sign({ username: username }, 'fingerprint_customer', {
    expiresIn: 60 * 60
  })

  req.session.authorization = {
    accessToken
  }

  return res.status(200).json({
    message: 'Login successful',
    token: accessToken // Para enviarlo por postman como cookie
  })
})

// Add a book review
regd_users.put('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const review = req.body.review
  const username = req.user?.username

  if (!isbn || !review) {
    return res.status(400).json({ message: 'ISBN and review are required' })
  }

  const book = Object.values(books).find(book => book.isbn === isbn)

  if (!book) {
    return res.status(404).json({ message: 'Book not found' })
  }

  if (!book.reviews) {
    book.reviews = {}
  }

  book.reviews[username] = review

  return res.status(200).json({
    message: 'Review added/updated successfully',
    reviews: book.reviews
  })
})

regd_users.delete('/auth/review/:isbn', (req, res) => {
  const isbn = req.params.isbn
  const username = req.user?.username

  if (!isbn) return res.status(400).json({ message: 'ISBN is required' })

  const book = Object.values(books).find(book => book.isbn === isbn)
  if (!book) return res.status(404).json({ message: 'Book not found' })

  if (!book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "You haven't reviewed this book yet" })
  }

  delete book.reviews[username]

  return res
    .status(200)
    .json({ message: 'Review deleted successfully', reviews: book.reviews })
})

module.exports.customer_routes = regd_users
module.exports.forRegistration = forRegistration
module.exports.users = users
