## Confidence
Confidence.js is a light-weight javascript library to help you make sense of your A/B test results.

## Getting started

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

 - `hasWinner`: true if a winner could be calculated, false otherwise
 - `hasEnoughData`: true if there is enough data to calculate a statistically significant result, false otherwise
 - `winnerID`: the ID of the winning variation, or `null` if there isn't one
 - `winnerName`: the name of the winning variation or `null` if there isn't one
 - `confidenceInterval`: the minimum and maximum values of the confidence interval, or `null` if there is no winner
 - `readable`: your human readable result

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
	readable: 'We have enough data to say we cannot
		predict a winner with 95% certainty.'
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
	readable: 'In a hypothetical experiment that
		is repeated infinite times, the average
		rate of the "Hungry Hippopotami" variant
		will fall between 82% and 84.67%, 95%
		of the time'
}
*/
```

## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/confidence/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun).

## Run Tests

```
npm install
npm test
```
