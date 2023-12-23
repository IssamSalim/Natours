const Tour = require('../models/tourModel');
const APIFeatures = require('../utils/apifeatures');

exports.aliasTopTours = (req, res, next) => {
  req.query.limit = '5';
  req.query.sort = '-ratingsAverage,price';
  req.query.fields = 'name,price,ratingsAverage,summary,difficulty';
  next();
};

exports.getAllTours = async (req, res) => {
  try {
    // EXECUTE QUERY
    const features = new APIFeatures(Tour.find(), req.query)
      .filter()
      .sort()
      .limitFields()
      .paginate();
    const tours = await features.query;

    // SEND RESPONSE
    res.status(200).json({
      status: 'success',
      results: tours.length,
      data: {
        tours
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTour = async (req, res) => {
  try {
    const tour = await Tour.findById(req.params.id);
    // Tour.findOne({ _id: req.params.id })

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.createTour = async (req, res) => {
  try {
    // const newTour = new Tour({})
    // newTour.save()

    const newTour = await Tour.create(req.body);

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour
      }
    });
  } catch (err) {
    res.status(400).json({
      status: 'fail',
      message: err
    });
  }
};

exports.updateTour = async (req, res) => {
  try {
    const tour = await Tour.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    res.status(200).json({
      status: 'success',
      data: {
        tour
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.deleteTour = async (req, res) => {
  try {
    await Tour.findByIdAndDelete(req.params.id);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};

exports.getTourStats = async (req, res) => {
  try {
    const stats = await Tour.aggregate([
        // {
        //   $match: {ratingsAverage: {$gte: 4.7} }
        // },
        {
        $group: {
          _id: { $toUpper: '$difficulty' },
          numTours: { $sum: 1 },
          numRatings: { $sum: '$ratingsQuantity' },
          avgRating: { $avg: '$ratingsAverage' },
          avgPrice: { $avg: '$price' },
          minPrice: { $min: '$price' },
          maxPrice: { $max: '$price' }
        }
        },
        {
          $sort: { avgPrice: 1 }
        }
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        stats
      }
    });
  } catch (err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
};


exports.getMonthlyPlan = async (req, res) => {
  try{
    const year = req.params.year * 1; // 2021
    const plan = await Tour.aggregate([
      {
        $unwind: '$startDates'
      },
      {
        $match: {
          startDates: {
            $gte: new Date(`${year}-01-01}`), // great then or equal 2021-01-01
            $lte: new Date(`${year}-12-01`) // less then or equal 2021-12-01
          } 
        },
      },
      {
        $group: { // group is to specify what we want the reponse silelaer to schema
          _id: { $month: '$startDates' }, // calc the month in a number 1(jan) 12(dec)
          numTourStarts: { $sum: 1 }, // sum how much tour in the month
          tours: { $push: '$name'} // give us the name of the tour that have tour in the month
        }
      },
      {
        $addFields:{ month: '$_id' } // is the give month the same value of _id to reject the _ID FORM THE RESPONSE
      },
      {
        $project: {
          _id: 0 // to remove the _id
        }
      },
      {
        $sort: {numTourStarts: -1} // to add how much tour in this month
      },  
      {
        $limit: 12 // to add that i want to show just 12 tour
      }
    ])

    res.status(200).json({
      status: 'success',
      data: {
        plan
      }
    });
  }catch(err) {
    res.status(404).json({
      status: 'fail',
      message: err
    });
  }
}