import store from "app-store-scraper";

const getAppDetails = async (appId) => {
  try {
    const appDetails = await store.app({ id: appId, ratings: true });
    console.log(JSON.stringify(appDetails));
  } catch (error) {
    console.error(JSON.stringify({ error: error.message }));
    process.exit(1);
  }
};

const searchApps = async (term) => {
  try {
    const results = await store.search({ term, num: 25 });
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
} else {
  console.error(JSON.stringify({ error: "Invalid type provided" }));
  process.exit(1);
}
