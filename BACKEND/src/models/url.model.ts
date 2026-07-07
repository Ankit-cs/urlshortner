import mongoose from "mongoose";
const shortUrlSchema = new mongoose.Schema({
  full_url: {
    type: String,
    required: false,
  },
  short_url: {
    type: String,
    required: false,
    index: true, // index creates a b tree of data
    unique: true,
  },
  clicks: {
    type: Number,
    required: true,
    default: 0,
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
},{timestamps:true});
// shortUrlSchema.index({short_url:1},{unique:true});
const shortUrl = mongoose.model("shortUrl", shortUrlSchema);
export default shortUrl;
