const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

// Check if the username is valid
const isValid = (username) => {
  // Check if the username exists in the users array
  return users.some((user) => user.username === username);
};

// Check if the username and password match
const authenticatedUser = (username, password) => {
  const user = users.find((user) => user.username === username);
  if (user && user.password === password) {
    return true;
  }
  return false;
};

// Only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  if (!isValid(username)) {
    return res.status(401).json({ message: "Invalid username." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Invalid password." });
  }

  // Generate JWT token for the session
  const token = jwt.sign({ username }, "123456", { expiresIn: "1h" });

  // Return the token to the user
  return res.status(200).json({
    message: "Login successful!",
    token,
  });
});

// Add a book review

regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.body.review;
  const username = req.user.username; // The username is stored in the req.user object

  // Check if the book exists in the database
  if (books.hasOwnProperty(isbn)) {
    const book = books[isbn];

    // Check if the user already has a review for the book
    if (book.reviews.hasOwnProperty(username)) {
      // Modify the existing review
      book.reviews[username].review = review;
      return res.status(200).json({ message: "Review modified successfully" });
    } else {
      // Add a new review for the user
      book.reviews[username] = {
        username: username,
        review: review,
      };
      return res.status(200).json({ message: "Review added successfully" });
    }
  } else {
    return res.status(404).json({ message: "Book not found" });
  }
});
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const { isbn } = req.params;

  // Decode JWT token to get the username (assuming the token is passed in the Authorization header)
  const token = req.headers.authorization.split(" ")[1]; // Extract token from 'Bearer <token>'
  let decoded;

  try {
    decoded = jwt.verify(token, "your_jwt_secret");
  } catch (err) {
    return res.status(403).json({ message: "Invalid token." });
  }

  const username = decoded.username;

  // Check if the book exists
  if (!books[isbn]) {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }

  // Check if the user has posted a review
  if (!books[isbn].reviews || !books[isbn].reviews[username]) {
    return res.status(404).json({ message: "No review found for this user." });
  }

  // Delete the review
  delete books[isbn].reviews[username];

  return res.status(200).json({
    message: `Review by user '${username}' for book with ISBN ${isbn} has been deleted.`,
    reviews: books[isbn].reviews,
  });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
