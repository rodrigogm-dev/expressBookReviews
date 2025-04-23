const express = require('express')
let books = require('./booksdb.js')
let forRegistration = require('./auth_users.js').forRegistration
let users = require('./auth_users.js').users
const public_users = express.Router()
const axios = require('axios')

public_users.post('/register', (req, res) => {
  const { username, password } = req.body

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: 'Username and password are required' })
  }

  if (!forRegistration(username)) {
    return res.status(409).json({ message: 'Username already exists' })
  }

  users.push({ username, password })
  return res.status(200).json({ message: 'User registered successfully' })
})

const getBooks = () => {
  return new Promise((resolve, reject) => {
    if (Object.keys(books).length > 0) {
      resolve(books)
    } else {
      reject('There are no books')
    }
  })
}

const getBookByISBN = isbn => {
  return new Promise((resolve, reject) => {
    const book = Object.values(books).find(book => book.isbn === isbn)
    if (book) resolve(book)
    else reject('Book not found')
  })
}

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn

  getBookByISBN(isbn)
    .then(book => res.status(200).json(book))
    .catch(error => res.status(404).json({ message: error }))
})

public_users.get('/', (req, res) => {
  getBooks()
    .then(data => res.status(200).json(data))
    .catch(error => res.status(404).json({ message: error }))
})

// Get book details based on author
public_users.get('/author/:author', async (req, res) => {
  const author = req.params.author

  try {
    const response = await axios.get('http://localhost:5000/')
    const allBooks = response.data

    const booksByAuthor = Object.values(allBooks).filter(
      book => book.author === author
    )

    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor)
    } else {
      return res.status(404).json({ message: 'No books found' })
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message })
  }
})

// Get all books based on title
public_users.get('/title/:title', async (req, res) => {
  const title = req.params.title

  if (!title) {
    return res.status(400).json({ message: 'Title is required' })
  }

  try {
    const response = await axios.get('http://localhost:5000/')
    const allBooks = response.data

    const booksByTitle = Object.values(allBooks).filter(
      book => book.title === title
    )

    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle)
    } else {
      return res.status(404).json({ message: 'No books found' })
    }
  } catch (error) {
    return res
      .status(500)
      .json({ message: 'Error fetching books', error: error.message })
  }
})

//  Get book review
public_users.get('/review/:isbn', function (req, res) {
  const isbn = req.params.isbn
  if (isbn) {
    const book = Object.values(books).find(book => book.isbn === isbn)

    if (Object.keys(book.reviews).length === 0) {
      res.json({ message: 'No reviews for this book yet.' })
    } else {
      res.json(book.reviews)
    }
  } else {
    res.status(404).json({ message: 'No book found' })
  }
})

module.exports.general_routes = public_users
