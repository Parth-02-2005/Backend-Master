import mongoose, {isValidObjectId} from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
  const { channelId } = req.params;
  // TODO: toggle subscription

  if (!channelId || !isValidObjectId(channelId)) {
    throw new apiError(400, "Valid channel ID is required");
  }

  const subscriberId = req.user._id; // logged in user
  if (subscriberId.toString() === channelId.toString()) {
    throw new apiError(400, "You cannot subscribe to your own channel");
  }

  // Check if subscription exists
  const existingSub = await Subscription.findOne({
    subscriber: subscriberId,
    channel: channelId,
  });

  if (existingSub) {
    // Unsubscribe
    await Subscription.findByIdAndDelete(existingSub._id);

    return res
      .status(200)
      .json(new apiResponse(200, {}, "Unsubscribed successfully"));
  }

   // Subscribe
  const newSub = await Subscription.create({
    subscriber: subscriberId,
    channel: channelId,
  });

  return res
    .status(200)
    .json(new apiResponse(200, newSub, "Subscribed successfully"));
    
})

// controller to return subscriber list of a channel
const getUserChannelSubscribers = asyncHandler(async (req, res) => {
    const {channelId} = req.params

    if(!channelId || !isValidObjectId(channelId)) {
        throw new apiError(404, 'Valid channel ID is required');
    }

    const subscribers = await Subscription.find({ channel : channelId }).populate('subscriber', 'username email avatar fullName');

    return res.status(200).json(new apiResponse(200, subscribers, 'subscribers fetched successfully'));

})

// controller to return channel list to which user has subscribed
const getSubscribedChannels = asyncHandler(async (req, res) => {
    const { subscriberId } = req.params

    if(!subscriberId || !isValidObjectId(subscriberId)) {
        throw new apiError(404, 'Valid subscriber ID is required');
    }

    const channels = await Subscription.find({ subscriber: subscriberId })
    .populate("channel", "username email avatar fullName");

    return res
    .status(200)
    .json(new apiResponse(200, channels, "Subscribed channels fetched successfully"));
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}