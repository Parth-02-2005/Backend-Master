import mongoose, { Schema } from "mongoose"

const playListSchema = new mongoose.Schema({

    name: {type: String, required: true},
    description: {type: String, required: true},
    videos: [
        {type: Schema.Types.ObjectId, ref: 'Video', required: true}
    ],
    owner: {type: Schema.Types.ObjectId, ref: "User", required: true}

}, {timestamps: true})

const PlayList = mongoose.model("PlayList", playListSchema);

export default PlayList