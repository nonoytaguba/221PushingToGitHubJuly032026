const express = require('express');
const tourController = require('../controllers/tourController')
const authController = require('./../controllers/authcontroller');
// const reviewController = require('./../controllers/reviewController');  // removed from Lesson 159
const reviewRouter = require('./../routes/reviewRoutes'); //exporting review router from Lesson 159

const router = express.Router();

// router.param('id', tourController.checkId);

//********************************************* */ 
// POST/tour/234ad4/reviews
// GET /tour/234ad4/reviews
// GET /tour/234ad4/reviews/94887fda


//*************************************** */
//remove from Lesson 159
// router
// .route('/:tourId/reviews')
// .post(
//     authController.protect,
//     authController.restrictTo('user'),
//     reviewController.createReview
// );
//*************************************** */
//Lesson 159
// And so we will basically say that this tour router
// should use the review router
// in case it ever encounters a route like this.

router.use('/:tourId/reviews', reviewRouter)

// But now, there's actually still one piece missing
// because right now this review router here
// doesn't get access to this tour id parameter, okay.
// And so now we need to enable the review router
// to actually get access to this parameter here as well.
// So let's now move to the review router, okay.
// And so this is where the medical mergeParams
// that I mentioned right in the beginning
// comes into play.
// So here, in the express.router function,
// we can specify some options,
// and here all we need to do is set mergeParams
// to true.


//****************************************************** */

router
  .route('/top-five-cheap')
  .get(tourController.aliasTopTours, tourController.getAllTours)

router
  .route('/tour-stats')
  .get(tourController.getTourStats);

router
  .route('/monthly-plan/:year')
  .get(authController.protect,
       authController.restrictTo('admin', 'lead-guide', 'guide'),
       tourController.getMonthlyPlan);
//****************************************************************************************** */
//Lesson 171
// router.route('/tours-within/:distance/center/:latlng/:unit')
router.route('/tours-within/:distance/center/:latlng/unit/:unit')
.get(tourController.getToursWithin);
// /tours-within?distance=233&center=-40,45&unit=mi
// /tours-within/233/center/-40,45/unit/mi
//************************************************************************************************** */

//******************************************************************************** */
//Lesson 172

router.route('/distances/:latlng/unit/:unit').get(tourController.getDistances);

//******************************************************************************** */


router
  .route('/')
  .get(tourController.getAllTours) // we remove the authController.protect here because we want to expose this API to everyone
  .post(authController.protect,
        authController.restrictTo('admin', 'lead-guide'),
        tourController.createTour);

router
  .route('/:id')
  .get(tourController.getTour)
  .patch(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.uploadTourImages, // Lesson 204
    tourController.resizeTourImages, // Lesson 204
    tourController.updateTour)
  .delete(authController.protect,
    authController.restrictTo('admin', 'lead-guide'),
    tourController.deleteTour);



  module.exports = router;






















