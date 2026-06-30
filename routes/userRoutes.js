const express = require('express');
const multer = require('multer');  //Lesson 199
const userController = require('../controllers/userController');
const authController = require('./../controllers/authController');

//Lesson 199 Lecture about Multer*********************************************************
    // And for now the only option that we're gonna specify is the destination and I'm gonna set
    // it to Public/image/users, all right. And so that is exactly the folder where we want to save all the images
    // that are being uploaded. So that's here, Public, Image and Users, such as all the images for all the users
    // that we already have in our database.
//******************************************************************************************* */
const upload = multer({dest: 'public/img/users'}); //lesson 199


const router = express.Router();

router.post('/signup', authController.signup);


//************lesson 130, 5:30 **********************
// And again, this is only valid for a post request,
// because of course we want to send in
// the login credentials in the body.
// And so again it's a post,
// but not a get, not a patch, and not a delete,
// because that doesn't make any sense in this case.

router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);

//Protect all routes after this middleware
router.use(authController.protect);

router.patch('/updateMyPassword',
   authController.updatePassword);

router.get('/me',//we need to be login in order to allow us to read the id from that user                  
  userController.getMe,   // this is faking that the id id coming from the url
  userController.getUser
);

//******************************************************************************* */
// Lesson 199 Lecture ************************************************************
// In the first part of this section, we will be learning all about uploading images
// with the Multer package and in this particular video
// we will start implementing image uploads for user photos.
// So, Multer is a very popular middleware, to handle multi-part form data, which is a form in coding
// that's used to upload files from a form.

// So remember how in the last section we used, a URL encoded form in order to update user data
// and for that we also had to include a special middleware., And so Multer is basically a middleware
// for multi-part form data.

// And now here is what we're gonna do., We will allow the user to upload a photo
// on the Update Me route and so instead of just being able to update email and photo,
// users will then also be able to upload their user photos.
//************************************************************************************************** */
// router.patch('/updateMe', upload.single('photo'), userController.updateMe); // upload.single('photo'), Lesson 199
router.patch('/updateMe',
   userController.uploadUserPhoto, //Lesson 200
   userController.resizeUserPhoto, //Lesson 202
   userController.updateMe); 

router.delete('/deleteMe', userController.deleteMe);

router.use(authController.restrictTo('admin'));

router
  .route('/')
  .get(userController.getAllUsers)
  .post(userController.createUser)

router
  .route('/:id')
  .get(userController.getUser)
  .patch(userController.updateUser)
  .delete(userController.deleteUser)

  module.exports = router;