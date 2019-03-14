const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const axios = require("axios");
require("dotenv").config();

app.get("/", function(req, res) {
  (async () => {
    const browser = await puppeteer.launch({
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    process.on("unhandledRejection", (reason, p) => {
      console.log(reason);
      browser.close();
      res.status("500").end();
    });

    const title = req.query.title;
    const year = req.query.year || "";

    const page = await browser.newPage();

    // page.on('console', (...args) => console.log('PAGE LOG:', ...args))

    const movieUrl = await findMovieUrl(title, year);
    await page.goto(movieUrl, { waitUntil: "domcontentloaded" });

    let result = Object.assign(
      { title: title, year: year, url: movieUrl },
      await extractRtData(page)
    );

    res.json(result);
    browser.close();
  })();
});

async function findMovieUrl(title, year) {
  const response = await axios.get(
    `https://www.googleapis.com/customsearch/v1?key=${
      process.env.GOOGLE_KEY
    }&cx=${process.env.GOOGLE_CX}&q=${title} ${year}`
  );
  return response.data["items"][0]["link"];
}

async function extractRtData(page) {
  return page.evaluate(() => {
    return {
      score: document
        .querySelector(".mop-ratings-wrap__percentage")
        .textContent.match(/\d+/)[0]
    };
  });
}

app.listen(5000, function() {});
