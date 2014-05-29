# Confidence.js

**Confidence.js** is a light-weight JavaScript library to help you make sense of your [A/B Test](http://en.wikipedia.org/wiki/A/B_testing) results. Given an A/B test (or "Split Test") result set, Confidence.js will tell you if a statistical "winner" can be determined.

## Documentation

* [API Reference and Examples](docs/API_REFERENCE.md)
* [How It Works](docs/HOW_IT_WORKS.md)

## Getting Started

[Download confidence.js here](confidence.js)

Include `confidence.js` in your HTML.
``` HTML
<script src="path/to/confidence.js"></script>
```

**You're all ready!** Start testing... with confidence.

### Example

We have many examples in the [API Reference](docs/API_REFERENCE.md). Here's a simple one to get you started:

``` js
// Create a new test result
var myConfidence = new Confidence();

// Add variant A results
myConfidence.addVariant({
  id: 'A',
  name: 'Variant A',
  conversionCount: 2500,
  eventCount: 3000
});

// Add variant B results
myConfidence.addVariant({
  id: 'B',
  name: 'Variant B',
  conversionCount: 1500,
  eventCount: 3000
});

// Get results, using Z-Test method
zTestResult = myConfidence.getResult();
/*
{
  hasWinner: true,
  hasEnoughData: true,
  winnerID: 'A',
  winnerName: 'Variant A',
  confidencePercent: 95.00,
  confidenceInterval: { min: 82, max: 84.67 },
  readable: 'With 95% confidence, the true population
    parameter of the "Variant A" variant will
    fall between 82% and 84.67%.'
}
*/
```

### How It Works

Confidence.js provides two methods for evaluating an A/B test:
- The Z-Test Method
- Chi Square Test and Marascuillo's Procedure

Selecting an appropriate method depends on your data set and use case - both have advantages.

[Learn how each method works here.](docs/HOW_IT_WORKS.md)

### Running the Tests

```
npm install
npm test
```

## Feature Requests and TODO

- implement "Confidence to beat baseline" comparison **(in progress)**
- add `removeVariant` function


## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/confidence/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun).

## Authors

Developed and maintained by [Jessica Thomas](mailto:jessica@sendwithus.com), Data Scientist @ [sendwithus.com](https://www.sendwithus.com), with guidance and tutelage from Statistics Mastermind [Emily Malcolm](mailto:emalcol@uvic.ca).
