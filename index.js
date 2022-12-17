const express = require('express');
const app = express();
const path = require('path');
const engine = require('ejs-mate');
const methodOverride = require('method-override');
const session  = require('express-session');
const mongoose = require('mongoose');
const passport = require('passport');
const LocalStrategy = require('passport-local');
const User = require('./models/user');
const flash = require('connect-flash');

mongoose.connect('mongodb://localhost:27017/Student-DB', {
    useNewUrlParser: true,
    useUnifiedTopology: true,

})
    .then(() => {
        console.log("Database Connected!!!");
    })
    .catch((err) => {
        console.log("ERROR! Connecting to Database.");
        console.log(err);
    });


const sessionConfig = {
    name : 'cointab',
    secret : 'thisisasecret!',
    resave : false,
    saveUninitialized : true,
    cookie:{
        httpOnly:true,
        expires: Date.now + 1000 * 60 * 60 *24,
        maxAge:1000 * 60 * 60 *24
    }
}
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.engine('ejs', engine);
app.use(methodOverride('_method'));
app.use(flash());
app.use(session(sessionConfig));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser);
passport.deserializeUser(User.deserializeUser);


app.use((req, res, next)=>{
    res.locals.success = req.flash('success');
    res.locals.error = req.flash('error');
    next();
})

app.get('/', (req, res)=> {
    res.send("Hello from conitab assignment");
});

app.get('/fakeuser', async(req, res) => {
    const user = new User({email : 'omkar@gmail.com', username : 'omkar94'});
    const newUser = await User.register(user, 'chicken');
    res.send(newUser);

});

app.get('/register', (req, res) => {
    res.render('register');
});

app.post('/registeruser', async(req, res) => {
    const {uname, email, password} =req.body;
    const user = new User({email : email, username : uname});
    await User.register(user, password);
    req.flash('success', 'Registred Successfully');
    res.redirect('/login');
});

app.get('/allusers', async(req ,res) => {
    const allUsers = await User.find({});
    res.render('users', {allUsers});
});

app.get('/view/:id', async(req, res) => {
    const user = await User.findById({_id : req.params.id});
    res.render('user', {user});    
});

app.get('/edit/:id', async(req, res) => {
    const editUser = await User.findById({_id : req.params.id});
    res.render('edituser', {editUser});
    
});

app.put('/edit/:id', async(req, res) => {
    const {id} = req.params.id;
    const username = req.body.uname;
    await User.findByIdAndUpdate(id, { username: username });
    res.redirect(`/view/${id}`);

});

app.delete('/delete/:id', async(req, res) => {
    const {id} = req.params;
    //const user = await User.findById({_id : id});
    await User.deleteOne({_id : id})
    res.redirect('/allusers');
    //await Character.deleteOne({ email : email, username : uname });

});

app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', passport.authenticate('local',{ failureFlash:true, failureRedirect : '/login'}), (req,res)=>{
    
   
    
    res.redirect('/allusers');
});

app.listen(3000, () => {
    console.log('Serving on PORT 3000');
});
