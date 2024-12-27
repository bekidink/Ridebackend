require("dotenv").config();
import { NextFunction, Request, Response } from "express";
import {
  registerUserService,
  verifyOtpService,
  sendOtpToEmailService,
  verifyEmailService,
  getLoggedInUserDataService,
  getAllRidesService,
} from "../services/user.service";

// Register new user
export const registerUser = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number } = req.body;
    const result = await registerUserService(phone_number);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Verify OTP
export const verifyOtp = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { phone_number, otp } = req.body;
    const result = await verifyOtpService(phone_number, otp);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Send OTP to email
export const sendingOtpToEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { email, name, userId } = req.body;
    const result = await sendOtpToEmailService(email, name, userId);
    res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Verify email OTP
export const verifyingEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { otp, token } = req.body;
    const result = await verifyEmailService(otp, token);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    console.error(error);
    next(error);
  }
};

// Get logged-in user data
export const getLoggedInUserData = async (req: any, res: Response) => {
  try {
    const result = await getLoggedInUserDataService(req.user);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
  }
};

// Get user rides
export const getAllRides = async (req: any, res: Response) => {
  try {
    const result = await getAllRidesService(req.user?.id);
    res.status(201).json(result);
  } catch (error) {
    console.error(error);
  }
};
