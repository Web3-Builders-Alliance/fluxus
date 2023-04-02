import { NextApiRequest, NextApiResponse } from "next";
import { isAuthenticated } from "../auth";

const withProtect = (handler: any) => {
  return async (req: NextApiRequest, res: NextApiResponse) => {
    try {
      if (!req.headers.authorization) {
        return res.status(401).json({
          success: false,
          message: "Not authorized.",
        });
      }
      if (!req.headers.signature) {
        return res.status(401).json({
          success: false,
          message: "Invalid signature.",
        });
      }
      if (!req.body.publicKey) {
        return res.status(401).json({
          success: false,
          message: "Invalid public key.",
        });
      }
      const token = req.headers.authorization?.split(" ")[1];
      const publicKey = req.body.publicKey as string;
      const signature = req.headers.signature as string;
      const isVerified = isAuthenticated(token, publicKey);
      if (!isVerified) {
        return res.status(401).json({
          success: false,
          message: "Signature verification failed.",
        });
      }
      return handler(req, res, signature, publicKey);
    } catch (error) {
      return res.status(401).json({
        success: false,
        message: "Not authorized.",
      });
    }
  };
};
export default withProtect;
