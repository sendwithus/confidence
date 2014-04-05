## Confidence
Confidence.js is a light-weight JavaScript library to help you make sense of your A/B test results.

## Getting started

[Download confidence.js](https://raw.githubusercontent.com/sendwithus/confidence/master/confidence.js)

Include `confidence.js` on your page.
``` HTML
<script src="path/to/confidence.js"></script>
```

## Usage

### Initialization

``` js
var myConfidence = new Confidence();
```

Confidence helps you compare the variants in your A/B test. Variants in Confidence.js look like this:

``` js
variant = {
	id: 'A',                // short identifier
	name: 'Variant A',      // descriptive identifier
	conversionCount: 50,    // number of events that successfully converted
	eventCount: 300         // total number of events tracked
}
```

By default, Confidence assumes a normal distribution for each variation's conversion rate. It's results use a z score of 1.96 (2 standard deviations) a margin of error of 0.01. If you would like to use something different, pass it as a parameter when initializing the Confidence object. For instance:

``` js
var myConfidence = new Confidence({zScore: 1.5});
```

### addVariant(variant)

Adds a variant to your A/B test. You can add and compare as many variants as you'd like.

***Parameters:***

 - `variant`: the variant object you'd like to add to this A/B test

``` js
// first, create some variants
variantA = {
	id: 'A',
	name: 'Alluring Alligators',
	conversionCount: 1500,
	eventCount: 3000
}

variantB = {
	id: 'B',
	name: 'Belligerent Bumblebees',
	conversionCount: 2500,
	eventCount: 3000
}

// then add the variants to your A/B test
myConfidence.addVariant(variantA);
myConfidence.addVariant(variantB);

```

### getResult()

Evaluates the variants in your A/B test and determines which is the winning variant, if there is one.

Returns an object containing:

 - `hasWinner`: `true` if a winner could be calculated, `false` otherwise
 - `hasEnoughData`: `true` if there is enough data to calculate a statistically significant result, `false` otherwise
 - `winnerID`: the ID of the winning variant, or `null` if there isn't one
 - `winnerName`: the name of the winning variant or `null` if there isn't one
 - `confidenceInterval`: the confidence interval, or `null` if there is no winner.
  - ex: `{ min: 0.154, max: 0.187 }`
 - `readable`: human readable result.
  - ex: `There is not enough data to determine a winner.`

## Examples

***Case 1: There is not enough data to determine a result.***

``` js
// create some variants
variantC = {
	id: 'C',
	name: 'Cranky Capybaras',
	conversionCount: 5,
	eventCount: 50
};

variantD = {
	id: 'D',
	name: 'Diligent Ducklings',
	conversionCount: 60,
	eventCount: 200
};

variantE = {
	id: 'E',
	name: 'Effervescent Elephants',
	conversionCount: 30,
	eventCount: 40
};


// add the variants to your A/B test
myConfidence.addVariant(variantC);
myConfidence.addVariant(variantD);
myConfidence.addVariant(variantE);


// evaluate the variants to get the result
result = myConfidence.getResult();

/*
{
	hasWinner: false,
	hasEnoughData: false,
	winnerID: null,
	winnerName: null,
	confidenceInterval: null,
	readable: 'There is not enough data to determine
		a conclusive result.'
}
*/
```

***Case 2: There is enough data, but there is no clear winner.***

``` js
// create some variants
variantF = {
	id: 'F',
	name: 'Freaky Flamingos',
	conversionCount: 1501,
	eventCount: 3000
};

variantG = {
	id: 'G',
	name: 'Gregarious Gorillas',
	conversionCount: 1500,
	eventCount: 3000
};

// add the variants to your A/B test
myConfidence.addVariant(variantF);
myConfidence.addVariant(variantG);

// evaluate the variants to get the result
result = myConfidence.getResult();

/*
{
	hasWinner: false,
	hasEnoughData: true,
	winnerID: null,
	winnerName: null,
	confidenceInterval: null,
	readable: 'There is no winner, the results are too close.'
}
*/
```

***Case 3: There is enough data and there is a clear winner.***

``` js
// create some variants
variantH = {
	id: 'H',
	name: 'Hungry Hippopotami',
	conversionCount: 2500,
	eventCount: 3000
};

variantI = {
	id: 'I',
	name: 'Irritable Iguanas',
	conversionCount: 1500,
	eventCount: 3000
};

// add the variants to your A/B test
myConfidence.addVariant(variantH);
myConfidence.addVariant(variantI);

// evaluate the variants to get the result
result = myConfidence.getResult();

/*
{
	hasWinner: true,
	hasEnoughData: true,
	winnerID: 'H',
	winnerName: 'Hungry Hippopotami',
	confidenceInterval: { min: 82, max: 84.67 },
	readable: 'With 95% confidence, the true population
		parameter of the "Hungry Hippopotami" variant will
		fall between 82% and 84.67%.'
}
*/
```

## Run Tests

```
npm install
npm test
```
## TODO
- variant `name` parameter optional
 - requires changes to `addVariant`, and `errors.js`
 - add "not provided" default name if left blank
- add `removeVariant` function
- zscore table lookup to provide more accurate results if 95% confidence is not available

## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/confidence/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun).
## Author
Developed and maintained by [Jessica Thomas](mailto:jessica@sendwithus.com), Data Scientist @ [sendwithus.com](https://www.sendwithus.com)
