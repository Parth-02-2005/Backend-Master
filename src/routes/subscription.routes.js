import express from "express";
import toggleSubscription from '../controllers/subscription.controller/toggleSubscription.js'
import toggleSubscription from '../controllers/subscription.controller/getUserChannelSubscribers.js'
import toggleSubscription from '../controllers/subscription.controller/getSubscribedChannels.js'


const router = express.Router();

router.post(
  "/toggle/:channelId",
  authenticateUser,
  toggleSubscription
);

router.get(
  "/subscribers/:channelId",
  authenticateUser,
  getUserChannelSubscribers
);

router.get(
  "/subscribed-to/:subscriberId",
  authenticateUser,
  getSubscribedChannels
);
