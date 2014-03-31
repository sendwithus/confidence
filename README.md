confidence
=======
## Description
Confidence.js was designed to help you make sense of your A/B test results.

## Getting started


## Usage

### Initialization

``` js
var myConfidence = new Confidence();
```

Confidence helps you compare the variants in your A/B test. Variants in Confidence.js look like this:

``` js
variant = {
	id: 'A',		// short identifier
	name: 'Variant A',	// descriptive identifier
	conversionCount: 50,	// number of events that successfully converted
	eventCount: 300 	// total number of events tracked
}
```

### addVariant(id, variant)

Adds a variant to your A/B test. You can add and compare as many variants as you'd like.

***Parameters:***

 - id: a short identifier
 - variant: the data you want to add

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
	name: 'Beligerent Bumblebees',
	conversionCount: 2500,
	eventCount: 3000
}

// then add them to your A/B test
myConfidence.addVariant(variantA);
myConfidence.addVariant(variantB);

```

### getResult()

Evaluates the variants in your A/B test and determines which is the winning variant, if there is one.

Returns an object containing:

 - status: a short status identifier indicating the outcome (1, 2, or 3)
   - 1: There is not enough data to determine a result.
   - 2: There is enough data, but the results are too close and there is no clear winner.
   - 3: There is enough data, and there is a clear winner.
 - winner: the name of the winner or `null` if there isn't one (for status 1 and 2)
 - confidenceInterval: the minimum and maximum values of the confidence interval, or `null` if there is no winner (for status 1 and 2)
 - readable: your human readable result

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


// add them to your A/B test
myConfidence.addVariant(variantC);
myConfidence.addVariant(variantD);
myConfidence.addVariant(variantE);


// evaluate them to get the result
result = myConfidence.getResult();

/*
{
	hasWinner: false,
	hasEnoughData: false,
	winnerID: null,
	winnerName: null,
	confidenceInterval: null,
	readable: 'There is not enough data to determine a conclusive result.'
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

// add them to your A/B test
myConfidence.addVariant(variantF);
myConfidence.addVariant(variantG);

// evaluate them to get the result
result = myConfidence.getResult();

/*
{
	hasWinner: false,
	hasEnoughData: true,
	winnerID: null,
	winnerName: null,
	confidenceInterval: null,
	readable: 'We have enough data to say we cannot predict a winner with 95% certainty.'
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

myConfidence.addVariant(variantH);
myConfidence.addVariant(variantI);

result = myConfidence.getResult();

/*
{
	hasWinner: true,
	hasEnoughData: true,
	winnerID: 'H',
	winnerName: 'Hungry Hippopotami',
	confidenceInterval: { min: 82, max: 84.67 },
	readable: 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Hungry Hippopotami" variant will fall between 82% and 84.67%, 95% of the time'
}
*/
```

## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/confidence/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun).

## Using with Node.js
```
npm install confidence
```
###Testing...

###Example...

// TODO Confirm later

```
cd node_modules/confidence/
npm install
npm test
```
