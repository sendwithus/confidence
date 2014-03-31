sixpack
=======

## Getting started

```
npm install sixpack
```

## Usage

### Initialization

```
var Sixpack = require('sixpack');
var mySixpack = new Sixpack();
```

Versions in sixpack look like this:

```
version = {
	name: 'The name',	// descriptive identifier
	eventCount: 50,		// number of people who completed the desired action
	totalCount: 300 	// total number of people who experienced this version
}
```

### addVersion(id, version)

Adds a version to your A/B test. You can add and compare as many versions as you'd like.

***Parameters:***

 - id: a short identifier
 - version: the data you want to add

```
// first, create some versions
versionA = {
	name: 'Alluring Alligators',
	eventCount: 1500,
	totalCount: 3000
}

versionB = {
	name: 'Beligerent Bumblebees',
	eventCount: 2500,
	totalCount: 3000
}

// then add them to your A/B test
mySixpack.addVersion('A', versionA);
mySixpack.addVersion('B', versionB);

```

### getResult()

Evaluates the versions in your A/B test and determines which is the winning version, if there is one.

Returns an object containing:
 
 - status: a short status identifier indicating the outcome (1, 2, or 3)
 - statusMessage: a more descriptive status
   - 1: There is not enough data to determine a result.
   - 2: There is enough data, but the results are too close and there is no clear winner.
   - 3: There is enough data, and there is a clear winner.
 - winner: the name of the winner or `null` if there isn't one (statuses 1 and 2)
 - confidenceInterval: the minimum and maximum values of the confidence interval, or `null` if there is no winner (statuses 1 and 2)
 - readable: your human readable result

## Examples

***Case 1: There is not enough data to determine a result.***
 
```
// create some versions
versionC = { 
	name: 'Cranky Capybaras', 
	eventCount: 5, 
	totalCount: 50 
};

versionD = { 
	name: 'Diligent Ducklings', 
	eventCount: 60, 
	totalCount: 200 
};

versionE = { 
	name: 'Effervescent Elephants', 
	eventCount: 30, 
	totalCount: 40 
};


// add them to your A/B test
mySixpack.addVersion('C', versionC);
mySixpack.addVersion('D', versionD);
mySixpack.addVersion('E', versionE);


// evaluate them to get the result
result = mySixpack.getResult();

/*
{ status: 1,
  statusMessage: 'Not enough data',
  winner: null,
  confidenceInterval: null,
  readable: 'There is not enough data to determine a conclusive result.'
}
*/
```

***Case 2: There is enough data, but there is no clear winner.***

```
// create some versions
versionF = { 
	name: 'Freaky Flamingos', 
	eventCount: 1501, 
	totalCount: 3000 
};

versionG = { 
	name: 'Gregarious Gorillas', 
	eventCount: 1500, 
	totalCount: 3000 
};

// add them to your A/B test
mySixpack.addVersion('F', versionF);
mySixpack.addVersion('G', versionG);

// evaluate them to get the result
result = mySixpack.getResult();

/*
{ status: 2,
  statusMessage: 'Enough data no result',
  winner: null,
  confidenceInterval: null,
  readable: 'We have enough data to say we cannot predict a winner with 95% certainty.'
}
*/
```

***Case 3: There is enough data and there is a clear winner.***

```
// create some versions
versionH = { 
	name: 'Hungry Hippopotami', 
	eventCount: 2500, 
	totalCount: 3000 
};

versionI = { 
	name: 'Irritable Iguanas', 
	eventCount: 1500, 
	totalCount: 3000 
};

mySixpack.addVersion('H', versionH);
mySixpack.addVersion('I', versionI);


result = mySixpack.getResult();

/*
{ status: 3,
  statusMessage: 'Enough data and result',
  winner: 'Hungry Hippopotomi',
  confidenceInterval: { min: 82, max: 84.67 },
  readable: 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Hungry Hippopotomi" version will fall between 82% and 84.67%, 95% of the time' }
*/
```


## Issues and Questions

Found a bug? Create an [issue](https://github.com/sendwithus/sixpack/issues) here on GitHub!

For general questions, tweet me [@jessicaraygun](https://twitter.com/jessicaraygun)

## Testing

// TODO Confirm later

```
cd node_modules/sixpack/
npm install
npm test
```
## License

// TODO license from sendwithus - where is this? - as a file
https://github.com/sendwithus/templates/blob/master/LICENSE
