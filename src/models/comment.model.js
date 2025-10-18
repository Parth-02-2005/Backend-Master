import mongoose from "mongoose";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate-v2";

const commentSchema = new mongoose.Schema(
  {
    content: { type: String, requried: true },
    video: { type: Schema.Types.ObjectId, ref: "Video", requried: true },
    owner: { type: Schema.Types.ObjectId, ref: "User", requried: true },
  },
  { timestamps: true }
);

commentSchema.plugin(mongooseAggregatePaginate);

const Comment = mongoose.model("Comment", commentSchema);

export default Comment;
