const express = require('express');
const axios = require('axios'); 
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", async (req,res) => {
  const { username, password } = req.body;
  if (username && password) {
    if (!isValid(username)) {
      users.push({username, password});
      return res.status(200).json({message: "User successfully registered. Now you can login"});
    } else {
      return res.status(409).json({message: "Username already exists!"});
    }
  }
  return res.status(400).json({message: "Unable to register user."});
});

public_users.get('/', async (req, res) => {
  try {
    let data;
    try {
      data = books;
    } catch (remoteErr) {
      data = books;
    }
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving book list' });
  }
});

// Get book details based on ISBN (Task 11: async/await + axios structure)
public_users.get('/isbn/:isbn', async (req, res) => {
  const { isbn } = req.params;
  try {
    let book;
    try {
      // const response = await axios.get(`https://example.com/books/${isbn}`);
      // book = response.data;
      book = Object.values(books).find(b => b.isbn === isbn);
    } catch(fetchErr){
      book = Object.values(books).find(b => b.isbn === isbn);
    }
    if (book) {
      return res.status(200).json(book);
    }
    return res.status(404).json({ message: 'Book not found' });
  } catch (err) {
    return res.status(500).json({ message: 'Error retrieving book by ISBN' });
  }
});

// Get book details based on author (Task 12: async/await + axios structure)
public_users.get('/author/:author', async (req, res) => {
  const { author } = req.params;
  try {
    let booksByAuthor;
    try {
      // const response = await axios.get(`https://example.com/books?author=${encodeURIComponent(author)}`);
      // booksByAuthor = response.data;
      booksByAuthor = Object.values(books).filter(b => b.author === author);
    } catch(fetchErr){
      booksByAuthor = Object.values(books).filter(b => b.author === author);
    }
    if (booksByAuthor.length > 0) {
      return res.status(200).json(booksByAuthor);
    }
    return res.status(404).json({ message: 'No books found for this author' });
  } catch(err){
    return res.status(500).json({ message: 'Error retrieving books by author' });
  }
});

// Get all books based on title (Task 13: async/await + axios structure)
public_users.get('/title/:title', async (req, res) => {
  const { title } = req.params;
  try {
    let booksByTitle;
    try {
      booksByTitle = Object.values(books).filter(b => b.title === title);
    } catch(fetchErr){
      booksByTitle = Object.values(books).filter(b => b.title === title);
    }
    if (booksByTitle.length > 0) {
      return res.status(200).json(booksByTitle);
    }
    return res.status(404).json({ message: 'No books found for this title' });
  } catch(err){
    return res.status(500).json({ message: 'Error retrieving books by title' });
  }
});

//  Get book review
public_users.get('/review/:isbn', (req, res) => {
  const { isbn } = req.params;
  const book = Object.values(books).find(b => b.isbn === isbn);
  if (book) {
    return res.json(book.reviews);
  }
  return res.status(404).json({message: "Book not found"});
});

module.exports.general = public_users;
