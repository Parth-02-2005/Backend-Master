import mongoose, { Schema } from "mongoose"

const playListSchema = new mongoose.Schema({

    name: {type: String, requried: true},
    description: {type: String, requried: true},
    videos: [
        {type: Schema.Types.ObjectId, ref: 'Video', required: true}
    ],
    owner: {type: Schema.Types.ObjectId, ref: "User", requried: true}

}, {timestamps: true})

const PlayList = mongoose.model("PlayList", playListSchema);

export default PlayList