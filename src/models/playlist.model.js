import mongoose from "mongoose"

const playListSchema = new mongoose.Schema({

}, {timestamps: true})

const playList = mongoose.model("playList", playListSchema);

export default playList