import play from "google-play-scraper";

const getAppDetails = async (appId) => {
  try {
    const appDetails = await play.app({ appId });
    console.log(JSON.stringify(appDetails));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
};

const appId = process.argv[2];

if (!appId) {
  console.error(JSON.stringify({ error: "No appId provided" }));
  process.exit(1);
}

getAppDetails(appId)
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  });
