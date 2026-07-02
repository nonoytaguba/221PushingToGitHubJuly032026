const path = require('path'); //Lesson 176, 3:40
// const pug = require('pug'); //Lesson 176 
const express = require('express');
const morgan = require('morgan'); // lesson 60 (1:22)
const rateLimit = require('express-rate-limit')
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser') //Lesson 189
// const compression = require('compression');
const corse = require('cors'); //Lesson 226

const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');
const tourRouter = require('./routes/tourRoutes');
const userRouter = require('./routes/userRoutes');
const reviewRouter = require('./routes/reviewRoutes'); //Lesson 155
const bookingRouter = require('./routes/bookingRoutes');  //lesson 211
const viewRouter = require('./routes/viewRoutes'); //Lesson 181

//Start express app
const app = express();

//Setting Up Template Engine Lesson 176
app.set('view engine', 'pug'); //Lesson 176
app.set('views', path.join(__dirname, 'views'));

const requestTime = function (req, res, next) {
  req.requestTime = Date.now()
  // console.log(req.headers)
  next()
}

app.use(requestTime)

//1) GLOBAL MIDDLEWARES
// Implement CORS (Cross Origin Resource Sharing)
app.use(cors()); //Lesson 226
// Access-Control-Allow-Origin *
// api.natours.com, front-end natours.com
// app.use(cors({
//   origin: 'https://www.natours.com'
// }))

app.options('*', cors());
// app.options('/ap/v1/tours/:id', cors());


//Serving static files
//Note from Lesson 177
// So remember that by using express.static, we basically define that all the static assets
// will always automatically be served from a folder called public, so with this folder here.
// And so that's why when we say css slash style, that in fact comes from the public folder.
// And so this CSS folder is the folder inside of public, and the same of course for the images.
// So if in our html we have image slash favicon, then it will open up the image folder
// that is inside of our public folder.Again because we defined it so in our express application.

// app.use(express.static(`${__dirname}/public`));
app.use(express.static(path.join(__dirname, 'public'))); //Lesson 176


// Set security HTTP headers
app.use(helmet());

//lesson 189 solution
app.use(function(req, res, next) {
  res.setHeader(
    "Content-Security-Policy",
     "script-src 'self' https://cdnjs.cloudflare.com  https://js.stripe.com/v3/",
     "https://www.google.com/",
     "https://js.stripe.com/dahlia/stripe.js",
     "https://js.stripe.com/v3/"
  );
  next();
});



//Development logging
if(process.env.NODE_ENV === 'development') {
  app.use(morgan('dev')); //lesson 60 (3:00)
}

// Limit requests from same API
const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,   //windowMs is window milisenceconds
  message: 'Too many requests from this IP, please try again in an hour!'
});

app.use('/api', limiter);  // '/api' we basically want to apply this limiter only to slash API


// Body parser, reading data from the body into req.body
app.use(express.json({limit: '10kb'})); //this express.json is middleware, parses the data from the body
app.use(cookieParser()); //Lesson 189 parser the data from the cookie
app.use(express.urlencoded({extended: true, limit: '10kb'})) //Lesson 195 , parse data coming from a URL encode form.

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

    //sample entry from req.body
    // {
    //   "email": {"$gt":""},
    //   "password": "pass1234"
    // }

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(hpp({
  whitelist: ['duration', 'ratingsQuantity', 'ratingsAverage', 'maxGroupSize', 'difficulty', 'price']
}));

// app.use(compression());

// Test middleware
app.use((req, res, next) => {
  req.requesTime = new Date().toISOString();
  // consle.log(req.headers);
  // console.log("req.cookies", req.cookies) // Lesson 189, deactivate in Lesson 199
  next();
})

// 3)ROUTES

// app.get('/', (req, res) => {
//   res.status(200).render('base',{
//     tour: "The Forest Hiker",  //the variables here are called local to pug file.
//     user: "Jonas"
//   }); // Lesson 176, you must install pug..
// })


// app.get('/overview', (req, res) => {                // Lesson 180
//     res.status(200).render("overview",{
//         title: 'All Tours'
//     })
// })

// app.get('/tour', (req, res) => {                   //Lesson 180
//     res.status(200).render("tour", {
        title: 'The Forest Hiker Tour'
//     })
// })
// 



app.use('/', viewRouter); //Lesson 181 '/' here is similar to 'http://127.0.0.1:3000'
app.use('/api/v1/tours', tourRouter); //this is called mounting a new router on a route basically.
app.use('/api/v1/users', userRouter);
app.use('/api/v1/reviews', reviewRouter); //from Lesson 155
app.use('/api/v1/bookings', bookingRouter) //lesson 211, 1:40

//testing na tanggalin
// app.all('*', (req, res, next) => {
//   // res.status(404).json({
//     status: 'fail',
//   //   message: `Can't find ${req.originalUrl} on this server!`
//   // });

// // const err = new Error(`Can't find ${req.originalUrl} on this server!`);
// // err.status = 'fail';
// // err.statusCode = 404;
// // console.log(err)
// // next(err);
// next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));

// });

app.use(globalErrorHandler); 

  //4)START SERVER
module.exports = app;











