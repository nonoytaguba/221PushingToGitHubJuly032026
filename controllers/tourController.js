const multer = require('multer');  //Lesson 199, then Lesson 204
const sharp = require('sharp'); //Lesson 204
const Tour = require('./../models/tourModels');
// const APIFeatures = require('./../utils/apiFeatures'); //this will no longer needed here because it move to handlerFactory function
const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const factory = require('./handlerFactory');

//Lesson 204 start************************************************************************************************************** */
const multerStorage = multer.memoryStorage(); // in this way, the image will then be stored as a buffer, Lesson 202

//

//Creating Multerfilter, test if the uploaded file is an image Lesson 204
const multerFilter = (req, file, cb) => {   //the goal here is to test if the uploaded file is an image
    if (file.mimetype.startsWith('image')) {  
        cb(null, true)  // meaning no error and pass true
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);  //there is an error, and pass false
    }
};

const upload = multer({  //lesson 204
    storage: multerStorage,
    fileFilter: multerFilter
}); 


// Uploading multiple files
exports.uploadTourImages = upload.fields([
    {name: 'imageCover', maxCount: 1},
    {name: 'images', maxCount: 3}
])

// And in case that we didn't have the image cover and if that only had one field which accepts multiple images
// or multiple files at the same time, we could have done it like this,
    
    // >>>>>  upload.array('images', 5) req.files

// And in case that we didn't have the image cover and if that only had one field which had only single image or file,
// we could have done it like this,

    // >>>>>> upload.single('image') req.file

//Resizing tour images Lesson 204
exports.resizeTourImages = catchAsync(async (req, res, next) => {
    // console.log('req.files', req.files); //Lesson 205

    if(!req.files.imageCover || !req.files.images) return next();

    // 1) Cover image
    //Option 1 Lesson 205, using imageCoverFilename
    const imageCoverFilename = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)  // 
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${imageCoverFilename}`);   
    req.body.imageCover = imageCoverFilename; 
    
    //Option 2 Refactoring to direct file into req.body.imageCover
    req.body.imageCover = `tour-${req.params.id}-${Date.now()}-cover.jpeg`
    await sharp(req.files.imageCover[0].buffer)  // 
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${req.body.imageCover}`); // save the image, writing file into our file system Lesson 202
        
    
    // 2) Images
        //this is not working properly
    // req.body.images = []
        // req.files.images.foreach(async (file, i) => {
    //     const filename =`tour-${req.params.id}-${Date.now()}-${i = 1}.jpeg`

    //     await sharp(file.buffer)
    //         .resize(2000, 1333)
    //         .toFormat('jpeg')
    //         .jpeg({quality: 90})
    //         .toFile(`public/img/tours/${filename}`);

    //     req.body.images.push(filename);
    // });

    //final solution
    req.body.images = []
    await Promise.all (req.files.images.map(async (file, i) => {
        const filename = `tour-${req.params.id}-${Date.now()}-${i + 1}.jpeg`;

        await sharp(file.buffer)
            .resize(2000, 1333)
            .toFormat('jpeg')
            .jpeg({quality: 90})
            .toFile(`public/img/tours/${filename}`);
        
            req.body.images.push(filename);
        })
    )
    // console.log(req.body)
    next();
});


//Lesson 204 end ********************************************************************************************************* */

exports.aliasTopTours = (req, res, next) => {
    req.query.limit = '5';
    req.query.sort='-ratingsAverage,price';
    req.query.fields = 'name, price, ratingAverage, summary, difficulty';
    next();
}


exports.getAllTours = factory.getAll(Tour);
exports.getTour = factory.getOne(Tour, { path: 'reviews'}); // remember that the path property is the field, we want to populate
exports.createTour = factory.createOne(Tour);
exports.updateTour = factory.updateOne(Tour);
exports.deleteTour = factory.deleteOne(Tour);


exports.getTourStats = catchAsync(async (req, res, next) => {
 const stats = await Tour.aggregate([
            {
                $match: { ratingsAverage: { $gte: 4.5 }}
            },
            {
                $group: {
                    // _id: '$ratingsAverage',
                    _id: {$toUpper: '$difficulty'},
                    // _id: '$difficulty',
                    numTours: {$sum: 1},
                    numRatings: {$sum: '$ratingsQuantity'},
                    avgRating: {$avg: '$ratingsAverage'},
                    avgPrice: {$avg: '$price' },
                    minPrice:  {$min: '$price'},
                    maxPrice:  {$max: '$price'},
                }
            },
            {
                $sort: {avgPrice: 1}
            },
            // {
            //     $match: {_id: {$ne: 'EASY'}}
            // }
        ])
        res.status(200).json({
            status: 'success',
            data: {
                stats
            }
        })
});

exports.getMonthlyPlan = catchAsync(async (req, res, next) => {
     const year = req.params.year * 1;  //2021

        const plan = await Tour.aggregate([
            {
                $unwind: "$startDates"
            },
            {
                $match: {
                    startDates: {
                      $gte: new Date(`${year}-01-01`),
                      $lte: new Date(`${year}-12-31`)      
                    }
                }
            },
            {
                $group: {
                   _id: {$month: '$startDates'},
                   numTourStarts: {$sum: 1},
                   tours: {$push: '$name' }
                }
            },
            {
                $addFields: { month: '$_id'}
            },
            {
                $project: {
                   _id: 0 
                }
            },
            {
                $sort: { numTourStarts: -1 }
            },
            {
                $limit: 6
            }
        ]);

        res.status(200).json({
            status: 'success',
            data: {
                plan
            }
        })
})
// NOTE ON getAllTour handler
// Now maybe you noticed that I did not add this 404 error here in this getAllTour handler.
// So, why did I did that?
// And so let me explain you why.
// So, when there is zero results found,
// for example, there are no results matching for a filter,
// or because the page was requested
// that doesn't exist, then of course we could consider sending
// a 404 error and saying that the data
// was not found but in my opinion
// and also the opinion of other developers,
// that is not entirely correct in this request
// because there was not really an error.
// I mean, the request was correctly received.
// The database correctly searched for the tours
// and found exactly zero records
// and so, these zero records are exactly
// what we're gonna send back along with the 200 HTTP code.
// All right, so again I consider
// that there cannot really be an error
// when a user requests all the tours
// unless of course there is some failure in the database
// or something like that.

//Lesson 171*********************************************************************************/


// /router.route('/tours-within/:distance/center/:latlng/unit/:unit', tourController.getToursWithin)
// /tours-within?distance=233&center=-40&45&unit=mi
// /tours-within/distance/233/center/34.111745,-118.113491/unit/mi

// {{URL}}/api/v1/tours/tours-within/233/center/34.111745,-118.113491/unit/mi


exports.getToursWithin = catchAsync (async (req, res, next) => {
    const {distance, latlng, unit} = req.params;
    const [lat,lng] = latlng.split(',');

    const radius = unit === 'mi' ? distance / 3963.2 : distance / 6378.1;
    
    if(!lat || !lng){
        next(new AppError('Please provide latitude ang longtitude in the format lat, lng.', 400))
    };

    console.log('distance', distance, 'latitude',  lat, 'longtitude',  lng, 'unit', unit)
    
    const tours = await Tour.find({startLocation: {$geoWithin: {$centerSphere: [[lng, lat], radius ]}}});
    res.status(200).json({
        status: 'success',
        results: tours.length,
        data: {
            data: tours
        }
    })
});


//************************************************************************************************ */
// Lesson 172

exports.getDistances = catchAsync(async(req, res, next) =>{
    const {latlng, unit} = req.params;
    const [lat, lng] = latlng.split(',');
  

    const multiplier = unit === 'mi' ? 0.000621371 : 0.001;

    if(!lat || !lng){
        next(new AppError(
            'Please provide latitude ang longtitude in the format lat, lng.', 400
        )
    );
    }
    const distances = await Tour.aggregate([
        {
            $geoNear: {
                near: {
                    type: 'Point',
                    coordinates: [lng * 1, lat * 1 ]
                },
                distanceField: 'distance',
                distanceMultiplier: multiplier // 0.001 this is exactly the same as dividing by 1000
            }
        },
        {
            $project:{
                distance: 1,
                name: 1
            }
        }
    ]);

    res.status(200).json({
        status: 'success',
        data: {
            data: distances
        }
    })
})





























