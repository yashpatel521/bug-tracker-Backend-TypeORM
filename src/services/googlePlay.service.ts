import { exec } from "child_process";
import path from "path";
import { AppDetails } from "../utils/types";

const executeScript = async (type: string, value: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const scraperScriptPath = path.resolve(
      __dirname,
      "../../scripts/googlePlayScraper.mjs"
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

export const getAppDetails = async (appId: string): Promise<any> => {
  try {
    const appDetails: AppDetails = await executeScript("app", appId);
    if (typeof appDetails === "string") return null;
    const res = {
      title: appDetails.title,
      summary: appDetails.summary,
      score: appDetails.score,
      scoreText: appDetails.scoreText,
      description: appDetails.description,
      descriptionHTML: appDetails.descriptionHTML,
      appId: appDetails.appId,
      appUrl: appDetails.url,
      appIcon: appDetails.icon,
      developer: appDetails.developer,
      developerId: appDetails.developerId,
      developerEmail: appDetails.developerEmail,
      firebaseAccount: "",
      privacyPolicyUrl: appDetails.privacyPolicy,
      status: "inprogress",
      LiveUpdatedAt: new Date(appDetails.updated),
      maxInstalls: appDetails.maxInstalls,
      ratings: appDetails.ratings,
      reviews: appDetails.reviews,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    return res;
  } catch (err) {
    console.log(err);
  }
};

export const searchApps = async (term: string): Promise<any> => {
  const searchResults: any = await executeScript("search", term);
  return searchResults;
};

export const suggestApps = (term: string): Promise<any> => {
  return executeScript("suggest", term);
};

export const getTopApps = (): Promise<any> => {
  return executeScript("TOP_APP", "temp");
};
