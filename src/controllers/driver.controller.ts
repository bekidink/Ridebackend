import { NextFunction, Request, Response } from "express";
import {
  sendOtpToPhone,
  verifyPhoneOtp,
  sendOtpToEmail,
  createDriver,
  updateDriverStatus,
  getDriversByIds,
  createRide,
  updateRideStatus,
  getAllRidesByDriver,
} from "../services/driver.service" ;
import { sendToken } from "../utils/send-token";
import jwt from "jsonwebtoken";
const prisma =require("../utils/prisma") ;
export const sendingOtpToPhone = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    await sendOtpToPhone(phone_number);
    res.status(201).json({ success: true });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false });
  }
};

export const verifyPhoneOtpForLogin = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    await verifyPhoneOtp(phone_number, otp);
    const driver = await prisma.driver.findUnique({ where: { phone_number } });
    sendToken(driver, res);
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Something went wrong!" });
  }
};

export const verifyPhoneOtpForRegistration = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    await verifyPhoneOtp(phone_number, otp);
    const otpCode = Math.floor(1000 + Math.random() * 9000).toString();
    const token = await sendOtpToEmail(req.body, otpCode);
    res.status(201).json({ success: true, token });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Something went wrong!" });
  }
};

export const verifyingEmailOtp = async (req: Request, res: Response) => {
  try {
    const { otp, token } = req.body;
    const decoded: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (decoded.otp !== otp) {
      return res
        .status(400)
        .json({ success: false, message: "OTP is not correct or expired!" });
    }

    const newDriver = await createDriver(decoded.driver);
    sendToken(newDriver, res);
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false, message: "Your otp is expired!" });
  }
};

export const updateDriverStatusController = async (req: any, res: Response) => {
  try {
    const { status } = req.body;
    const updatedDriver = await updateDriverStatus(req.driver.id, status);
    res.status(201).json({ success: true, updatedDriver });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};

export const getDriversById = async (req: Request, res: Response) => {
  try {
    const { ids } = req.query as any;
    if (!ids)
      return res.status(400).json({ message: "No driver IDs provided" });
    const drivers = await getDriversByIds(ids.split(","));
    res.json(drivers);
  } catch (error) {
    console.error("Error fetching driver data:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const newRideController = async (req: any, res: Response) => {
  try {
    const newRide = await createRide({ ...req.body, driverId: req.driver.id });
    res.status(201).json({ success: true, newRide });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const updatingRideStatusController = async (req: any, res: Response) => {
  try {
    const { rideId, rideStatus } = req.body;
    const driverId = req.driver.id;

    const ride = await prisma.rides.findUnique({ where: { id: rideId } });
    if (!ride)
      return res
        .status(404)
        .json({ success: false, message: "Ride not found" });

    const updatedRide = await updateRideStatus(
      rideId,
      rideStatus,
      driverId,
      ride.charge
    );
    res.status(201).json({ success: true, updatedRide });
  } catch (error) {
    console.error(error);
    res.status(400).json({ success: false });
  }
};

export const getAllRides = async (req: any, res: Response) => {
  try {
    const rides = await getAllRidesByDriver(req.driver.id);
    res.status(201).json({ rides });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false });
  }
};
