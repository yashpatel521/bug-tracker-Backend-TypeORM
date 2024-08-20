import { exec } from "child_process";
import path from "path";

import { AppleDataType } from "../utils/types";

const executeScript = async (type: string, value: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const scraperScriptPath = path.resolve(
      __dirname,
      "../../scripts/appStoreScraper.mjs"
    );
    const command = `node --experimental-modules "${scraperScriptPath}" ${type} "${value}"`;

    exec(command, (error, stdout, stderr) => {
      if (error) {
        return reject(`Error executing scraper: ${error.message}`);
      }
      if (stderr) {
        try {
          const err = JSON.parse(stderr);
          return reject(`Scraper error: ${err.error}`);
        } catch (parseError) {
          return reject(`Scraper stderr: ${stderr}`);
        }
      }
      try {
        if (stdout) {
          const result = JSON.parse(stdout);
          resolve(result);
        } else {
          reject("No output received from scraper script.");
        }
      } catch (parseError) {
        reject(`Error parsing scraper output: ${parseError.message}`);
      }
    });
  });
};

export const getAppDetailsFromAppStore = async (
  appId: string
): Promise<any> => {
  try {
    const appDetails: AppleDataType = await executeScript("app", appId);
    if (typeof appDetails === "string") return null;
    const res = {
      title: appDetails.title,
      summary: appDetails.releaseNotes,
      score: appDetails.score,
      scoreText: appDetails.score.toFixed(1).toString(),
      description: appDetails.description,
      descriptionHTML: appDetails.description,
      appId: appDetails.appId,
      appUrl: appDetails.url,
      appIcon: appDetails.icon,
      developer: appDetails.developer,
      developerId: appDetails.developerId,
      developerEmail: appDetails.developer,
      firebaseAccount: "",
      privacyPolicyUrl: appDetails.developerWebsite,
      status: "inprogress",
      LiveUpdatedAt: new Date(appDetails.updated),
      maxInstalls: appDetails.ratings,
      ratings: appDetails.ratings,
      reviews: appDetails.reviews,
      createdAt: new Date(),
      type: "apple",
      updatedAt: new Date(),
    };
    return res;
  } catch (err) {
    console.log(err);
  }
};
