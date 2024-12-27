import twilio from "twilio";
import prisma from "../utils/prisma";
import jwt from "jsonwebtoken";
import { nylas } from "../../app";
import { sendToken } from "../utils/send-token";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const client = twilio(accountSid, authToken, { lazyLoading: true });

// Register new user service
export const registerUserService = async (phone_number: string) => {
  try {
    await client.verify.v2
      ?.services(process.env.TWILIO_SERVICE_SID!)
      .verifications.create({ channel: "sms", to: phone_number });

    return { success: true };
  } catch (error) {
    console.error(error);
    return { success: false, message: "Error sending OTP" };
  }
};

// Verify OTP service
export const verifyOtpService = async (phone_number: string, otp: string) => {
  try {
    await client.verify.v2
      .services(process.env.TWILIO_SERVICE_SID!)
      .verificationChecks.create({ to: phone_number, code: otp });

    const isUserExist = await prisma.user.findUnique({
      where: { phone_number },
    });

    if (isUserExist) {
      const tokenData = await sendToken(isUserExist, null);
      return { ...tokenData, message: "User verified successfully" };
    } else {
      const user = await prisma.user.create({ data: { phone_number } });
      return { success: true, message: "OTP verified and user created", user };
    }
  } catch (error) {
    console.error(error);
    return { success: false, message: "OTP verification failed" };
  }
};

// Send OTP to email service
export const sendOtpToEmailService = async (
  email: string,
  name: string,
  userId: string
) => {
  try {
    const otp = Math.floor(1000 + Math.random() * 9000).toString();
    const user = { userId, name, email };

    const token = jwt.sign(
      { user, otp },
      process.env.EMAIL_ACTIVATION_SECRET!,
      {
        expiresIn: "5m",
      }
    );

    await nylas.messages.send({
      identifier: process.env.USER_GRANT_ID!,
      requestBody: {
        to: [{ name, email }],
        subject: "Verify your email address!",
        body: `
          <p>Hi ${name},</p>
          <p>Your Ridewave verification code is ${otp}. If you didn't request this OTP, please ignore this email!</p>
          <p>Thanks,<br>Ridewave Team</p>
        `,
      },
    });

    return { success: true, token };
  } catch (error: any) {
    console.error(error);
    return { success: false, message: error.message };
  }
};

// Verify email OTP service
export const verifyEmailService = async (otp: string, token: string) => {
  try {
    const newUser: any = jwt.verify(
      token,
      process.env.EMAIL_ACTIVATION_SECRET!
    );

    if (newUser.otp !== otp) {
      return { success: false, message: "OTP is not correct or expired" };
    }

    const { name, email, userId } = newUser.user;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user?.email === null) {
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { name, email },
      });
      const tokenData = await sendToken(updatedUser, null);
      return { ...tokenData, message: "Email verified successfully" };
    }

    return { success: true, message: "Email verified successfully" };
  } catch (error) {
    console.error(error);
    return { success: false, message: "OTP verification failed or expired" };
  }
};

// Get logged-in user data service
export const getLoggedInUserDataService = async (user: any) => {
  return { success: true, user };
};

// Get all rides service
export const getAllRidesService = async (userId: string) => {
  const rides = await prisma.rides.findMany({
    where: { userId },
    include: { driver: true, user: true },
  });
  return { success: true, rides };
};
