import mongoose, {isValidObjectId} from "mongoose"
import {asyncHandler} from "../utils/asyncHandler.js"
import apiError from "../utils/apiError.js";
import apiResponse from "../utils/apiResponse.js"


const toggleSubscription = asyncHandler(async (req, res) => {
    const {channelId} = req.params
    // TODO: toggle subscription
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
})

export {
    toggleSubscription,
    getUserChannelSubscribers,
    getSubscribedChannels
}