const mongoose = require('mongoose');
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
)

reviewSchema.index({ tour: 1, user: 1}, {unique: true});


//***********************************************************************************************************/
// **********************************************************************************************************/
//TASKS
//STEP 1
//Creating function which will take in a tourId and calculate the average rating and number of ratings that exist in our collections for that exact tour.
//then at the end the function will save the corresponding document.
//STEP 2
//Then in order to use that function we will use middleware to basically call this function each time that there is a new review or one is updated or deleted.
//************************************************************************************************************ */

//Lesson 156 Populating Reviews with both tour and user automatically each time there is a query for a review
reviewSchema.pre(/^find/, function(){
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
});



//******************************************************************************************** */

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

//******************************************************************************************** */
//******************************************************************************************** */
//CREATING THE FUNCTION calcAverageRatings
reviewSchema.statics.calcAverageRatings = async function(tourId) {  // takes in a tourId and that ID is of course for the tour to which the current review belongs to.
   console.log('tourId>>>  ', tourId);
   let stats = await this.aggregate(     //To  do the calculation, use the aggregation pipeline. The this keyword here, actually point to the current model.
    
    //So into aggregate we need to pass in an array of all the stages that we want in aggregate
    [
    // Step 1) Select all the reviews that actually belong to the current tour that was passed in as the argument.
    {
        $match: {tour: tourId}
    },
    // Step 2) calculate the statistics themselves, and for that, we use a group stage.
    {
       $group: {
        _id: '$tour', //we're grouping all the tours together by tour.
        nRating: {$sum: 1}, // add 1 for each tour
        avgRating: {$avg: '$rating'} 
       } 
    } 
   ]);
//    console.log('stats', stats);

//Step 3) So now it's time to actually persist/save the calculated statistics into this tour document.
   
    if(stats.length > 0){
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
}//endofcalcAverageRatings
//******************************************************************************************** */
//******************************************************************************************** */

// const updatedDocument = await MyModel.findOneAndUpdate(
//   { _id: documentId },
//   { $set: { status: 'active' } },
//   { returnDocument: 'after' } // ✅ Correct
// );


//Using pre (not working)
// reviewSchema.pre('save', function(next){
//     //this points to current review 
    //    Review.calcAverageRatings(this.tour)  ////Now the problem is that at this point here in the code the review variable is not yet defined.
       // explanation (this.tour), the 'this' here is the current review, and this is then the tour ID that we're gonna pass inside of teh calcAverageRatings.
//     next();
// });

//IMPORTANT NOTE
// Now the problem is that at this point here in the code the review variable is not yet defined.
// Now you might think that the simple solution would be to simply move this code in here after this review declaration,
// but unfortunately that's not going to work, because just like in Express this code here basically runs in the sequence it is declared.
// So if we were to put this code here after the review declaration then this reviewSchema here would not contain this middleware,
// because we would then only be declaring it after the review model was already created, okay,

//SOLUTION USING constructor
//Using pre
// reviewSchema.pre('save', function(next){  //next argument is not working this is not working
// reviewSchema.pre('save', function(){
//     //this points to current review and constructor is basically the model who created that document
    //    Review.calcAverageRatings(this.tour)  ////Now the problem is that at this point here in the code the review variable is not yet defined.
       // explanation (this.tour), the 'this' here is the current review, and this is then the tour ID that we're gonna pass inside of the calcAverageRatings.
     // this.constructor. //"this" keyword here is the current document, and the "constructor" keyword here is basically the model who created that model. So this 'this.constructor stands for the tour
    //    this.constructor.calcAverageRatings(this.tour); // and so we can simply do it like this.
// next(); //this is not working
// });

//************************************************************************************************* */

//Using post to save review doc in database
reviewSchema.post('save', function(){
//     //this points to current review and constructor is basically the model who created that document
    //    Review.calcAverageRatings(this.tour)  ////Now the problem is that at this point here in the code the review variable is not yet defined.
       // explanation (this.tour), the 'this' here is the current review, and this is then the tour ID that we're gonna pass inside of teh calcAverageRatings.
    this.constructor.calcAverageRatings(this.tour);  //this is the solution
    // console.log('this.tour>>>>>>>>', this.tour)
    // console.log('this>>>>>> ', this)
    // console.log('this constructor>>>>>> ', this.constructor)
    // console.log('this constructor......>>>>>> ', this.constructor.this.tour)
});

//******************************************************************************************************************** */
//******************************************************************************************************************** */

//Lesson 169 starts here
//IMPORTANT NOTES:
    // this part is actually a bit harder because, keep in mind that a review is updated or deleted using 
    // findByIdAndUpdate or also findByIdAndDelete, right?
    // So for these, we actually do not have document middleware,but only query middleware, okay.
    // And so in the query, we actually don't have direct access to the document in order to then do something similar
    // to this, okay.
    // Because, remember, we need access to the current review,so that from there, we can extract the tour ID,
    // and then calculate the statistics from there, right,but again, for these hooks here,we only have query middleware, okay.
    // remember that the goal here is to get access to the current review document


//findByIdAndUpdate, this is only a shorhand for findOneAndUpdate with the current ID.
//findByIdAndDelete
///*

reviewSchema.pre(/^findOneAnd/, async function(){
// reviewSchema.pre('findOneAndUpdate', async function(){
//    const r = await this.findOne();  // "this" keyword here , is the current query
    //   const r = this.findOne();
//   console.log('this_dot_r', r);
    

    // 'this' refers to the current Query object
    const queryConditions = this.getQuery(); // queryCondition>>>>  { _id: '6a2eab8627e2f31417f0eeda' }
    console.log('queryCondition>>>> ', queryConditions)   
    
    // Explicitly query the database to find the target document
    docToUpdate = await this.model.findOne(queryConditions);

    if (docToUpdate) {
      console.log('Accessing document before update:', docToUpdate);
      // You can now access or use properties from docToUpdate
                    // Accessing document before update: {
                    //   _id: new ObjectId('6a2eab8627e2f31417f0eeda'),
                    //   review: 'tugatog',
                    //   rating: 1,
                    //   tour: new ObjectId('6a2e65cee7f4379c38bb662d'),
                    //   user: new ObjectId('5c8a23c82f8fb814b56fa18d'),
                    //   createdAt: 2026-06-14T13:24:22.912Z,
                    //   __v: 0,
                    //   id: '6a2eab8627e2f31417f0eeda'
                    // }    
    }
      console.log('helloworld')
//    next();  // not working
});


reviewSchema.post(/^findOneAnd/, async function(){
await docToUpdate.constructor.calcAverageRatings(docToUpdate.tour)
});








//*/
//************************************************************************************ */
/*
reviewSchema.pre(/^findOneAnd/, async function(next){
   this.r = await this.findOne();  // here the this keyword, is the current query
   console.log('r ', this.r);
   next();
});

*/
/*
reviewSchema.post(/^findOneAnd/, async function(){
    //await this.findOne(); does NOT work here, query has already executed
    // await this.r.constructor.calcAverageRatings(this.r.tour)
    // await this.constructor.calcAverageRatings(this.tour)
     this.constructor.calcAverageRatings(this)
    // console.log(this)
   console.log('revie_wow');
//    await Tour.findByIdAndUpdate(tour,
//     {
//     ratingsQuantity: stats[0].nRating,
//     ratingsAverage:  stats[0].avgRating
//    },
   
//     );
//    console.log('tourStat', stats[0].nRating, stats[0].avgRating)
});
*/
const Review = mongoose.model('Review', reviewSchema);

module.exports = Review;
