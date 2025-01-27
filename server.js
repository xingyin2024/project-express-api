import express from "express";
import cors from "cors";
import listEndpoints from "express-list-endpoints";
import traktamente from "./data/traktamente.json";

const port = process.env.PORT || 9000;
const app = express();

app.use(cors());
app.use(express.json());

// API Documentation
app.get("/", (req, res) => {
  const endpoints = listEndpoints(app);

  res.send({
    message:
      "This API is made to search Utlandstraktamenten (allowance abroad) since 2023 based on the Swedish Tax Agency's general advice.",
    description:
      "Traktamenten is a Swedish term related to the allowance on increased living expenses abroad for business trips, temporary work, and dual residence.",
    endpoints: endpoints,
    explanation: {
      "/traktamente": "Get all data of countries, allowance, and year",
      "/traktamente?year=2024":
        "Get all data of countries and allowance in year 2024",
      "/traktamente?country=USA": "Get allowance of USA in years 2023 and 2024",
      "/traktamente?country=USA&year=2024":
        "Only get allowance of USA in year 2024",
      "/traktamente/code/:code":
        "Get data by country code (e.g., /traktamente/code/PF)",
      "/traktamente/country/:country":
        "Get data by country or territory name (e.g., /traktamente/country/Franska-Polynesien)",
    },
  });
});

// Get all data or filter by query parameters
app.get("/traktamente", (req, res) => {
  const { country, year } = req.query;

  let filteredTraktamente = traktamente;

  if (country) {
    filteredTraktamente = filteredTraktamente.filter(
      (item) =>
        item["country or territory"] &&
        item["country or territory"]
          .toLowerCase()
          .includes(country.toLowerCase())
    );
  }

  if (year) {
    filteredTraktamente = filteredTraktamente.filter(
      (item) => item.year === year
    );
  }

  if (filteredTraktamente.length > 0) {
    res.json(filteredTraktamente);
  } else {
    res.status(404).send("Bad request! No data found.");
  }
});

// Get data by code
app.get("/traktamente/code/:code", (req, res) => {
  const { code } = req.params;

  if (!code) {
    return res.status(400).send("Bad request! Please provide a valid code.");
  }

  const result = traktamente.find(
    (item) => item.code && item.code.toLowerCase() === code.toLowerCase()
  );

  if (result) {
    res.json(result);
  } else {
    res.status(404).send("No data found for the provided code.");
  }
});

// Get data by country or territory name
app.get("/traktamente/country/:country", (req, res) => {
  const { country } = req.params;

  if (!country) {
    return res
      .status(400)
      .send("Bad request! Please provide a valid country or territory name.");
  }

  // Replace hyphens with spaces to match the data
  const formattedCountry = country.replace(/-/g, " ").toLowerCase();

  const result = traktamente.find(
    (item) =>
      item["country or territory"] &&
      item["country or territory"].toLowerCase() === formattedCountry
  );

  if (result) {
    res.json(result);
  } else {
    res
      .status(404)
      .send("No data found for the provided country or territory.");
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
