import mongoose, { Schema } from "mongoose";

const tweetSchema = new mongoose.Schema({
    content: {type: String, requried: true},
    owner: {type: Schema.Types.ObjectId, ref: "User", requried: true},
}, {timestamps: true})

const Tweet = mongoose.model("Tweet", tweetSchema);

export default Tweet