const mongoose  = require("mongoose")

const reviewSchema = mongoose.Schema({
    review:{
        type:String,
        required:true,
        maxLength:100
    },
    ratings:{
        type:Number,
        min:1,
        max:10,
        required:true
    },
    user:{
        type:mongoose.Schema.ObjectId,
        ref:"User",
        required:true
     },
     tourist:{
        type:mongoose.Schema.ObjectId,
        ref:"Tourist",
        required:true
     }
},{timestamps:true})


// Static method to get avg rating and save
reviewSchema.statics.getAverageRating = async function(touristId) {
    const obj = await this.aggregate([
      {
        $match: { tourist: touristId }
      },
      {
        $group: {
          _id: '$tourist',
          averageRating: { $avg: '$ratings' }
        }
      }
    ])
  
    try {
      await this.model('Tourist').findByIdAndUpdate(touristId, {
        averageRating:Math.floor(obj[0].averageRating) 
      })
    } catch (err) {
      console.error(err);
    }
  }
  
  // Call getAverageCost after save
  reviewSchema.post('save', async function() {
    await this.constructor.getAverageRating(this.tourist);
  })
  
  // Call getAverageCost before remove
  reviewSchema.post('remove', async function() {
    await this.constructor.getAverageRating(this.tourist);
  })

const Review = mongoose.model("Review",reviewSchema)


module.exports = Review