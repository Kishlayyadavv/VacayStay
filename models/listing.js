import mongoose from "mongoose"
import { Schema } from "mongoose";
import Review from "./review.js";
const listingSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: {
      // filename: { type: String, default: "defaultimage" },
      url: {
        type: String,
        default: "https://images.pexels.com/photos/11998666/pexels-photo-11998666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
        set: function (v) {
          return v === "" ? "https://images.pexels.com/photos/11998666/pexels-photo-11998666.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1" : v;
        },
      },
    },
    price: { type: Number },
    location: { type: String },
    country: { type: String },
    reviews:[
      {
        type:Schema.Types.ObjectId,
        ref:"Review"
      }
    ]
  }
)

listingSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({ reviews : { $in: doc.reviews } });
  }
});
const listing = mongoose.model("listing", listingSchema);


export { listing };