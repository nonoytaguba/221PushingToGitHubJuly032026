const crypto = require('crypto');
const mongoose = require('mongoose');
const validator = require('validator');
const bcrypt = require('bcryptjs');

// name, email, photo, password, passwordConfirm

//CREATING SCHEMA

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please tell us your name']
    },
    email: {
        type: String,
        required: [true, 'Please provide your email'],
        unique: true,
        lowercase: true,
        validate: [validator.isEmail, "Plaease provide a valid email"]
    },
    photo: {type: String,
            default: 'default.jpg'  //Lesson 201
    },
     role:{
        type: String,
        enum: ['user', 'guide', 'lead-guide', 'admin'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please provide a password'],
        minlength: 8,
        select: false
    },
    passwordConfirm: {
        type: String,
        required: [true, 'Please confirm your password'],
        validate: {
            //This only works on CREATE and SAVE!!!
            validator: function(el){
                return el === this.password; // abc === abc, returns true, abc === xyz, returns false
            },
            message: "Passwords are not the same!"
        }
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false
    }
});

userSchema.pre('save', async function(next){
    // Only run this function if password was actually modified
    if(!this.isModified('password')) return console.log('testing')
        // return next();

    // encrypt or Hash the password with cost of 12
    this.password = await bcrypt.hash(this.password, 12);
    
    // Delete passwordConfirm field
    this.passwordConfirm = undefined;
    
}) 



// So for the first time now we're gonna create something
// called an instance method.
// So an instance method is basically a method
// that is gonna be available on all documents
// of a certain collection, okay?
// And it works like this. lesson 130, 16:00

userSchema.pre('save', function(next){
  if(!this.isModified('password') || this.isNew ) 
    return console.log('testing pre save this.isNew')
    // return next();
  this.passwordChangeAt = Date.now() - 1000; //17:40
//   next();
});

userSchema.pre(/^find/, function(){  // /^find/ regular expression, meaning this apply to every query that starts with find
    // this points to the current query
    this.find({active: {$ne: false}})
    // next();
}) 

userSchema.methods.correctPassword = async function(candidatePassword, userPassword) {
  
    return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function(JWTTimestamp) {
    console.log(JWTTimestamp)
    // console.log("hello ", this.passwordChangedAt, JWTTimestamp)
    if(this.passwordChangedAt){
        const changedTimestamp = parseInt(this.passwordChangedAt.getTime()/1000, 10)
        // console.log(changedTimestamp, JWTTimestamp)
        console.log("hello ", this.passwordChangedAt, JWTTimestamp)
        return JWTTimestamp < changedTimestamp;  // 100 < 200
    }

    //False mean that the user has not changed his password after the token was issued.
    return false;
}


userSchema.methods.createPasswordResetToken = function() {
 const resetToken = crypto.randomBytes(32).toString('hex');

 this.passwordResetToken = crypto
 .createHash('sha256')
 .update(resetToken)
 .digest('hex');

 console.log({resetToken}, this.passwordResetToken);

 this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

 return resetToken;
};










//CREATING A MODEL
const User = mongoose.model('User', userSchema);

module.exports = User;








































