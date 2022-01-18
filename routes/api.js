/*
*
*
*       Complete the API routing below
*       
*       
*/

'use strict';

const mongoose = require('mongoose');
console.log("DB URI:", process.env.DB);
mongoose.connect(process.env.DB, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});
let db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log("Connection successful! readyState:", db.readyState);
});

let bookSchema = new mongoose.Schema({
  title: {type: String, required: true},
  comments: [String]
});
let Book = mongoose.model('Book', bookSchema);



module.exports = function (app) {

  app.route('/api/books')
    .get(async function (req, res){
      // DONE! response will be array of book objects
      //json res format: [{"_id": bookid, "title": book_title, "commentcount": num_of_comments },...]
      let allBooks = await Book.find({});

      let resultArr = [];
      for (let b of allBooks) {
        resultArr.push({
          _id: b._id,
          title: b.title,
          commentcount: b.comments.length
        });
      }
      //console.log("All books resultArr", resultArr);      
      res.json(resultArr);
    })
    
    .post(async function (req, res){
      let title = req.body.title;
      // DONE! response will contain new book object including atleast _id and title
      if (title == undefined || title == "") return res.send('missing required field title');
      let newBook = new Book({
        title: title
      });
      await newBook.save();
      //console.log("newBook", newBook);
      res.json(newBook);
    })
    
    .delete(async function(req, res){
      //if successful response will be 'complete delete successful'
      //SPR: delete ALL books
      let result = await Book.deleteMany({});
      //console.log("Delete result: ", result);
      res.send('complete delete successful');
    });



  app.route('/api/books/:id')
    .get(async function (req, res){
      let bookid = req.params.id;
      //json res format: {"_id": bookid, "title": book_title, "comments": [comment,comment,...]}
      try {
        let book = await Book.findById(bookid);
        //console.log("Find result", book);
        if (book != null && book != undefined) {
          return res.json(book);
        }

      }
      catch {
        
      }
      res.send('no book exists');

    })
    
    .post(async function(req, res){
      /* You can send a POST request containing comment as the form body data to /api/books/{_id} to add a comment to a book. 
      The returned response will be the books object similar to GET /api/books/{_id} request in an earlier test. If comment 
      is not included in the request, return the string missing required field comment. If no book is found, return the 
      string no book exists.
      */

      // check if comment is included
      let comment = req.body.comment;
      if (comment == null || comment == undefined || comment == "") {
        return res.send("missing required field comment");
      }

      // try to find book
      let bookid = req.params.id;
      let book = undefined;
      try {
        book = await Book.findById(bookid);
        //console.log("Find result", book);
        if (book == null || book == undefined) {
          return res.send("no book exists");
        }
      }
      catch {
        return res.send("no book exists");
      }

      //console.log("Book before new comment:", book);
      book.comments.push(comment);
      //console.log("Book after new comment:", book);
      await book.save();
      res.json(book);
    })
    
    .delete(async function(req, res){
      let bookid = req.params.id;
      //if successful response will be 'delete successful'
      let book = undefined;
      try {
        book = await Book.findByIdAndDelete(bookid);
        //console.log("Find result", book);
        if (book == null || book == undefined) {
          return res.send("no book exists");
        }
      }
      catch {
        return res.send("no book exists");
      }

      //console.log("Delete one book result:", book);
      res.send('delete successful');

    });
  
};
