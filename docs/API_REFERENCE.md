# API Reference and Examples

## Installation

[Download confidence.js here](confidence.js)

Include `confidence.js` in your HTML.
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

Evaluates the variants in your A/B test using a Z-Test and determines which is the winning variant, if there is one.

For more information on The Z-Test Method, [read how it works here](HOW_IT_WORKS.md).

Returns an object containing:

 - `hasWinner`: `true` if a winner could be calculated, `false` otherwise
 - `hasEnoughData`: `true` if there is enough data to calculate a statistically significant result, `false` otherwise
 - `winnerID`: the ID of the winning variant, or `null` if there isn't one
 - `winnerName`: the name of the winning variant or `null` if there isn't one
 - `confidenceInterval`: the confidence interval, or `null` if there is no winner.
  - ex: `{ min: 0.154, max: 0.187 }`
 - `readable`: human readable result.
  - ex: `There is not enough data to determine a winner.`

### getMarascuilloResult()

Evaluates the variants in your A/B test using the [Chi Square Test and Marascuillo's Procedure](http://www.prenhall.com/behindthebook/0136149901/pdf/Levine_CH12.pdf).

For more information on Chi Square Test and Marascuillo's Procedure, [read how it works here](HOW_IT_WORKS.md).

Returns an object containing:

 - `hasWinner`: `true` if a winner could be calculated, `false` otherwise
 - `hasEnoughData`: `true` if there is enough data to calculate a statistically significant result, `false` otherwise
 - `winnerID`: the ID of the winning variant, or `null` if there isn't one
 - `winnerName`: the name of the winning variant or `null` if there isn't one

## Examples

***Case 1: There is not enough data to determine a result.***

``` js
// create some variants
variantC = {
  id: 'C',
  name: 'Cranky Capybaras',
  conversionCount: 5,
  eventCount: 25
};

variantD = {
  id: 'D',
  name: 'Diligent Ducklings',
  conversionCount: 3,
  eventCount: 20
};

variantE = {
  id: 'E',
  name: 'Effervescent Elephants',
  conversionCount: 6,
  eventCount: 15
};


// add the variants to your A/B test
myConfidence.addVariant(variantC);
myConfidence.addVariant(variantD);
myConfidence.addVariant(variantE);


// evaluate the variants using a Z-Test to get the result
zTestResult = myConfidence.getResult();

/*
{
  hasWinner: false,
  hasEnoughData: false,
  winnerID: null,
  winnerName: null,
  confidencePercent: null,
  confidenceInterval: null,
  readable: 'There is not enough data to determine
    a conclusive result.'
}
*/

// evaluate the variants using Chi-Square and Marascuillo's Procedure to get the result
marascuilloResult = myConfidence.getMarascuilloResult();

/*
{
  hasWinner: false,
  hasEnoughData: false,
  winnerID: null,
  winnerName: null
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

// evaluate the variants using a Z-Test to get the result
zTestResult = myConfidence.getResult();

/*
{
  hasWinner: false,
  hasEnoughData: true,
  winnerID: null,
  winnerName: null,
  confidencePercent: 95.00,
  confidenceInterval: null,
  readable: 'There is no winner, the results are too close.'
}
*/

// evaluate the variants using Chi-Square and Marascuillo's Procedure to get the result
marascuilloResult = myConfidence.getMarascuilloResult();

/*
{
  hasWinner: false,
  hasEnoughData: true,
  winnerID: null,
  winnerName: null
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

// evaluate the variants using a Z-Test to get the result
zTestResult = myConfidence.getResult();

/*
{
  hasWinner: true,
  hasEnoughData: true,
  winnerID: 'H',
  winnerName: 'Hungry Hippopotami',
  confidencePercent: 95.00,
  confidenceInterval: { min: 82, max: 84.67 },
  readable: 'With 95% confidence, the true population
    parameter of the "Hungry Hippopotami" variant will
    fall between 82% and 84.67%.'
}
*/

// evaluate the variants using Chi-Square and Marascuillo's Procedure to get the result
marascuilloResult = myConfidence.getMarascuilloResult();

/*
{
  hasWinner: true,
  hasEnoughData: true,
  winnerID: 'H',
  winnerName: 'Hungry Hippopotami'
}
*/
```
***Case 4: Z-Test and Marascuillo results differ.***

``` js
// create some variants
variantJ = {
  id: 'J',
  name: 'Jealous Jackals',
  conversionCount: 5,
  eventCount: 50
};

variantK = {
  id: 'K',
  name: 'Kinky Koalas',
  conversionCount: 60,
  eventCount: 200
};

variantL = {
  id: 'L',
  name: 'Lanky Llamas',
  conversionCount: 30,
  eventCount: 40
};


// add the variants to your A/B test
myConfidence.addVariant(variantJ);
myConfidence.addVariant(variantK);
myConfidence.addVariant(variantL);


// evaluate the variants using a Z-Test to get the result
zTestResult = myConfidence.getResult();

/*
{
  hasWinner: false,
  hasEnoughData: false,
  winnerID: null,
  winnerName: null,
  confidencePercent: null,
  confidenceInterval: null,
  readable: 'There is not enough data to determine
    a conclusive result.'
}
*/

// evaluate the variants using Chi-Square and Marascuillo's Procedure to get the result
marascuilloResult = myConfidence.getMarascuilloResult();

/*
{
  hasWinner: true,
  hasEnoughData: true,
  winnerID: 'L',
  winnerName: 'Lanky Llamas'
}
*/
```