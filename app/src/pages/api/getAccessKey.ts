import type { NextApiRequest, NextApiResponse } from "next";
import * as jwt from "jsonwebtoken";
import forKey from "@/lib/middleware/forKey";
import { Fluxus, Timestamp } from "@/utils/firebase";

const handler = async (
  req: NextApiRequest,
  res: NextApiResponse,
  signature: string,
  publicKey: string
) => {
  try {
    const accessKey = jwt.sign(
      { publicKey },
      process.env.NEXT_PUBLIC_SECRET as string
    );
    const fluxusUser = new Fluxus(publicKey);
    const doesUserExists = (await fluxusUser.getUser()).exists();
    if (!doesUserExists) {
      const now = Timestamp.now();
      await fluxusUser.addOrUpdateUser({
        authority: publicKey,
        createdAt: now,
      });
    }
    res.status(200).json({ success: true, accessKey });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

export default forKey(handler);
