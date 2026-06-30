const mongoose = require('mongoose');
const slugify = require('slugify'); // lesson 105 / 6:23
// const User = require('./userModels')  // this is not need in child referencing Lesson 152
const validator = require('validator');

//Creating Tour Schema
const tourSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'A tour must have a name'],    //Note: required is a built-in validator
        unique: true,                                   //Note: unique is not technically a validator,it will produce an error when we have a duplicate name
        trim: true,
        maxlength: [40, 'A tour name must have less than or equal to 40 characters'],
        minlength: [10, 'A tour name must have more than or equal to 10 characters'],
        // validate: [validator.isAlpha, 'Tour name must only contain characters']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, "Atour must have a duration"]
    },
    maxGroupSize: {
        type: Number,
        required: [true, 'A tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'A tour must have a difficulty'],
        enum: {
            values: ['easy', 'medium', 'difficult'],
            message: 'Difficulty is either: easy, medium, difficult'
        }
    },
    ratingsAverage: {
        type: Number,
        default: 4.5,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be below 5.0'],
        set: val => Math.round(val * 10) / 10 // from Lesson 170, thiss is called setter function
    },
    ratingsQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
    type: Number,
    validate: {
        validator: function(val){  //val parameter is a price discount the the user specify
        // "this" variable points to current document on NEW document creation
        return val < this.price; // 100 < 200
    },
    message: 'Discount price ({VALUE}) should be below regular price'
    
    }
    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'A tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: Date.now(),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    },
    startLocation: {
            // GeoJSON
            type: {
                type: String,
                default: 'Point',
                enum: ['Point']
            },
            coordinates: [Number],    //[longtitude, latitude]
            address: String,
            description: String
    },  
    locations: [{
        type: {
            type: String,
            default: 'Point',
            enum: ['Point']
        },
        coordinates: [Number],
        address: String,
        description: String,
        day: Number
    }],
    // guides: Array                 // this is use in embedding, Lesson 151
    guides: [
        {
            type: mongoose.Schema.ObjectId,
            ref: "User"
        }
    ]
},
{
    toJSON: {virtuals: true},
    toObject: {virtuals: true}
}
);


//Single field index lesson 167 timestamp 4:055
// tourSchema.index({price: 1}); //  1 means sort in ascending order and -1 means sort in descending order



tourSchema.index({price: 1, ratingsAverage: -1});//Compound index lesson 167
tourSchema.index({slug: 1});//Slug
tourSchema.index({startLocation: '2dsphere' }) //Lesson 171, 17:01



//*******VIRTUAL PROPERTIES LESSON 104******************** */
//Note: Now one thing that we need to keep in mind is that we
//  cannot use this virtual property here
//in a query, because they're technically
//not part of the database.

tourSchema.virtual('durationWeeks').get(function(){
    return this.duration / 7 
})
//***************************************************** */

// Virtual populate Lesson 157
tourSchema.virtual('reviews', {
    ref: 'Review',
    foreignField: 'tour',
    localField: '_id'
})



//*********DOCUMENT MIDDLEWARE*************************//
//*****LESSON 105 */
// Just like Express, Mongoose also has the concept of middleware.
// And so let's now learn about the first type
// of middleware, which is document middleware.
// Now, just like with Express, we can use
// Mongoose middleware to make something happen
// between two events.
// For example, each time a new document is saved
// to the database, we can run a function
// between the save command is issued and the actual saving
// of the document, or also after the actual saving.
// And that's the reason why Mongoose middleware
// is also called pre and post hooks.
//*****************************************************/

//*******PRE MIDDLEWARE*************/
// And so this is for pre middleware, which again,
// is gonna run before an actual event.
// And that event in this case is the save event.

//DOCUMENT MIDDLEWARE: runs before .save() and .create()
//this is save hook
//LESSON 105 //1:24

//Note2: Do not use this old version, next() is not required
// tourSchema.pre('save', function(next){
//     // console.log(this);
//     this.slug = slugify(this.name, {lower: true});
        // next();
// });

//Note1: this is the update version June 2, 2026 from lesson 105 onwards
tourSchema.pre('save', function(){
    // console.log(this);
    this.slug = slugify(this.name);
});

//Embedding tour guides, this only works for creating new documents, not for updating them Lesson 151
// tourSchema.pre('save', async function(){
//     const guidesPromises = this.guides.map(async id => await User.findById(id));
//     this.guides = await Promise.all(guidesPromises)
// });



// tourSchema.pre('save', function(){
//     console.log('will save document...');
// });

// tourSchema.post('save', function(doc, next){
//     console.log(doc);
//     next();
// });



// Creating slug lesson 105 / 6:16
//npm install slugify

//************HOOK********************* */
//LESSON 105 / 10:46
// Now another thing that I wanted to show you
// is that we can have, of course, multiple
// pre middlewares or also post middlewares for the same hook.
// And hook is what we call this save here.
// So this middleware here is basically what we call
// a pre save hook.
// So you will see that terminology all the time.
// So some call it middleware, and some call it hooks.
// And so this is gonna be a pre save hook
// or pre save middleware.


//************QUERY MIDDLEWARE find hook (find hook)************/
//NOTE:
//And so, the big difference here is that the this 'find' keyword will now point at the current query
//and not at the current document, because we're not really processing any documents here. We're
//really gonna be processing a query.

//  tourSchema.pre('find', function(next){
    tourSchema.pre(/^find/, function(){     // /^find/ means all the strings that start with find.
    this.find({secretTour:{$ne: true}});       //keep in mind that 'this' here is a query object or points to the query
    this.start = Date.now();
 
})
//Lesson 153, Lesson 184
tourSchema.pre(/^find/, function(){
    this.populate({
       path: 'guides',
       select: '-__v' 
       });
})



tourSchema.post(/^find/, function(docs, next){
    console.log(`Query took ${Date.now() - this.start} milliseconds!`)
    // console.log(docs);
    next();
})

//*************************************************************************** */
//Lesson 172 this is being deactivated in Lesson 172
//*****AGGREGRATION MIDDLEWARE LESSON 107 */
// tourSchema.pre('aggregate', function(){
//     this.pipeline().unshift({$match: {secretTour: {$ne: true} } })
//     console.log(this.pipeline());
//     // console.log(this)   // the 'this' keyword here points to the current aggreation object
//     // next();
// });
//******************************************************************************* */









//Creating Tour Model
const Tour = mongoose.model('Tour', tourSchema);

module.exports= Tour;

