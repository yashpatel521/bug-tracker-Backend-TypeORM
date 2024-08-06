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

const searchApps = async (term) => {
  try {
    const results = await play.search({ term, num: 250 });
    console.log(JSON.stringify(results));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
};

const suggestApps = async (term) => {
  try {
    const results = await play.suggest({ term });
    console.log(JSON.stringify(results));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
};

const [type, value] = process.argv.slice(2);

if (!type || !value) {
  console.error(JSON.stringify({ error: "No type or value provided" }));
  process.exit(1);
}

if (type === "app") {
  getAppDetails(value)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    });
} else if (type === "search") {
  searchApps(value)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    });
} else if (type === "suggest") {
  suggestApps(value)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(JSON.stringify({ error: error.message }));
      process.exit(1);
    });
} else {
  console.error(JSON.stringify({ error: "Invalid type provided" }));
  process.exit(1);
}
