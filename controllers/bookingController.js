const mongoose = require('mongoose'); //Lesson 216
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY); //lesson 211 5:45                                         
const Tour = require('../models/tourModels');
const Booking = require('../models/bookingModels')
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory')

exports.getCheckoutSession = catchAsync(async (req, res, next) => {
  console.log("Stripe Key Loaded:", process.env.STRIPE_SECRET_KEY ? "YES" : "NO");
                                               
// console.log('stripe>>>>', {Stripe})

  // 1) Get the currently booked tour
  const tour = await Tour.findById(req.params.tourId);
  
  // console.log('tour>>>>', tour);

  // 2) Create checkout session

  const session = await stripe.checkout.sessions.create({
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `${tour.name} Tour`,
              description: tour.summary,  
              images: [`https://natours.dev/img/tours/${tour.imageCover}`]  
              	      	// ['https://natours.dev/img/tours/tour-2-cover.jpg']  
            },
            unit_amount: tour.price * 100,  // multiplide by 100, because this amount is expected to be in cent
          },
          quantity: 1,
        },
      ],
      // payment_method_types: ['card'],
      mode: 'payment',
      success_url: `${req.protocol}://${req.get('host')}/?tour=${req.params.tourId}&user=${req.user.id}&price=${tour.price}`,  //This is basically the URL that will get called as soon as a credit card has been successfully charged. So as soon as the purchase was successful the user will be redirected to this URL. And for now, let's simply specify that as our homepage.
      cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,  //And so basically it's the page where the user goes if they choose to cancel the current payment. And actually let's make them go to the tour page where they were previously.And so that is basically tour/tour.slug.
      customer_email: req.user.email, //so remember that this is a protected route. And so as always the user is already at the request. And so we can say request.user.email.
      client_reference_id: req.params.tourId, //So this field is gonna allow us to pass in some data about the session that we are currently creating. And that's important because later once the purchase was successful, we will then get access to the session object again. And by then, we want to create a new booking in our database.
    }); //end of session
     console.log('host>>>>>>>>>>>>>>>>>>>>>>>>😎😉😉🤞🤞🤞✌✌🤷‍♂️🤷‍♂️', `${req.protocol}://${req.get('host')}/`)
               // host      http:         //     127.0.0.1:3000/
  // 3) Create session as response
  res.status(200).json({
    status: 'success',
    session: session
  });
})

//************************************************************************************************************* */
//Lesson 214

exports.createBookingCheckout = catchAsync(async(req, res, next) => {
  // This is only TEMPORARY, because it's UNSECURE: everyone can make bookings without paying
  const {tour, user, price} =  req.query;

  if (!tour && !user && !price) return next();
  await Booking.create({tour, user, price})

  res.redirect(req.originalUrl.split('?')[0])  // Lesson 214 redirect to Home Page which is '/', to hit viewsController.getOverview, under viewRoutes, without the query string
});
//************************************************************************************************************** */


exports.createBooking = factory.createOne(Booking);
exports.getBooking = factory.getOne(Booking);
exports.getAllBookings = factory.getAll(Booking);
exports.updateBooking = factory.updateOne(Booking);
exports.deleteBooking = factory.deleteOne(Booking);














/*
      // const session = await stripe.checkout.sessions.create({
      //   payment_method_types: ['card'],
      //   success_url: `${req.protocol}://${req.get('host')}/`,
      //   cancel_url: `${req.protocol}://${req.get('host')}/tour/${tour.slug}`,
      //   customer_email: req.user.email,
      //   client_reference_id: req.params.tourId,
        
      //   line_items: [      //and now finally, we're gonna specify some details about the product itself. So our tour in this case. And so that's called line items which accepts an array of objects. So basically one per item and so in our case that's only gonna be one. So we're to specify the name of the product and so that's at tour.name
      //     {
      //       name: `${tour.name} Tour`,
      //       description: tour.summary,
      //       images: [`https://natours.dev/img/tours/${tour.imageCover}`],
      //       amount: tour.price * 100,
      //       currency: 'usd',
      //       price: tour.price,
      //       quantity: 1
      //     }
      //   ]

      // })

    // const session = await stripe.checkout.sessions.create({
    //   line_items: [{
    //     name: 'T-shirt',
    //     description: 'Comfortable cotton t-shirt',
    //     images: ['https://example.com/t-shirt.png'],
    //     amount: 2000,
    //     currency: 'usd',
    //     price: price.id,
    //     quantity: 1,
    //   }],
    //   mode: 'payment',
    //   success_url: 'https://example.com/success?session_id={CHECKOUT_SESSION_ID}',
    //   cancel_url: 'https://example.com/cancel',
    // });

  // 3) Create session as response
  */
