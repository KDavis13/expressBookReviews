const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
  const user = users.find(u => u.username === username);
  return user !== undefined;
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
  const user = users.find(u => u.username === username && u.password === password);
  return user !== undefined;
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;
  console.log('[LOGIN] Body recibido:', { username, password });
  if (authenticatedUser(username, password)) {
    const token = jwt.sign({ username }, "access", { expiresIn: "1h" });
    req.session.authorization = token;
    console.log('[LOGIN] Token generado y guardado en session.authorization');
    console.log('[LOGIN] Session ahora:', req.session);
    return res.status(200).json({message: "User successfully logged in"});
  } else {
    console.log('[LOGIN] Credenciales inválidas');
    return res.status(401).json({message: "Invalid username or password"});
  }
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  const { review } = req.body;
  console.log('[REVIEW] Intento de agregar review. Params:', isbn, 'Body:', review);
  if(!req.user){
    console.log('[REVIEW] req.user no está definido (middleware no pasó)');
    return res.status(401).json({message: 'Not authorized (no user in request)'});
  }
  const username = req.user.username;
  console.log('[REVIEW] Usuario autenticado detectado:', username);

  const book = Object.values(books).find(b => b.isbn === isbn);
  if (book) {
    book.reviews[username] = review;
    console.log('[REVIEW] Review almacenada correctamente');
    return res.status(200).json({message: "Review added/updated successfully"});
  } else {
    console.log('[REVIEW] Libro no encontrado para ISBN', isbn);
    return res.status(404).json({message: "Book not found"});
  }
});

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;
  if(!req.user){
    return res.status(401).json({message: 'Not authorized (no user in request)'});
  }
  const username = req.user.username;

  const book = Object.values(books).find(b => b.isbn === isbn);
  if (book) {
    if(book.reviews[username]){
      delete book.reviews[username];
      return res.status(200).json({message: "Review deleted successfully"});
    } else {
      return res.status(404).json({message: "Review by this user not found"});
    }
  } else {
    return res.status(404).json({message: "Book not found"});
  }
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
