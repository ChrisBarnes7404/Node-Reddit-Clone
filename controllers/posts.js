const Post = require('../models/post.js');
const User = require('../models/user');

module.exports = app => {
    // INDEX
    app.get('/', (req, res) => {
        const currentUser = req.user;
        // res.render('home', {});
        console.log(req.cookies);
        Post.find().populate('author')
            .lean()
            .then(posts => {
                res.render('posts-index', { posts, currentUser });
                // res.render('home', {});
            }).catch(err => {
                console.log(err.message);
            })
    })

    // PROFILES
    app.get('/users/:username', (req, res) => {
        const currentUser = req.user;
        Post.find({ username: req.params.username }).populate({ path: 'comments', populate: { path: 'username' } }).populate('username')
            .lean()
            .then(posts => {
                res.render('posts-index', { posts, currentUser });
            }).catch(err => {
                console.log(err.message);
            })
    })

    //NEW
    app.get("/posts/new", (req, res) => {
        const currentUser = req.user;
        res.render("posts-new.hbs", { currentUser });
    });

    // CREATE
    app.post("/posts/new", (req, res) => {
        if (req.user) {
            const post = new Post(req.body);
            post.author = req.user._id;

            post
                .save()
                .then(post => {
                    return User.findById(req.user._id);
                })
                .then(user => {
                    user.posts.unshift(post);
                    user.save();
                    // REDIRECT TO THE NEW POST
                    res.redirect(`/posts/${post._id}`);
                })
                .catch(err => {
                    console.log(err.message);
                });
        } else {
            return res.status(401); // UNAUTHORIZED
        }
    });

    // SHOW One Post
    app.get("/posts/:id", function (req, res) {
        const currentUser = req.user;
        // LOOK UP THE POST

        Post.findById(req.params.id).populate({ path: 'comments', populate: { path: 'author' } }).populate('author')
            .lean()
            .then(post => {
                res.render("posts-show", { post, currentUser });
            })
            .catch(err => {
                console.log(err.message);
            });
    });

    // SUBREDDIT
    app.get("/n/:subreddit", function (req, res) {
        const currentUser = req.user;
        Post.find({ subreddit: req.params.subreddit }).populate('author')
            .lean()
            .then(posts => {
                res.render("posts-index", { posts, currentUser });
            })
            .catch(err => {
                console.log(err);
            });
    });
};