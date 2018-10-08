#!/usr/bin/env node
const reader = require('readline')
const fs = require('fs')

// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
  console.log('Usage: node ' + process.argv[1] + ' INPUT_FILENAME OUTPUT_FILENAME OFFENDING_TEXT REPLACEMENT_TEXT')
  process.exit(1)
}

const inputFilename = process.argv[2]
const outputFilename = process.argv[3]

const OFFENDING_TEXT = process.argv[4] || "\,"
const REPLACEMENT_TEXT = process.argv[5] || "\:"

const rectifyMultilines = OFFENDING_TEXT === "\\n"

// Init line reader
const inputReadStream = fs.createReadStream(inputFilename);
const lineReader = reader.createInterface({
  input: inputReadStream,
  output: process.stdout,
  terminal: false
});

// Init output values
let outputText = ""
let lastLine

const writeOutput = (text, isQuoteOpened) => {
  if(isQuoteOpened) {
    // in this case, only store the lastLine.
    lastLine = text
    return
  }
  // store in-memory the output as a new line
  outputText += text + "\n"
}

const retrieveLastLine = () => {
  return lastLine
}

/**
 * Check if a line is quote-opened.
 * Only available if trying to fix '\n' char
 *
 * @param line
 * @returns {boolean} true if is opened, false otherwise
 */
const isQuoteOpened = (line) => {
  if(!rectifyMultilines) {
    return false
  }
  const quotesCount = line.match(/"/g)
  return quotesCount && (quotesCount.length % 2 === 1)
}

// Init line control variables
let lineNum = 0
let wasQuoteOpened = false

// Read all input text, line-per-line
lineReader.on('line', (line) => {
  lineNum++
  let lineFixed = ""
  let step = 0

  while(1) {
    step++

    if(wasQuoteOpened) {
      lastLine = retrieveLastLine()
      line = lastLine + line
      wasQuoteOpened = false
    }

    wasQuoteOpened = isQuoteOpened(line)

    // next result is the first quoted match
    const nextQuoted = line.match(/"[^"]*?[^"]*?"/);
    if(wasQuoteOpened || (!nextQuoted || !nextQuoted.length)) {
      // save the rest of the text and exit
      lineFixed += line
      break
    }

    // save the text until the found result begins
    lineFixed += line.slice(0, nextQuoted.index)

    // find & replace all instances of the offending char
    let matchedText = nextQuoted[0]
    const quoteFixed = matchedText.replace(new RegExp(OFFENDING_TEXT, 'g'), REPLACEMENT_TEXT)

    // save the fixed text
    lineFixed += quoteFixed

    // remove the already read part from the input line, and start over.
    line = line.slice(nextQuoted.index + Math.max(quoteFixed.length, 0))
  }
  writeOutput(lineFixed, wasQuoteOpened)
});

// When finished, write result to output file
inputReadStream.on('end', () => {
  fs.writeFile(outputFilename, outputText, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.')
    } else{
      console.log('All done!')
    }
  });
})
