sixpack
=======

## Getting started

```
npm install sixpack
```

## Usage

### Initialization

``` js
var mySixpack = new Sixpack();
```

Versions in sixpack look like this:

``` js
variant = {
	name: 'Variant A',	// descriptive identifier
	conversionCount: 50,		// number of events that successfully converted *** CONVERSIONCOUNT
	eventCount: 300 	// total number of events tracked ***EVENTCOUNT
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
	name: 'Alluring Alligators',
	conversionCount: 1500,
	eventCount: 3000
}

variantB = {
	name: 'Beligerent Bumblebees',
	conversionCount: 2500,
	eventCount: 3000
}

// then add them to your A/B test
mySixpack.addVariant('A', variantA);
mySixpack.addVariant('B', variantB);

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
	name: 'Cranky Capybaras',
	conversionCount: 5,
	eventCount: 50
};

variantD = {
	name: 'Diligent Ducklings',
	conversionCount: 60,
	eventCount: 200
};

variantE = {
	name: 'Effervescent Elephants',
	conversionCount: 30,
	eventCount: 40
};


// add them to your A/B test
mySixpack.addVariant('C', variantC);
mySixpack.addVariant('D', variantD);
mySixpack.addVariant('E', variantE);


// evaluate them to get the result
result = mySixpack.getResult();

/*
{ status: 1,
  winner: null,
  confidenceInterval: null,
  readable: 'There is not enough data to determine a conclusive result.'
}
*/
```

***Case 2: There is enough data, but there is no clear winner.***

``` js
// create some variants
variantF = {
	name: 'Freaky Flamingos',
	conversionCount: 1501,
	eventCount: 3000
};

variantG = {
	name: 'Gregarious Gorillas',
	conversionCount: 1500,
	eventCount: 3000
};

// add them to your A/B test
mySixpack.addVariant('F', variantF);
mySixpack.addVariant('G', variantG);

// evaluate them to get the result
result = mySixpack.getResult();

/*
{ status: 2,
  winner: null,
  confidenceInterval: null,
  readable: 'We have enough data to say we cannot predict a winner with 95% certainty.'
}
*/
```

***Case 3: There is enough data and there is a clear winner.***

``` js
// create some variants
variantH = {
	name: 'Hungry Hippopotami',
	conversionCount: 2500,
	eventCount: 3000
};

variantI = {
	name: 'Irritable Iguanas',
	conversionCount: 1500,
	eventCount: 3000
};

mySixpack.addVariant('H', variantH);
mySixpack.addVariant('I', variantI);


result = mySixpack.getResult();

/*
{ status: 3,
  winner: 'Hungry Hippopotomi',
  confidenceInterval: { min: 82, max: 84.67 },
  readable: 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Hungry Hippopotomi" variant will fall between 82% and 84.67%, 95% of the time' }
*/
```


## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/sixpack/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun)

## Using with Node.js

###Testing...

###Example...

// TODO Confirm later

```
cd node_modules/sixpack/
npm install
npm test
```
## License

// TODO license from sendwithus - where is this? - as a file
https://github.com/sendwithus/templates/blob/master/LICENSE

// notice and licence from sendwithus python:

https://github.com/sendwithus/sendwithus_python/blob/master/LICENSE
