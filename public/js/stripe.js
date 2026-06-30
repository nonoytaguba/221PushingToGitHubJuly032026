// import axios from 'axios'; //Lesson 212
// const  { loadStripe } =require ('@stripe/stripe-js');
// import { showAlert } from './alerts';

// // const stripe = Stripe('process.env.STRIPE_PUBLISHABLE_KEY');
// // // const stripe = stripe(STRIPE_PUBLISHABLE_KEY);
// // // const stripe = STRIPE_PUBLISHABLE_KEY

// export const bookTour = async tourId => {  // tourId comes from tour.pug, button.btn.btn--green.span-all-rows#book-tour(data-tour-id=`${tour.id}`) Book tour now!
//   try {
//     // 1) Get checkout session from API(Server), from bookingRoutes '/checkout-session/:tourId' to the client side
//     const session = await axios(
//       `http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}`
//     );
//     console.log('session>>>>🐱‍👓🐱‍👓🐱‍👓👀✔👀✔👀😃😃>>>>', session);

//     // 2) Create checkout form + charge credit card
//     // const stripe = await loadStripe(`${process.env.STRIPE_PUBLISHABLE_KEY}`)
//     // const stripe = await loadStripe('pk_test_51SA4ju4BE4hpbngpFVMLreDaaAoWWQaSc9hMcbEwgbENn1TKwy4ijRDUQ3XS30xnCL9ew1ZbIQEzyTUnoLL6GMyi00qbnzckgf')
//     // await stripe.redirectToCheckout({
//     //   sessionId: session.data.session.id
//     // });
//   } catch (err) {
//     console.log(err);
//     showAlert('error', err);
//   }
// };
//***************************************************************************************************** */
//Lesson 212
// const axios = require('axios');
import axios from 'axios';                                 //final
// const  { loadStripe } =require ('@stripe/stripe-js');

// import { showAlert } from './alerts';
// const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);    //Lesson 212 
// const stripe = stripe(STRIPE_PUBLISHABLE_KEY);
// const stripe = STRIPE_PUBLISHABLE_KEY

// final na to
export const bookTour = async tourId => {
      
  // const stripe = Stripe(STRIPE_PUBLISHABLE_KEY);
  // const stripe = loadStripe(process.env.STRIPE_PUBLISHABLE_KEY)
  try {

    // 1) Get checkout session from API
    const session = await axios(
      `/api/v1/bookings/checkout-session/${tourId}`   //`http://127.0.0.1:3000/api/v1/bookings/checkout-session/${tourId}` Lesson 222
    );


    // 2) Create checkout form + chanrge credit card

    const sessionUrl = session.data.session.url
    window.location = sessionUrl
    // await stripe.redirectToCheckout({
    //   sessionId: session.data.session.id
    // });
  } catch (err) {
    console.log(err);
    showAlert('error', err);
  }
};


