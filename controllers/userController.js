const multer = require('multer');  //Lesson 199, then Lesson 200
const sharp = require('sharp'); //Lesson 202
const User = require('./../models/userModels');
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//<<<<<<<<<<<<<<<<<<<<<<<<<<<<ABOUT multer Lesson 200 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>************************************************************************
// this was deactivated in Lesson 202
//Creating MulterStorage Lesson 200, since we save the file in memory storage
// const multerStorage = multer.diskStorage({
//     destination: (req, file, cb) => { //cb here is a bit like next() in express Lesson 200
//         cb(null, 'public/img/users');  // 'public/img/users', this is the actual destination Lesson 200 
//     },
//     filename: (req, file, cb) => {
//         //user-56613136dbz-332135135.jpeg  // user-[userid]-[timestamp]
//         const ext = file.mimetype.split('/')[1];  // mimetype: 'image/jpeg'
//         cb(null, `user-${req.user.id}-${Date.now()}.${ext}`)
//     }
// });
const multerStorage = multer.memoryStorage(); // in this way, the image will then be stored as a buffer, Lesson 202

//

//Creating Multerfilter, test if the uploaded file is an image
const multerFilter = (req, file, cb) => {   //the goal here is to test if the uploaded file is an image
    if (file.mimetype.startsWith('image')) {  
        cb(null, true)  // meaning no error and pass true
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);  //there is an error, and pass false
    }
};
// const upload = multer({dest: 'public/img/users'}); //lesson 199, then renovate in Lesson 200

const upload = multer({  //lesson 200
    storage: multerStorage,
    fileFilter: multerFilter
}); 


exports.uploadUserPhoto = upload.single('photo');  // single mean, we only had one single field with the file that we wanted to upload.


//<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<<Lesson 202 >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> */

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {   // Lesson 202
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;

    await sharp(req.file.buffer)  // the image stores as a buffer, Lesson 202
        .resize(500, 500)
        .toFormat('jpeg')
        .jpeg({quality: 90})
        .toFile(`public/img/users/${req.file.filename}`); // save the image, writing file into our file system Lesson 202

next();
});


//********************************************************************************************** */
const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if(allowedFields.includes(el)) newObj[el] = obj[el];
    })
    return newObj;
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}

exports.updateMe = catchAsync(async(req, res, next) => {
    console.log('req.file',req.file); //Lesson 199
    console.log('req.body', req.body); //Lesson 199, this is not working,

    // 1) Create error if user POSTs password data
    if(req.body.password || req.body.passwordConfirm){
        return next(
            new AppError(
                'This route is not for password updates. Please use updateMyPassword', 
                400
            )
        );
    }
    // 2) Filtered out unwanted fields names that are not allowd to be updated
    const filteredBody = filterObj (
    req.body,            //this the object we want to filter, cause its where all the data is
     'name', 'email');  // a couple of arguments, one for each of teh fields that we want to keep in the object, so we want to keep the field called name, and the field called email and filter out all the rest.
    if (req.file) filteredBody.photo = req.file.filename; //Lesson 201
    // user.name = 'Jonas';
    // await user.save();

    //3 Update user document
    const updatedUser = await User.findByIdAndUpdate(req.user.id, filteredBody, {
        new: true,  // returns the updated new object instead of the old one.
        runValidators: true //we want the models to validate our document.
    });
    
    //This is not correct for demonstration only
        // const user = await User.findById(req.user.id);
        // user.name = 'Jonas';
        // await user.save();

    res.status(200).json({
        status:'success',
        data: {
            user: updatedUser
        }
    })
})


exports.deleteMe = catchAsync(async(req, res, next) => {
await User.findByIdAndUpdate(req.user.id, {active: false});

res.status(204).json({
    status: 'success',
    data: null
})
});


exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not yet defined! Please use /signup instead'
    })
}


exports.getAllUsers = factory.getAll(User);
exports.getUser = factory.getOne(User);

// Do NOT update passwords with this! Lesson 162
exports.updateUser = factory.updateOne(User);

exports.deleteUser = factory.deleteOne(User);

