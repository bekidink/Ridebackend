import twilio from "twilio";
const prisma =require("../utils/prisma") ;
import jwt from "jsonwebtoken";
const { nylas } =require("../../app");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID!,
  process.env.TWILIO_AUTH_TOKEN!,
  {
    lazyLoading: true,
  }
);

export const sendOtpToPhone = async (phone_number: string) => {
  return await client.verify.v2
    ?.services(process.env.TWILIO_SERVICE_SID!)
    .verifications.create({
      channel: "sms",
      to: phone_number,
    });
};

export const verifyPhoneOtp = async (phone_number: string, otp: string) => {
  return await client.verify.v2
    .services(process.env.TWILIO_SERVICE_SID!)
    .verificationChecks.create({
      to: phone_number,
      code: otp,
    });
};

export const sendOtpToEmail = async (driver: any, otp: string) => {
  const token = jwt.sign(
    { driver, otp },
    process.env.EMAIL_ACTIVATION_SECRET!,
    { expiresIn: "5m" }
  );

  await nylas.messages.send({
    identifier: process.env.USER_GRANT_ID!,
    requestBody: {
      to: [{ name: driver.name, email: driver.email }],
      subject: "Verify your email address!",
      body: `
        <p>Hi ${driver.name},</p>
        <p>Your Ridewave verification code is ${otp}. If you didn't request this OTP, please ignore this email!</p>
        <p>Thanks,<br>Ridewave Team</p>
      `,
    },
  });

  return token;
};

export const createDriver = async (driverData: any) => {
  return await prisma.driver.create({ data: driverData });
};

export const updateDriverStatus = async (driverId: string, status: string) => {
  return await prisma.driver.update({
    where: { id: driverId },
    data: { status },
  });
};

export const getDriversByIds = async (ids: string[]) => {
  return await prisma.driver.findMany({
    where: { id: { in: ids } },
  });
};

export const createRide = async (rideData: any) => {
  return await prisma.rides.create({ data: rideData });
};

export const updateRideStatus = async (
  rideId: string,
  rideStatus: string,
  driverId: string,
  rideCharge: number
) => {
  const updatedRide = await prisma.rides.update({
    where: { id: rideId, driverId },
    data: { status: rideStatus },
  });

  if (rideStatus === "Completed") {
    await prisma.driver.update({
      where: { id: driverId },
      data: {
        totalEarning: { increment: rideCharge },
        totalRides: { increment: 1 },
      },
    });
  }

  return updatedRide;
};

export const getAllRidesByDriver = async (driverId: string) => {
  return await prisma.rides.findMany({
    where: { driverId },
    include: { driver: true, user: true },
  });
};
