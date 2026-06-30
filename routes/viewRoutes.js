const express = require('express');
const viewsController = require('./../controllers/viewsController')
const authController = require('../controllers/authController');
const bookingController = require('../controllers/bookingController'); //Lesson 214

const router = express.Router();


router.get(
  '/',
  bookingController.createBookingCheckout,  //Lesson 214, this is just temporary
  authController.isLoggedIn,
  viewsController.getOverview
);
router.get('/tour/:slug', authController.isLoggedIn, viewsController.getTour);
router.get('/login', authController.isLoggedIn, viewsController.getLoginForm);
router.get('/me', authController.protect, viewsController.getAccount);
router.get('/my-tours', authController.protect, viewsController.getMyTours); //Lesson 215

router.post(
  '/submit-user-data',
  authController.protect,
  viewsController.updateUserData); //Lesson 195

module.exports = router;
 