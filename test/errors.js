var Confidence = require('../confidence.js');

//**************************************************************************//

// TODO:  Change error messages to say what the test /should/ do instead of what it does.

module.exports['Add Variant'] = {

  // Verifies that the total count cannot be zero.
  'Incorrectly formatted variant': function(test) {
    confidence = new Confidence();
    test.ok(confidence);

    test.throws(function() {
      confidence.addVariant({
        id: 'A',
        name: 'Variant A',
        conversionCount: 1356,
      });
    }, Error, 'variant object should have not had name, conversionCount, and eventCount properties');
    test.done();
  },

  'Correctly formatted variant adds successfully': function(test) {
    confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 3000,
      eventCount: 3000
    });

    test.ok(confidence._variants.hasOwnProperty('B'));

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Variant'] = {

  'Test existence of specific variant': function(test) {

    confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1356,
      eventCount: 3150
    });

    // Verify that the requested variant throws an error when it doesn't exist
    test.throws(function() {
      confidence.getVariant('F');
    }, Error, 'Variant F should not have existed.');

    // Verify that the requested variant doesn't throw an error when it does exist
    test.doesNotThrow(function() {
      confidence.getVariant('A');
    }, Error, 'Variant A should have existed.');

    test.done();
  },
};

//**************************************************************************//

module.exports['Has Variants'] = {

  'Test existence of any variant' : function(test) {

    var confidence = new Confidence();
    test.ok(confidence);

    // If no variants have been added, hasVariants returns false
    test.equals(confidence.hasVariants(confidence._variants), false, '_variants should be empty');

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 3000,
      eventCount: 3000
    });

    // If a variant has been added, hasVariants returns true
    test.equals(confidence.hasVariants(confidence._variants), true, '_variants should not be empty');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Result'] = {
  // Verifies that an error is thrown when no variants have been added
  // and if variants have been added, no error is thrown.
  'No variants': function(test) {
    var confidence = new Confidence();
    test.ok(confidence);

    test.throws(function() {
      confidence.getResult();
    }, Error, 'There are no variants available.');

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1356,
      eventCount: 3150
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 1356,
      eventCount: 3150
    });

    test.doesNotThrow(function() {
      confidence.getResult();
    }, Error, 'There should have been variants available.');

    test.done();
  },
  // Verifies that if there is a variant with less than 100 total count,
  // there is not enough data to produce a result.
  'Less than 100 eventCount': function(test) {
    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 20,
      eventCount: 50
    });

    var result = confidence.getResult();

    // Only one variant: no winner and not enough data
    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, false, 'There should not be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

    // Another variant that has enough data
    confidence.addVariant({
      id: 'B',
      name: 'New',
      conversionCount: 800,
      eventCount: 1000
    });

    result = confidence.getResult();

   // Because Variant A does not have enough data, the test does not have enough data.
    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, false, 'There should not be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

    test.done();
  },
  // Verifies that if there is a variant with greater than 100 total count,
  // if we haven't reached the required sample size there is not enough data
  // to produce a result
  'More than 100 eventCount but still not enough data': function(test) {
    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 20,
      eventCount: 101
    });

    var result = confidence.getResult();

    // Only one variant
    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, false, 'There should not be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

    // Another variant with not enough data
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 25,
      eventCount: 101
    });

    result = confidence.getResult();

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, false, 'There should not be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'There should be no confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'There should not be enough data to determine result');

    test.done();
  },
  // Verifies correct output if there is enough data but no result.
  'Enough data but no result': function(test) {
    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 200,
      eventCount: 3150
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 201,
      eventCount: 3150
    });

    var result = confidence.getResult();

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is no winner, the results are too close.', 'Enough data, but no conclusive result');

    test.done();

  },
  // Verifies correct output if there is enough data and there is a winner.
  'Enough data and a clear winner': function(test) {
    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 800,
      eventCount: 3150
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 200,
      eventCount: 3150
    });

    var result = confidence.getResult();

    var expectedResult = 'With 95% confidence, the true population parameter of the';
    expectedResult += ' "Variant A" variant will fall between 23.88% and 26.92%.';

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'A', 'A should be the winnerID');
    test.equal(result.winnerName, 'Variant A', 'Variant A should be the winnerName');
    test.deepEqual(result.confidenceInterval, {
      min: 23.88,
      max: 26.92
    }, 'Confidence interval should not overlap');
    test.equal(result.readable, expectedResult , 'The result should have the long winning speech');

    test.done();
  },
};

//**************************************************************************//

module.exports['Analyze Confidence Intervals'] = {
  'Test enough data with no clear winner': function(test) {

    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1500,
      eventCount: 3000
    });

    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 1501,
      eventCount: 3000
    });

    var confidenceIntervals = {};

    confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

    confidenceIntervals['B'] = { min: 0.48244106709755835, max: 0.5182255995691082 };

    // analyze confidence intervals takes a confidence interval object

    var messageNoWinner = 'We have enough data to say we cannot predict a winner with 95% certainty.';

    var result = confidence.analyzeConfidenceIntervals(confidenceIntervals);

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is no winner, the results are too close.', 'Enough data, but no conclusive result');

    test.done();
  },
    'Test enough data with a clear winner': function(test) {

    var confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1500,
      eventCount: 3000
    });

    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 2500,
      eventCount: 3000
    });

    var confidenceIntervals = {};

    confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

    confidenceIntervals['B'] = { min: 0.8199972225115139, max: 0.8466694441551529 };

    var messageWinner = 'With 95% confidence, the true population parameter of the';
    messageWinner += ' "Variant B" variant will fall between 82% and 84.67%.';

    var result = confidence.analyzeConfidenceIntervals(confidenceIntervals);

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'B', 'B should be the winnerID');
    test.equal(result.winnerName, 'Variant B', 'Variant B should be the winnerName');
    test.deepEqual(result.confidenceInterval, {
      min: 82,
      max: 84.67
    }, 'Confidence interval should not overlap');
    test.equal(result.readable, messageWinner, 'The result should have the long winning speech');

    test.done();
  },
};

//**************************************************************************//

module.exports['Sort List'] = {

  // Verifies that a list gets sorted in the right order
  'Sort a list from greatest to least': function(test) {

    var confidence = new Confidence();
    test.ok(confidence);

    listToSort = [];

    listToSort.push({id: 'A', val: 0.654});
    listToSort.push({id: 'B', val: 0.987});
    listToSort.push({id: 'C', val: 0.765});
    listToSort.push({id: 'D', val: 0.876});


    sortedList = confidence.sortList(listToSort);

    test.equals(sortedList[0].id, 'B', '0.987 should be the greatest value in the list');
    test.equals(sortedList[1].id, 'D', '0.876 should be the second greatest value in the list');
    test.equals(sortedList[2].id, 'C', '0.765 should be the second least value in the list');
    test.equals(sortedList[3].id, 'A', '0.654 should be the least value in the list');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Required Sample Size'] = {

  // When should the required sample size be 100?
  'Rate is 0': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 0,
      eventCount: 50
    });

    test.ok(confidence);

    var requiredSampleSize = test.equal(confidence.getRequiredSampleSize('A'), 100, "If rate is 0, the required sample size should be 100");

    test.done();
  },

  'Rate is 1': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 101,
      eventCount: 101
    });
    var requiredSampleSize = test.equal(confidence.getRequiredSampleSize('B'), 100, "If rate is 1, the required sample size should be 100");

    test.done();
  },
};

//**************************************************************************//

module.exports['Has Enough Data'] = {

  'Has Enough Data': function(test) {

    var confidence = new Confidence();
    test.ok(confidence);

  // When should it say yes?
  confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 2500,
      eventCount: 3000
    });

  test.equal(confidence.hasEnoughData('A'), true, 'This variant should have enough data');

  // When should it say no?
  confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 5,
      eventCount: 10
    });

  test.equal(confidence.hasEnoughData('A'), true, 'This variant should not have enough data');

  test.done();
  }
};

//**************************************************************************//

module.exports['Get Rate'] = {

  // Verifies that the total count cannot be zero.
  'Divide by zero': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1356,
      eventCount: 0
    });

    test.ok(confidence);
    var that = this;

    test.throws(function() {
      that.confidence.getRate('A');
    }, Error, 'Total is zero: cannot divide by zero to produce rate.');

    test.done();
  },
  // Verifies that the total count cannot be zero.
  'Divide by negative': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 1356,
      eventCount: -1
    });

    test.ok(confidence);
    var that = this;

    test.throws(function() {
      that.confidence.getRate('B');
    }, Error, 'Total is negative: cannot use a negative number to produce rate.');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Confidence Interval'] = {

  // Verifies that the total count cannot be zero.
  'Intervals when rate is 0, 1, and in-between': function(test) {
    confidence = new Confidence();
    test.ok(confidence);

    // If rate is 0, confidence interval will be [0,0]
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 0,
      eventCount: 3000
    });

    test.deepEqual(confidence.getConfidenceInterval('A'), { min: 0, max: 0 }, 'Rate is 0, interval should be [0, 0]');

    // If rate is 1, confidence interval will be [0,0]
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 3000,
      eventCount: 3000
    });

    test.deepEqual(confidence.getConfidenceInterval('B'), { min: 1, max: 1 }, 'Rate is 1, interval should be [1, 1]');

    // Something in between will be something in between (que sera sera)?
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 1500,
      eventCount: 3000
    });

    test.deepEqual(confidence.getConfidenceInterval('C'), { min: 0.4821077297881646, max: 0.5178922702118354 }, 'Rate is between 0 and 1, interval should be between 0 and 1');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Standard Error'] = {

  // Test the equivalence of standard errors.
  'Test if rate is 0': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 0,
      eventCount: 3150
    });
    test.ok(confidence);

    // rate is 0
    var standardErr = test.equal(confidence.getStandardError('A'), 0, "If rate is 0, standard error should be 0");

    test.done();
  },
  'Test if rate is between 0 and 1': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 1356,
      eventCount: 3150
    });
    test.ok(confidence);
    // 0 < rate < 1
    var standardErr = test.equal(confidence.getStandardError('B'), 0.008822166165076539, "If rate is between 0 and 1, standard error should not be 0");

    test.done();
  },

  'Test if rate is 1': function(test) {

    confidence = new Confidence();
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 3150,
      eventCount: 3150
    });
    test.ok(confidence);
    // rate is 1
    var standardErr = test.equal(confidence.getStandardError('C'), 0, "If rate is 1, standard error should be 0");

    test.done();
  },
};

