const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Username and password are required." });
  }

  // Check if username already exists
  if (users.find((user) => user.username === username)) {
    return res.status(409).json({ message: "Username already exists." });
  }

  // Add the new user to the users array
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully!" });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).json(books);
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const booksByAuthor = [];

  // Iterate through the books object
  for (let key in books) {
    if (books[key].author === author) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  } else {
    return res
      .status(404)
      .json({ message: `Books by author ${author} not found.` });
  }
});

// Get all books based on title
// Get book details based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const booksByTitle = [];

  // Iterate through the books object
  for (let key in books) {
    if (books[key].title === title) {
      booksByTitle.push(books[key]);
    }
  }

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res
      .status(404)
      .json({ message: `Books with title ${title} not found.` });
  }
});

//  Get book review
// Get book review based on ISBN
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: `Book with ISBN ${isbn} not found.` });
  }
});

const getBooks = () => {
  return new Promise((resolve, reject) => {
    resolve(books);
  });
};

const getByISBN = (isbn) => {
  return new Promise((resolve, reject) => {
    let isbnNum = parseInt(isbn);
    if (books[isbnNum]) {
      resolve(books[isbnNum]);
    } else {
      reject({ status: 404, message: `ISBN ${isbn} not found` });
    }
  });
};

public_users.get("/", async function (req, res) {
  try {
    const bookList = await getBooks();
    res.json(bookList); // Neatly format JSON output
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Error retrieving book list" });
  }
});

public_users.get("/isbn/:isbn", function (req, res) {
  getByISBN(req.params.isbn).then(
    (result) => res.send(result),
    (error) => res.status(error.status).json({ message: error.message })
  );
});
// getBookByISBN("2");
// getBooksByAuthor("Chinua Achebe");
// getBooksByTitle("The Divine Comedy");

module.exports.general = public_users;
