const Tour = require('./../models/tourModels'); // Lesson 182
const User = require('./../models/userModels') //Lesson 195
const Booking = require('./../models/bookingModels') //Lesson 215
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError'); // Lesson 193



exports.getOverview = catchAsync(async(req, res, next) => {
      // 1) Get tour data from collection
    const tours = await Tour.find();
    // 2) Build template
    // 3) Render that template using tour data from 1) 
    res.status(200).render("overview",{
        title: 'All Tours',
        tours: tours
    })
    next();
});

// exports.getTour = (req, res) => {
//     res.status(200).render("tour", {
//         title: 'The Forest Hiker Tour'
//     })
// }

exports.getTour = catchAsync(async (req, res, next) => {
    // 1) Get the data, for the requested tour (including reviews and guides)
    const tour = await Tour.findOne({slug: req.params.slug}).populate({
        path: 'reviews',
        fields: 'review rating user photo'
    });
    // console.log ('galing ng getTour, inside viewsController', tour)
    if(!tour) {
        return next(new AppError('There is no tour with that name.', 404));
    }
    // 2) Build template
    // 3) Render template using data from 1)

    // const tours = await Tour.find();
    res.status(200).render("tour", {
        title: `${tour.name} Tour`,
        tour: tour
    })
})

exports.getLoginForm = catchAsync(async(req, res, next) => {
      
    res.status(200).render("login",{
        title: 'Log into your account',
    })
    next();
});

exports.getAccount = (req, res) => {
    res.status(200).render("account",{
        title: 'Your account',
    })
}
// Lesson 215
exports.getMyTours = catchAsync(async(req, res, next) => {
    // 1) Find all bookings
        const bookings = await Booking.find({user: req.user.id}) //this contain all the booking documents for the current user, but really that only gives us the tour IDs
    // 2) Find tours with the returned IDs
        // const tourIDs = bookings.map(el => el.tour.id)  // so now we want to find the tours with the returned IDs. so here basically create an array of all the IDs, 
        const tourIDs = bookings.map(el => el.tour) // this is much better
        const tours = await Tour.find({ _id: {$in: tourIDs}}) //this will select all the tourswhich have an _id which is in the tourIDs array, using the $in operator.
                                                              //Note: try using the virtual populate, as an alternative
        res.status(200).render('overview', {
            title: 'My Tours',
            tours
        })
})







exports.updateUserData = catchAsync(async (req, res, next) => {
    // console.log('UPDATING USER>>> ', req.body)  //Lesson 195
    console.log('req.user.id>>>>> ', req.user.id)
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,  //Lesson 195, remember that these are teh names of teh fields, because we gave them teh name attribute in teh HTML form.
            email: req.body.email
        },
        {
            new: true,
            runValidators: true
        }
    );
    res.status(200).render("account",{
        title: 'Your account',
        user: updatedUser
    })
});



















