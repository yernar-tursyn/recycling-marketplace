import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return await bcrypt.hash(password, salt);
};

export const comparePasswords = async (
  password: string,
  hashedPassword: string
): Promise<boolean> => {
  return await bcrypt.compare(password, hashedPassword);
};

export const generateToken = (userId: number): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined in environment variables");
  }

  return jwt.sign({ userId: userId }, process.env.JWT_SECRET, {
    expiresIn: "30d",
  });
};
