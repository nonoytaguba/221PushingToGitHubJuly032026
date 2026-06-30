const crypto = require('crypto');
// const util = require('util'); //And then on here, we are going to use the promisify method.
const {promisify} = require('util'); // we can simply destructure that object and take promisify directly from there
const jwt = require('jsonwebtoken');
const User = require('../models/userModels.js');
const catchAsync = require('../utils/catchAsync.js');
const AppError = require('../utils/appError.js');
const Email = require('../utils/email.js');

const signToken = id => {
    return jwt.sign({id: id}, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRES_IN
    });
};
//************************************************************************** */
const createSendToken = (user, statusCode, res) => {
const token = signToken(user._id);

const cookieOptions =  {
    expires: new Date(
        Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    httpOnly: true //remember, that this means that we can not manipulate the cookie in the browser in any way. Not even destroy it. Lesson 192
}

if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;

res.cookie('jwt', token, cookieOptions);

//Remove the password from the output
    user.password = undefined;

    res.status(statusCode).json({
        status: 'success',
        token,
        data: {
            user: user
        }
    });
}

//********************************************************* */

exports.signup = catchAsync(async (req, res, next) => {
    const newUser = await User.create(req.body);  //this is same as Create User

    const url = `${req.protocol}://${req.get('host')}/me`; //Lesson 207 this would only work in development and not in production
    console.log(url);
    await new Email(newUser, url).sendWelcome();  // Lesson 207

    createSendToken(newUser, 201, res )
// const newUser = await User.create({
//         name: req.body.name,
//         email: req.body.email,
//         password: req.body.password,
//         passwordConfirm: req.body.passwordConfirm,
//         passwordChangedAt: req.body.passwordChangedAt,
//         role: req.body.role
//     });
});


// //********lesson 130***************
// In this case we only issue the token
// in case that the user actually exists,
// and that the password is correct.
// //********lesson 130***************

exports.login = catchAsync(async (req, res, next) => {
    // const email = req.body.email;
    //const password = req.bod.password;
    const {email,password} = req.body; //this is object destructuring

    //1) Check if email and password exist, check kung meron input
    if(!email || !password) {
        return next(new AppError('Please provide email and password!', 400));
    }
    //2) Check if user exists && password is correct, check kung meron record sa database
    // const user = User.findOne({email:email})
    // const user = User.findOne({email})
    const user = await User.findOne({email}).select('+password');
    // console.log(user);
    const correct =  await user.correctPassword(password, user.password);

    if(!user || !correct) {
        return next(new AppError('Incorrect email or password', 401)); // 401 means unauthorized
    }

    // if(!user || !await user.correctPassword(password, user.password)){
    //     return next(new AppError('Incorrect email or password', 401))
    // }

    //3) if everything ok, send token to client
    // const token = '';   //fake token
    
    createSendToken(user, 200, res);
        
});

//Lesson 192 deleting cookie when logging out
exports.logout = (req, res) => {
    res.cookie('jwt', 'loggedout',{
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });
    res.status(200).json({status: 'success'})
}







/////////////////////////////////////////////////////////////////////////////////
// lesson 131 Protecting Tour Routes
////////////////////////////////////////////////////////////////////////////
// So let's say that we wanted to protect the
// getAllTours route.

exports.protect = catchAsync( async (req, res, next) => {
    // 1) Getting token and check if it's there
   
    let token; //Defining token variable here outside the if block, and then simply reassign a value inside the if block

    if( 
        req.headers.authorization &&
        req.headers.authorization.startsWith('Bearer')
    ){
        // NOTE:
        // const token = req.headers.authorization.split(' ')[1];   
        // Now we can't actually define a variable inside of an if block, 
        // because const, and let, so the new ES6 variable declaratory are actually block scoped,
        // and so whatever we define in this block here will then not be available outside of it.
        // Okay, and so let's actually do that outside.And then simply reassign
        // this value to the token.

        token = req.headers.authorization.split(' ')[1];
    }else if(req.cookies.jwt) {
        token = req.cookies.jwt; //Lesson 189
    }
    console.log('token', token)

    if(!token){        //Check if token already exist.
        return next(
            new AppError('you are not logged in! Pleasee log in to get access.', 401) //401 not authorized
        );
    }
    // 2) token Verification  Lesson 132 starts here
    //NOTE 1: And I hope you remember that in this step,
    // we verify if someone manipulated the data
    // or also if the token has already expired.
    // So we already used, from the JSON web token package,
     //NOTE 2: this verify here is actually an asynchronous function. 
     // So it will verify a token, and then after that, when it's done, 
     // it will then call the callback function that we can specify.
    
    //  jwt.verify(token, process.env.JWT_SECRET)

    // NOTE 3. Now, we've been working with promises all the time,
    // and I don't really want to break that pattern here.
    // And so, we are actually going to promisifying this function.
    // So basically, to make it return a promise.
    // And so that way, we can then use async await
    // just like any other async function that we've been using.



    // NOTE 4. Node actually has a built-in promisify function.
    // All we need to do in order to use it
    // is to require the built-in util module.

        const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET)
        console.log('decoded ', decoded)

    // 3) check if user still exists
   const currentUser = await User.findById(decoded.id);
   if(!currentUser) {
    return next( new AppError('The user belonging to this token does no longer exist.', 401));
   }

    // 4) Check if user changed password after the token was issued >>>19:23
//    currentUser.changedPasswordAfter(decoded.iat);


  if(currentUser.changedPasswordAfter(decoded.iat)) {
    return next(
        new AppError('User recently changed password! Please log in again.'), 401);
  };

//   GRANT ACCESS TO PROTECTED ROUTE
  req.user = currentUser;
  res.locals.user = currentUser;
    next();
});

//**************************************************************************************************** */
//Lesson 190
//Only for rendered pages, no errors!
// This middleware is really only for rendered pages so the goal here is not to protect any route
// so there will never be an error in this middleware.
//Only for rendered pages, no errors!

exports.isLoggedIn = async (req, res, next) => {
// Our token should come from the cookies and not from an authorization header
// because, of course, for rendered pages we will not have the token in the header.
// So again, for our entire rendered website the token will always only be sent
// using the cookie, and never the authorization header.
// That one is only for the api.

    if (req.cookies.jwt) {
        try{
        // 1) verify token
        const decoded = await promisify(jwt.verify)(req.cookies.jwt, process.env.JWT_SECRET);

        // 2) check if user still exists
        const currentUser = await User.findById(decoded.id);
        if(!currentUser) {
            return next();
        }

        // 3) Check if user changed password after the token was issued >>>19:23
        //    currentUser.changedPasswordAfter(decoded.iat);

        if(currentUser.changedPasswordAfter(decoded.iat)) {
            return next();
        };

        //THERE IS A LOGGED IN USER
            res.locals.user = currentUser;   //meaning, there will be a variable called user Lesson 190
            return next();
    }catch (err){
        return next();
    }
    }
    next();
};

//******************************************************************************************** */

exports.restrictTo = (...roles) => {  // this is rest parameter syntax, that creates an array of all the arguments that were specified.
    return(req, res, next) => {
         // roles ['admin', 'lead-guide'], roles = 'user'
        if(!roles.includes(req.user.role)) {
            return next(new AppError('You do not have permission to perform this action', 403)  // 403 means forbidden
        );
        }
        next();
    };
};

//From Lesson 136
exports.forgotPassword = catchAsync(async (req, res, next) => {
    // 1) Get user based on POSTed email
    const user = await User.findOne({email: req.body.email});
    if(!user){
        return next(new AppError('There is no user with email address.', 404));
    }

    // 2) Generate the random reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({validateBeforeSave: false});
    // await user.save();

    // // 3) Send it to user's email  
    try{
        const resetURL = `${req.protocol}://${req.get(
        'host'
        )}/api/v1/users/resetPassword/${resetToken}`;
        await new Email(user, resetURL ).sendPasswordReset(); // Lesson 208

        res.status(200).json({
            status: 'success',
            message: 'Token sent to email!'
        })
    }catch(err){
        user.passwordResetToken = undefined;
        user.passwordResetExpires = undefined;
        await user.save({validateBeforeSave: false});

        return next(new AppError('There was an error sending the email. Try again later!'), 500);
    }

});


exports.resetPassword = catchAsync(async (req, res, next) => {
// 1) Get user based on the token
const hashedToken = crypto
.createHash('sha256')
.update(req.params.token)
.digest('hex');

const user = await User.findOne({
    passwordResetToken: hashedToken, 
    passwordResetExpires: {$gt: Date.now()}
});//4:42

// 2) If token has not expired, and there is user, set the new password
if(!user){
    return next(new AppError('Token is invalid or has expired', 400));
}
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm;
user.passwordResetToken = undefined;
user.passwordResetExpires = undefined;
await user.save();
 
// 3) Update changedPasswordAt property for the user

// 4) Log the user in, send jWT
createSendToken(user, 200, res);
});


// Lesson 138 
exports.updatePassword = catchAsync(async(req, res, next) => {
// 1) Get user from collection
const user = await User.findById(req.user.id).select('+password'); // explicitly ask for the password
    
// 2) Check if POSTed current password is correct
if(!(await user.correctPassword(req.body.passwordCurrent, user.password))){
    return next(new AppError('Your current password is wrong.', 401))
}
// 3) If so, update password
user.password = req.body.password;
user.passwordConfirm = req.body.passwordConfirm
await user.save();
// User.findByIdAndUpdate will NOT work as intended! lesson 138 timestamp 6:56 for two reasons:

// 4) log user in, send JWT
createSendToken(user, 200, res);
});



















