 const mongoose = require('mongoose')
 const slugify = require('slugify')
 const validator = require('validator')
 const currentTimeMillis = Date.now();
const threeHoursInMillis = 3*60*60*1000;
const newTimeMillis = currentTimeMillis + threeHoursInMillis;


 
 
 const tourSchema = new mongoose.Schema({
    name: {
        type:String,
        required: [true, 'A tour must have a name'],
        unique: true,
        trim: true,
        maxlenght: [40, 'A tour name must have less or equal then 40 characters'],
        minlenght: [8, 'A tour name must have less or equal then 8 characters'],
        validate: [validator.isAlpha, 'Tour name must only contain character']
    },
    slug: String,
    duration: {
        type: Number,
        required: [true, 'A tour must have a duration']
    },
    maxGroupSize: {
        type: Number,
        required: [true, ' tour must have a group size']
    },
    difficulty: {
        type: String,
        required: [true, 'a tour must have a difficulty'],
        enum: {
            values:['easy','medium','difficult'],
            message: 'Difficulty is either: easy,medium,difficult'
        } 
    },
    ratingsAverage: {
        type: Number,
        default:4.7,
        min: [1, 'Rating must be above 1.0'],
        max: [5, 'Rating must be less 5.0'],
    },
    ratingQuantity: {
        type: Number,
        default: 0
    },
    price: {
        type: Number,
        required: [true, 'A tour must have a price']
    },
    priceDiscount: {
        type: Number,
        validate: {
            validator:function(val){
                //this only points to current doc on New document creation
                return val < this.price; // 100 < 200 true, 250 < 200 false
            },
            message: 'Discount Price ({VALUE}) should be below regular price'
        } 

    },
    summary: {
        type: String,
        trim: true,
        required: [true, 'A tour must have a description']
    },
    description: {
        type: String,
        trim: true
    },
    imageCover: {
        type: String,
        required: [true, 'a tour must have a cover image']
    },
    images: [String],
    createdAt: {
        type: Date,
        default: new Date(newTimeMillis),
        select: false
    },
    startDates: [Date],
    secretTour: {
        type: Boolean,
        default: false
    }
},
{
    toJSON: {virtuals: true},// convert ot json
    toObject: { virtuals: true}// convert to object
}
);

tourSchema.virtual('durationWeeks').get(function() { // fuction to calc the tour duration in week
    return this.duration / 7 // how much duration in one week is the tour
})

// DOCUMENT MIDDLEWARE: runs before .save() and .create() 
tourSchema.pre('save', function(next) {
    this.slug = slugify(this.name, {lower: true});
    next()
});

// tourSchema.pre('save', function(next) {
//     console.log('will save document...')
//     next()
// })

// tourSchema.post('save',function(doc, next) {
//     console.log(doc);
//     next();
// })

// QUERY MIDDLEWARE 
tourSchema.pre(/^find/, function(next) {
    this.find({ secretTour: {$ne: true}})

    this.start = Date.now()
    next()
})

tourSchema.post(/^find/, function(docs,next) {
    console.log(`query took ${Date.now() - this.start} millisecounds!`) // to calc who much the process take
    // console.log(docs);// prite all the result in console
    next();
});


// AGGREGATION MIDDLEWARE 

tourSchema.pre('aggregate', function(next) {
    this.pipeline().unshift({$match: {secretTour: {$ne: true}}})

    console.log(this.pipeline()) 
    next()
})



const Tour = mongoose.model('Tour', tourSchema)

module.exports = Tour;
