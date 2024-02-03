var express = require('express')
var app = express();
var bodyParser = require('body-parser');
var mongoose = require('mongoose')
var imgSchema = require('./model.js');
var fs = require('fs');
var path = require('path');
app.set("view engine", "ejs");
require('dotenv').config();

mongoose.connect(process.env.MONGO_URL)
.then(console.log("DB Connected"))

app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())

var multer = require('multer');

var storage = multer.diskStorage({
	destination: (req, file, cb) => {
		cb(null, 'uploads')
	},
	filename: (req, file, cb) => {
		cb(null, file.fieldname + '-' + Date.now())
	}
});

var upload = multer({ storage: storage });


const user= mongoose.model('user', {
	name: String,
	email: String,
	password: String
});






app.get('/imagePage', (req, res) => {
	imgSchema.find({})
	.then((data, err)=>{
		if(err){
			console.log(err);
		}
		res.render('imagePage',{items: data})
	})
});


app.post('/imagePage', upload.single('image'), (req, res, next) => {
    var obj = {
        name: req.body.name,
        desc: req.body.desc,
        img: {
            data: fs.readFileSync(path.join(__dirname + '/uploads/' + req.file.filename)),
            contentType: 'image/png'
        }
    };

    imgSchema.create(obj)
        .then((item) => {
            item.save();
            // Redirect to '/viewPage' after successful image upload
            res.redirect('/viewPage');
        })
        .catch((err) => {
            console.log(err);
            res.status(500).send("Internal Server Error");
        });
});



app.get('/viewPage', (req, res) => {
	imgSchema.find({})
	.then((data, err)=>{
		if(err){
			console.log(err);
		}
		res.render('viewPage',{items: data})
	})
});


app.get('/', (req, res) => {
	res.render('home');
});

app.get('/login', (req, res) => {
	res.render('login');
});


app.post('/login', async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const validUser = await user.findOne({
            email: email,
            password: password
        });

        if (validUser) {
            res.redirect('/viewPage');
        } else {
            res.send("Invalid credentials");
        }
    } catch (err) {
        console.log(err);
        res.status(500).send("Internal Server Error");
    }
});






app.get('/signup', (req, res) => {
	res.render('signup');
});



app.post('/signup', (req, res) => {
	var myData = new user(req.body);
	myData.save()
	.then(item => {
		res.redirect('/login');
	})
	.catch(err => {
		res.status(400).send("unable to save to database");
	});
});



app.get('/options', (req, res) => {
	res.render('options');
});


var port = process.env.PORT || '3000'
app.listen(port, err => {
	if (err)
		throw err
	console.log('Server listening on port', port)
})
