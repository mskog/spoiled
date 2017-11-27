const express = require('express')
const app = express()
const puppeteer = require('puppeteer')
const snakeCase = require('lodash.snakecase')

app.get('/', function (req, res) {
  (async() => {
    const title = snakeCase(req.query.title)
    const year = req.query.year

    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']})
    const page = await browser.newPage()

    // page.on('console', (...args) => console.log('PAGE LOG:', ...args))

    let result = {}

    result = await navWithYear(title, year, page, result)

    if ('score' in result) {
      result['title'] = title

      res.json(result)
      browser.close()
    } else {
      result = await navWithoutYear(title, page, result)
      result['title'] = title

      res.json(result)
      browser.close()
    }
  })()
})

async function navWithYear (title, year, page, result) {
  const urlWithYear = `https://www.rottentomatoes.com/m/${title}_${year}`
  const navResult = await page.goto(urlWithYear, {waitUntil: 'domcontentloaded'})
  if (navResult.ok === true) {
    result['url'] = urlWithYear
    result['score'] = await extractScore(page)
  }
  return result
}

async function navWithoutYear (title, page, result) {
  const url = `https://www.rottentomatoes.com/m/${title}`
  const navResult = await page.goto(url, {waitUntil: 'domcontentloaded'})
  if (navResult.ok === true) {
    result['url'] = url
    result['score'] = await extractScore(page)
  }
  return result
}

async function extractScore (page) {
  return page.evaluate(() => {
    return document.querySelector('span.meter-value > span').textContent
  })
}

app.listen(5000, function () {
})
