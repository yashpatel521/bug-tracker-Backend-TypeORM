import { Request, Response } from "express";
import { getAppDetails } from "../services/googlePlay.service";

export const getAppInfo = async (req: Request, res: Response) => {
  const { appId } = req.params;

  try {
    const appDetails = await getAppDetails(appId);
    res.json(appDetails);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};
