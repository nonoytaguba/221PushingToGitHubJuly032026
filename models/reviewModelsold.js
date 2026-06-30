const mongoose = require('mongoose'); //lesson 154
const Tour = require('./tourModels');

const reviewSchema = new mongoose.Schema(
    {
        review: {
            type: String,
            required: [true, "Review can not be empty!"]
        },
        rating: {
            type: Number,
            min: 1,
            max: 5
        },
        createdAt: {
            type: Date,
            default: Date.now
        },
        tour: {
            type: mongoose.Schema.ObjectId,
            ref: 'Tour',
            required: [true, 'Review must belong to a tour.']
        },
        user: {
            type: mongoose.Schema.ObjectId,
            ref: 'User',
            required: [true, 'Review must belong to a user']
        }
    },
    {
        toJSON: {virtuals: true},
        toObject: {virtuals: true}
    }
);

reviewSchema.pre(/^find/, function(next){
    this.populate({
        path: 'tour',
        select: 'name'
    }).populate({
        path: 'user',
        select: 'name photo'
    })

    this.populate({
        path: 'user',
        select: 'name photo'
    })

    next();
})

//Lesson 168, 2:24
// So let's now start by writing that function
// and for that we're actually gonna write a static method
// on our schema, and that's a feature of Mongoose
// that we hadn't used yet.
// So we only used instance method,
// which we can call on documents
// and they are also very useful,
// but this time we're really going to use static methods.
// Okay.


reviewSchema.statics.calcAverageRatings = async function(tourId) {
   console.log('tourId>>>  ', tourId);
   const stats = await this.aggregate([
    {
        $match: {tour: tourId}
    },
    {
       $group: {
        _id: '$tour',
        nRating: {$sum: 1}, // add 1 for each tour
        avgRating: {$avg: '$rating'}
       } 
    }
   ]);
   console.log('stats', stats);

   if (stats.length > 0) {
    await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity: stats[0].nRating,
    ratingsAverage:  stats[0].avgRating
   });
   }else{
    await Tour.findByIdAndUpdate(tourId,{
    ratingsQuantity: 0,
    ratingsAverage:  4.5
   });
   }
   
}

//Using pre
// reviewSchema.pre('save', function(next){
//     //this points to current review and constructor is basically the model who created that document
//     this.constructor.calcAverageRatings(this.tour);
//     next();
// });


//Using post
reviewSchema.post('save', function(){
    //this points to current review and constructor is basically the model who created that document
    this.constructor.calcAverageRatings(this.tour);
});

//findByIdAndUpdate, this is only a shorhand for findOneAndUpdate
//findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function(next){
   this.r = await this.findOne();
   console.log(this.r);
   next();
});

reviewSchema.post(/^findOneAnd/, async function(){
    //await this.findOne(); does NOT work here, query has already executed
   await this.r.constructor.calcAverageRatings(this.r.tour)
});





const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;

