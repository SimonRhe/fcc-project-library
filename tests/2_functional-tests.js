/*
*
*
*       FILL IN EACH FUNCTIONAL TEST BELOW COMPLETELY
*       -----[Keep the tests in the same order!]-----
*       
*/

const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

let createdIds = []; // used between tests and to clean up at the end

suite('Functional Tests', function() {

  /*
  * ----[EXAMPLE TEST]----
  * Each test should completely test the response of the API end-point including response status code!
  */
  test('#example Test GET /api/books', function(done){
     chai.request(server)
      .get('/api/books')
      .end(function(err, res){
        assert.equal(res.status, 200);
        assert.isArray(res.body, 'response should be an array');
        assert.property(res.body[0], 'commentcount', 'Books in array should contain commentcount');
        assert.property(res.body[0], 'title', 'Books in array should contain title');
        assert.property(res.body[0], '_id', 'Books in array should contain _id');
        done();
      });
  });
  /*
  * ----[END of EXAMPLE TEST]----
  */

  suite('Routing tests', function() {


    suite('POST /api/books with title => create book object/expect book object', function() {
      
      test('Test POST /api/books with title', function(done) {
        chai.request(server)
        .post('/api/books')
        .send({title: "TEST " + (Math.random() * 10000)})
        .end(function(err, res){
          assert.equal(res.status, 200);
          assert.isObject(res.body, 'response should be an object');
          assert.property(res.body, 'title', 'Book should contain title');
          assert.property(res.body, '_id', 'Book should contain _id');
          //console.log("BOOK CREATED:", res.body._id);
          createdIds.push(res.body._id);
          done();
        });
      });
      
      test('Test POST /api/books with no title given', function(done) {
        chai.request(server)
        .post('/api/books')
        .end(function(err, res){
          assert.equal(res.status, 200);
          //console.log("res.text", res.text);
          assert.isString(res.text, 'response text should be a String');
          assert.equal(res.text, 'missing required field title', "Response should be 'missing required field title'");
          done();
        });
      });
      
    });


    suite('GET /api/books => array of books', function(){
      
      test('Test GET /api/books',  function(done){
        chai.request(server)
         .get('/api/books')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.isArray(res.body, 'response should be an array');
           for (let b of res.body) {
              assert.property(b, 'commentcount', 'Books in array should contain commentcount');
              assert.property(b, 'title', 'Books in array should contain title');
              assert.property(b, '_id', 'Books in array should contain _id');
           }
           done();
         });
     });      
      
    });


    suite('GET /api/books/[id] => book object with [id]', function(){
      
      test('Test GET /api/books/[id] with id not in db',  function(done){
        chai.request(server)
         .get('/api/books/IDNOTINDB')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.isString(res.text, 'response text should be a String');
           assert.equal(res.text, 'no book exists', "Response should be 'no book exists'");
           done();
         });
     });
      
      test('Test GET /api/books/[id] with valid id in db',  function(done){
        // get some valid id from db
        chai.request(server)
         .get('/api/books')
         .end(function(err, res){
           assert.equal(res.status, 200);
           assert.isArray(res.body, 'response should be an array');
           assert.isAbove(res.body.length, 0, 'response array must contain at least one book for test to work');
           let randomIndex = Math.floor(Math.random() * res.body.length);
           let randomBook = res.body[randomIndex];
           //console.log("res.body.length", res.body.length, "; random index:", randomIndex, "; random book:", randomBook);
           let testid = randomBook._id;
           chai.request(server)
               .get('/api/books/' + testid)
               .end(function(err, res){
                  assert.equal(res.status, 200);
                  assert.isObject(res.body, 'response should be an object');
                  assert.property(res.body, 'title', 'Book should contain title');
                  assert.property(res.body, '_id', 'Book should contain _id');
                  done();
               });
         });
      });
      
    });


    suite('POST /api/books/[id] => add comment/expect book object with id', function(){
      
      test('Test POST /api/books/[id] with comment', function(done){
        assert.isAbove(createdIds.length, 0, 'test error: no book was created to test posting comment on');
        let testComment = "This is a test comment " + Math.floor(Math.random() * 10000);
        chai.request(server)
            .post('/api/books/' + createdIds[0])
            .send({comment: testComment})
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isObject(res.body, 'response should be an object');
              assert.property(res.body, 'title', 'Book should contain title');
              assert.property(res.body, '_id', 'Book should contain _id');
              assert.equal(res.body.comments[0], testComment, "comments[0] should be same as comment sent (received: " + res.body.comments[0] + ")");
              done();
            });

      });

      test('Test POST /api/books/[id] without comment field', function(done){
        assert.isAbove(createdIds.length, 0, 'test error: no book was created to test posting comment on');
        chai.request(server)
            .post('/api/books/' + createdIds[0])
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, "missing required field comment", "Response should be 'missing required field comment'");
              done();
            });

      });

      test('Test POST /api/books/[id] with comment, id not in db', function(done){
        let testComment = "This is a test comment " + Math.floor(Math.random() * 10000);
        chai.request(server)
            .post('/api/books/NONEXISTENTID')
            .send({comment: testComment})
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isString(res.text, 'response text should be a String');
              assert.equal(res.text, 'no book exists', "Response should be 'no book exists'");
              done();
            });

      });
      
    });

    suite('DELETE /api/books/[id] => delete book object id', function() {

      test('Test DELETE /api/books/[id] with valid id in db', function(done){
        assert.isAbove(createdIds.length, 0, 'test error: no book was created to test delete');
        chai.request(server)
            .delete('/api/books/' + createdIds[0])
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.equal(res.text, 'delete successful', "Response should be 'delete successful'");
              done();
            });

      });

      test('Test DELETE /api/books/[id] with  id not in db', function(done){
        chai.request(server)
            .delete('/api/books/THISIDDOESNTEXIST')
            .end(function(err, res){
              assert.equal(res.status, 200);
              assert.isString(res.text, 'response text should be a String');
              assert.equal(res.text, 'no book exists', "Response should be 'no book exists'");
              done();
            });

    });

  });

});
});
