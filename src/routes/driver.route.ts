import express from "express";
import {
  getAllRides,
  getDriversById,
  
  newRideController,
  sendingOtpToPhone,
  updateDriverStatusController,
  updatingRideStatusController,
  verifyingEmailOtp,
  verifyPhoneOtpForLogin,
  verifyPhoneOtpForRegistration,
} from "../controllers/driver.controller";
import asyncHandler from "../utils/asyncHandler";
const { isAuthenticatedDriver } = require("../middleware/isAuthenticated");

const driverRouter = express.Router();

driverRouter.post("/send-otp", sendingOtpToPhone);

driverRouter.post("/login", verifyPhoneOtpForLogin);

driverRouter.post("/verify-otp", verifyPhoneOtpForRegistration);

driverRouter.post("/registration-driver",asyncHandler( verifyingEmailOtp));

// driverRouter.get("/me", isAuthenticatedDriver, getLoggedInDriverData);

driverRouter.get("/get-drivers-data",asyncHandler( getDriversById));

driverRouter.put("/update-status", isAuthenticatedDriver, updateDriverStatusController);

driverRouter.post("/new-ride", isAuthenticatedDriver, newRideController);

driverRouter.put(
  "/update-ride-status",
  isAuthenticatedDriver,
 asyncHandler( updatingRideStatusController)
);

driverRouter.get("/get-rides", isAuthenticatedDriver, getAllRides);

export default driverRouter;
