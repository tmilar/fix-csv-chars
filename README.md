Fix CSV chars
-------------

A small node module to replace a specified char found inside double-quoted pieces of text.

__Setup__
```
npm install -g @tmilar/fix-csv-chars
```

__Usage__
```
fix-csv-chars INPUT_FILENAME OUTPUT_FILENAME OFFENDING_TEXT REPLACEMENT_TEXT
```

> Example:
```
fix-csv-chars sample.csv sample_fixed.csv "," "@@@"
```

## License

MIT
