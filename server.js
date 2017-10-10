var express = require('express');

var path = require('path');

var app = express();

var bodyParser = require('body-parser');

var mongoose = require('mongoose');
app.use(bodyParser.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, './static')));

app.set('views', path.join(__dirname, './views'));

app.set('view engine', 'ejs');
mongoose.connect('mongodb://localhost/message');
// define Schema variable
var Schema = mongoose.Schema;
// define Post Schema

var PostSchema = new mongoose.Schema({
    name:String,
 message: String, 
 _comments: [{type: Schema.Types.ObjectId, ref: 'Comment'}]
}, {timestamps: true });
// define Comment Schema
PostSchema.path('name').required(true, 'Name cannot be blank');
PostSchema.path('message').required(true, 'Message cannot be blank');

var CommentSchema = new mongoose.Schema({
 _post: {type: Schema.Types.ObjectId, ref: 'Post'},
 name: String,
 message: String,
}, {timestamps: true });

// set our models by passing them their respective Schemas
mongoose.model('Post', PostSchema);
mongoose.model('Comment', CommentSchema);
var Post = mongoose.model('Post');
var Comment = mongoose.model('Comment');
// store our models in variables

CommentSchema.path('name').required(true, 'Name cannot be blank');
CommentSchema.path('message').required(true, 'Message cannot be blank');

app.get('/', function(req, res){
    Post.find({}, false, true).populate('_comments').sort([['_id', -1]]).exec(function(err, results){
        res.render('index', {posts: results});
  });
});
app.post('/posts', function(req, res){
    var newPost = new Post({name: req.body.name, message: req.body.message});
	newPost.save(function(err){
		if(err){
			console.log(err);
			res.render('index', {errors: newPost.errors});
		} else {
			console.log(newPost)
			res.redirect('/');
		}
	})
})

app.post("/comment/:id", function(req, res){
	var post_id = req.params.id;
	Post.findOne({_id: post_id},  function(err, post){
		var newComment = new Comment({name: req.body.name, message: req.body.message});
		newComment._post = post._id;
		Post.update({_id: post._id}, {$push: {"_comments": newComment}}, function(err){

		});
		newComment.save(function(err){
			if(err){
				console.log(err);
				res.render('index', {errors: newComment.errors});
			} else {
				console.log("comment");
				res.redirect("/");
			}
		});
	});
});

app.listen(8000, function() {
    console.log("listening on port 8000");
});
