const express = require('express');  //Lesson 155
const reviewController = require('./../controllers/reviewController'); //Lesson 155
const authController = require('./../controllers/authController');


const router = express.Router({ mergeParams: true}); //mergeParams lecture from Lesson 159

//Lesson 159
// So here, in the express.router function,
// we can specify some options,
// and here all we need to do is set mergeParams
// to true.

// POST/tour/234ad4/reviews
// GEt/tour/234ad4/reviews //Lesson 160 Adding a Nested GET Endpoint
// POST /reviews

router.use(authController.protect);

router
.route('/')     // route of the reviews, that is specified or mounted on app.use('/api/v1/reviews', reviewRouter); Lesson 155
.get(reviewController.getAllReviews)
.post(
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview
);

router
.route('/:id')
.get(reviewController.getReview)
.patch(authController.restrictTo('user', 'admin'),reviewController.updateReview)
.delete(authController.restrictTo('user', 'admin'),reviewController.deleteReview)

module.exports = router;