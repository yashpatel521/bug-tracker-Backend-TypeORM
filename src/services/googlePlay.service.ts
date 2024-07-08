import { exec } from "child_process";
import path from "path";

export const getAppDetails = (appId: string): Promise<any> => {
  return new Promise((resolve, reject) => {
    const scraperScriptPath = path.resolve(
      __dirname,
      "../../scripts/googlePlayScraper.mjs"
    );
    const command = `node --experimental-modules "${scraperScriptPath}" ${appId}`;

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
