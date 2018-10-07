#!/usr/bin/env node
const reader = require('readline')
const fs = require('fs')

// Make sure we got a filename on the command line.
if (process.argv.length < 4) {
  console.log('Usage: node ' + process.argv[1] + ' INPUT_FILENAME OUTPUT_FILENAME OFFENDING_TEXT REPLACEMENT_TEXT');
  process.exit(1);
}

const inputFilename = process.argv[2]
const outputFilename = process.argv[3]

const OFFENDING_CHAR = process.argv[4] || "\,"
const REPLACEMENT_TEXT = process.argv[5] || "\:"

// Init line reader
const inputReadStream = fs.createReadStream(inputFilename);
const lineReader = reader.createInterface({
  input: inputReadStream,
  output: process.stdout,
  terminal: false
});

// Init output writer
let outputText = ""
const writeOutput = (text) => {
  // store in-memory the output as a new line
  outputText += text + "\n"
}

// Read all input line per line and write output
lineReader.on('line', (line) => {
  // match quoted phrases
  let fixedLine = ""
  let step = 0
  while(1) {
    // next result is the first quoted match
    step++
    const nextQuoted = line.match(/"[^"]*?[^"]*?"/);
    if(!nextQuoted || !nextQuoted.length) {
      break
    }

    // save the text until the found result begins
    fixedLine += line.slice(0, nextQuoted.index)

    // find & replace all instances of the offending char
    let matchedText = nextQuoted[0]
    const quoteFixed = matchedText.replace(new RegExp(OFFENDING_CHAR, 'g'), REPLACEMENT_TEXT)
    // save the fixed text

    fixedLine += quoteFixed

    // remove the already read part from the input line, and start over.
    line = line.slice(nextQuoted.index + Math.max(quoteFixed.length, 0))
  }
  writeOutput(fixedLine)
});

// When finished, write result to output file
inputReadStream.on('end', () => {
  fs.writeFile(outputFilename, outputText, 'utf8', function (err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else{
      console.log('All done!');
    }
  });
})
