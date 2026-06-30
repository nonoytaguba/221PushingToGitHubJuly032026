const APIFeatures = require('./../utils/apiFeatures');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');




exports.deleteOne = Model => catchAsync(async (req, res, next) => {

    const doc = await Model.findByIdAndDelete(req.params.id);

    if(!doc){
        return next(new AppError('No document found with that ID', 404)); // we want to return this function immediately and not move on to the next line.
    }
    res.status(204).json({  
        status: 'success',
        message: 'data has been deleted!',
        data: null,
        
    }) 
})

exports.updateOne = Model => catchAsync(async (req, res, next) => {

        const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
                new: true,
                runValidators: true,
            });

            if(!doc){
                return next(new AppError('No document found with that ID', 404)); // we want to return this function immediately and not move on to the next line.
            }
            res.status(200).json({
            status: 'success',
            data: {
                data: doc
            }
        })
})

exports.createOne = Model => catchAsync(async (req, res, next) => {
const doc = await Model.create(req.body);

    res.status(201).json({
            status: "success",
            data: {
              data: doc
            }
        })
});

exports.getOne = (Model, popOptions) => catchAsync(async (req, res, next) => {
    let query = Model.findOne({ _id: req.params.id });
    if(popOptions) query = query.populate(popOptions)
    const doc = await query;
    // const doc = await Model.findOne({ _id: req.params.id }).populate(popOptions); // this is the original pattern
    
    if(!doc){
        return next(new AppError('No document found with that ID', 404)); // we wat to return this function immediately and not move on to the next line.
    }

    res.status(200).json({
        status: 'success',
        data: {
           data: doc
        }
        });
});

exports.getAll = Model => 
    catchAsync(async (req, res, next) => {    // Now maybe you noticed that I did not add this 404 error here in this getAllTour handler. Please explanation below....
       //To allow for nested GET reviews on tour (hack)
        let filter = {}
       if(req.params.tourId) filter = {tour: req.params.tourId};


      const features = new APIFeatures(Model.find(filter), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();

    //   const doc = await features.query.explain();  //this is for lecture purposes only
      const doc = await features.query;
//SEND RESPONSE
    res.status(200).json({
        status: 'success',
        results: doc.length,
        data: {
            data: doc
        }
    });
});