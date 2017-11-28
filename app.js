const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const axios = require('axios')
require('dotenv').config()

app.get('/', function (req, res) {
  (async() => {
    const title = req.query.title
    const year = req.query.year || ''

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()

    // page.on('console', (...args) => console.log('PAGE LOG:', ...args))

    const movieUrl = await findMovieUrl(title, year)
    await page.goto(movieUrl, {waitUntil: 'domcontentloaded'})

    let result = Object.assign({title: title, year: year, url: movieUrl}, await extractRtData(page))

    res.json(result)
    browser.close()
  })()
})

async function findMovieUrl (title, year) {
  const googleKey = process.env.GOOGLE_KEY
  const googleCx = process.env.GOOGLE_CX
  const response = await axios.get(`https://www.googleapis.com/customsearch/v1?key=${googleKey}&cx=${googleCx}&q=${title} ${year}`)
  return response.data['items'][0]['link']
}

async function extractRtData (page) {
  return page.evaluate(() => {
    return {score: document.querySelector('span.meter-value > span').textContent}
  })
}

app.listen(5000, function () {
})
