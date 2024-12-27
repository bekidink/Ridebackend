import jwt from "jsonwebtoken";

// send token
export const sendToken = async (user: any, res: any) => {
  const accessToken = jwt.sign(
    { id: user.id },
    process.env.ACCESS_TOKEN_SECRET!,
    {
      expiresIn: "30d",
    }
  );
   return {
     success: true,
     accessToken,
     user,
   };
};
