var Confidence = require('../confidence.js');

//**************************************************************************//
// Z-TEST TO GET A/B TEST WINNER
//**************************************************************************//

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

  'Variant with no given name adds successfully': function(test) {
    confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'C',
      conversionCount: 3000,
      eventCount: 3000
    });

    var variantID = 'C';

    test.ok(confidence._variants.hasOwnProperty('C'));
    test.equal(confidence._variants[variantID].name, 'Variant C', 'The name should be Variant C');

    test.done();
  },
  'Variant with duplicate ID does not add': function(test) {
    confidence = new Confidence();
    test.ok(confidence);

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 3000,
      eventCount: 3000
    });

    test.ok(confidence._variants.hasOwnProperty('A'));

    test.throws(function(){
      confidence.addVariant({
        id: 'A',
        name: 'Variant A',
        conversionCount: 3000,
        eventCount: 3000
      });
    }, Error, 'Variant with ID that already exists should not add.');

    test.done();
  },
};

//**************************************************************************//

module.exports['Variant Exists'] = {

  // Verifies that the total count cannot be zero.
  'Test existence of specific variant': function(test) {
    confidence = new Confidence();

    test.equal(confidence.variantExists('A'), false, 'Variant ID \'A\' should not exist');

    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1356,
      eventCount: 3150
    });

    test.equal(confidence.variantExists('A'), true, 'Variant ID \'A\' should exist');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Variant'] = {

  'Returns specific variant if it exists': function(test) {

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
    test.equal(result.confidencePercent, null, 'There should be no confidence percent');
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
    test.equal(result.confidencePercent, null, 'There should be no confidence percent');
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
    test.equal(result.confidencePercent, null, 'There should be no confidence percent');
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
    test.equal(result.confidencePercent, null, 'There should be no confidence percent');
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
    test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
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

    var expectedResult = 'With 95.00% confidence, the true population parameter of the';
    expectedResult += ' "Variant A" variant will fall between 23.88% and 26.92%.';

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'A', 'A should be the winnerID');
    test.equal(result.winnerName, 'Variant A', 'Variant A should be the winnerName');
    test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
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
    test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
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

    var messageWinner = 'With 95.00% confidence, the true population parameter of the';
    messageWinner += ' "Variant B" variant will fall between 82% and 84.67%.';

    var result = confidence.analyzeConfidenceIntervals(confidenceIntervals);

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'B', 'B should be the winnerID');
    test.equal(result.winnerName, 'Variant B', 'Variant B should be the winnerName');
    test.equal(result.confidencePercent, 95.00, 'Confidence percent should be 95.00');
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

    // Something in between will be something in between...
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

//**************************************************************************//
// ZSCORE TO PERCENT
//**************************************************************************//

module.exports['zScore Probability'] = {

  // Verifies zscore of 6.0 (maximum meaningful zscore) produces 100% confidence result.
  // Also verifies that max confidence interval does not exceed 100%
  'Max meaningful zScore and confidence interval max <= 100%': function(test) {

    var confidence = new Confidence({zScore: 6});

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 500,
      eventCount: 10000
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 9999,
      eventCount: 10000
    });

    var result = confidence.getResult();

    var expectedResult = 'With 100.00% confidence, the true population parameter of the';
    expectedResult += ' "Variant B" variant will fall between 99.93% and 100%.';

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'B', 'B should be the winnerID');
    test.equal(result.winnerName, 'Variant B', 'Variant B should be the winnerName');
    test.equal(result.confidencePercent, 100.00, 'Confidence percent should be 100');
    test.deepEqual(result.confidenceInterval, {
      min: 99.93,
      max: 100
    }, 'Confidence interval should not overlap');
    test.equal(result.readable, expectedResult , 'The result should have the long winning speech');

    test.done();
  },

 // zscore of 1.28 should result in 79.95% confidence
  'zScore of 1.28 produces ~80% confidence': function(test) {

    var confidence = new Confidence({zScore: 1.28});

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 500,
      eventCount: 10000
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 9999,
      eventCount: 10000
    });

    var result = confidence.getResult();

    test.equal(result.confidencePercent, 79.95, 'Confidence percent should be 79.95');

    test.done();
  },

 // zscore of 1.645 should result in 90% confidence
  'zScore of 1.645 produces 90% confidence': function(test) {

    var confidence = new Confidence({zScore: 1.645});

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 500,
      eventCount: 10000
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 9999,
      eventCount: 10000
    });

    var result = confidence.getResult();

    test.equal(result.confidencePercent, 90.00, 'Confidence percent should be 90.00');

    test.done();
  },

};

//**************************************************************************//
// CHI-SQUARED AND MARASCUILLO'S PROCEDURE
//**************************************************************************//

module.exports['Get Marascuillo Result'] = {
  'Not enough data (expected value < 5)': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 1,
      eventCount: 5
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 2,
      eventCount: 3
    });

    var result = confidence.getMarascuilloResult();

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, false, 'There should not be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');

    test.done();
  },

  'Enough data no result (small variance among variants)': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 66,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 67,
      eventCount: 110
    });

    var result = confidence.getMarascuilloResult();

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');

    test.done();
  },

  'Enough data no result (large variance, but tie for winner)': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 80,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 80,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 6,
      eventCount: 100
    });

    var result = confidence.getMarascuilloResult();

    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, null, 'There should be no winnerID');
    test.equal(result.winnerName, null, 'There should be no winnerName');

    test.done();
  },

  'Enough data and result': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 40,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 80,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 6,
      eventCount: 100
    });

    var result = confidence.getMarascuilloResult();

    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'B', 'B should be the winner ID');
    test.equal(result.winnerName, 'Variant B', 'Variant B should be the winner name');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Observed Values'] = {
  'Success and fail counts calculated accurately': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 50,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 40,
      eventCount: 100
    });

    var result = confidence.getObservedValues();

    test.equal(result['A']['success'], 50, 'Variant A should have 50 successes');
    test.equal(result['A']['fail'], 50, 'Variant A should have 50 fails');
    test.equal(result['A']['total'], 100, 'Variant A should have 100 total');

    test.equal(result['B']['success'], 40, 'Variant B should have 40 successes');
    test.equal(result['B']['fail'], 60, 'Variant B should have 60 fails');
    test.equal(result['B']['total'], 100, 'Variant B should have 100 total');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Pooled Proportion'] = {
  'Average case where all observed values exist': function(test) {
    var confidence = new Confidence();
    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 50,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 40,
      eventCount: 100
    });

    var observedValues = confidence.getObservedValues();
    var result = confidence.getPooledProportion(observedValues);

    test.equal(result, 0.45, 'Pooled proportion should be 90/200, or 0.45');

    test.done();
  },

  'Error if the sum of the totals is zero': function(test) {
    var confidence = new Confidence();
    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 0,
      eventCount: 0
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 0,
      eventCount: 0
    });

    var observedValues = confidence.getObservedValues();

    test.throws(function() {
      confidence.getPooledProportion(observedValues);
    }, Error, 'There should be an error when summed totals is zero');
    test.done();
  },
};

//**************************************************************************//

module.exports['Get Expected Values'] = {
  'Has enough data': function(test) {
    var confidence = new Confidence();

    // Fake some data
    var observedValues = {
      A: { success: 50, fail: 50, total: 100 },
      B: { success: 40, fail: 60, total: 100 },
      C: { success: 60, fail: 40, total: 100 }
    };

    var pooledProportion = 0.5;

    var expectedResult = confidence.getExpectedValues(observedValues, pooledProportion);

    test.equal(expectedResult['A']['success'], 50, 'Variant A should have 50 expected successes');
    test.equal(expectedResult['A']['fail'], 50, 'Variant A should have 50 expected fails');

    test.equal(expectedResult['B']['success'], 50, 'Variant B should have 50 expected successes');
    test.equal(expectedResult['B']['fail'], 50, 'Variant B should have 50 expected fails');

    test.equal(expectedResult['C']['success'], 50, 'Variant C should have 50 expected successes');
    test.equal(expectedResult['C']['fail'], 50, 'Variant C should have 50 expected fails');

    test.equal(expectedResult['hasEnoughData'], true, 'There should be enough data');

    test.done();
  },

  'Does not have enough data': function(test) {
    var confidence = new Confidence();

    // Fake some data
    var observedValues = {
      A: { success: 1, fail: 4, total: 5 },
      B: { success: 2, fail: 3, total: 5 },
      C: { success: 3, fail: 2, total: 5 }
    };

    var pooledProportion = 0.4;

    var expectedResult = confidence.getExpectedValues(observedValues, pooledProportion);

    test.equal(expectedResult['A']['success'], 2, 'Variant A should have 2 expected successes');
    test.equal(expectedResult['A']['fail'], 3, 'Variant A should have 3 expected fails');

    test.equal(expectedResult['B']['success'], 2, 'Variant B should have 2 expected successes');
    test.equal(expectedResult['B']['fail'], 3, 'Variant B should have 3 expected fails');

    test.equal(expectedResult['C']['success'], 2, 'Variant C should have 2 expected successes');
    test.equal(expectedResult['C']['fail'], 3, 'Variant C should have 3 expected fails');

    test.equal(expectedResult['hasEnoughData'], false, 'There should not be enough data');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Chi Parts'] = {
  'Average error-free case': function(test) {
    var confidence = new Confidence();

    // Fake some data
    var observedValues = {
      A: { success: 50, fail: 50, total: 100 },
      B: { success: 40, fail: 60, total: 100 },
      C: { success: 60, fail: 40, total: 100 }
    };

    var expectedValues = {
      A: { success: 50, fail: 50 },
      B: { success: 50, fail: 50 },
      C: { success: 50, fail: 50 },
      hasEnoughData: true
    };

    var chiParts = confidence.getChiParts(observedValues, expectedValues);

    test.equal(chiParts['A']['success'], 0, 'Variant A \'success\' chi part should be 0');
    test.equal(chiParts['A']['fail'], 0, 'Variant A \'fail\' chi part should be 0');

    test.equal(chiParts['B']['success'], 2, 'Variant B \'success\' chi part should be 2');
    test.equal(chiParts['B']['fail'], 2, 'Variant B \'fail\' chi part should be 2');

    test.equal(chiParts['C']['success'], 2, 'Variant C \'success\' chi part should be 2');
    test.equal(chiParts['C']['fail'], 2, 'Variant C \'fail\' chi part should be 2');

    test.done();
  },

  'Error when expected value is zero': function(test) {
    var confidence = new Confidence();

    // Fake some data
    var observedValues = {
      A: { success: 100, fail: 0, total: 100 },
      B: { success: 100, fail: 0, total: 100 },
      C: { success: 100, fail: 0, total: 100 }
    };

    var expectedValues = {
      A: { success: 100, fail: 0 },
      B: { success: 100, fail: 0 },
      C: { success: 100, fail: 0 },
      hasEnoughData: false
    };

    test.throws(function() {
      confidence.getChiParts(observedValues, expectedValues);
    }, Error, 'Expected values cannot be zero');

    test.done();
  },
};

//**************************************************************************//

module.exports['Sum Chi Parts'] = {
  'Calculates sum correctly': function(test) {
    var confidence = new Confidence();

    var chiPartValues = {
      A: { success: 0, fail: 0 },
      B: { success: 2, fail: 2 },
      C: { success: 2, fail: 2 }
    };

    var sumChiParts = confidence.sumChiParts(chiPartValues);
    test.equals(sumChiParts, 8, 'The chi part sum should be 8');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Degrees of Freedom'] = {
  'Degrees of Freedom = number of variants - 1': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 50,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 40,
      eventCount: 100
    });

    var result = confidence.getDegreesOfFreedom();
    test.equal(result, 1, 'With 2 variants, degrees of freedom should be 1');

    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 40,
      eventCount: 100
    });

    result = confidence.getDegreesOfFreedom();
    test.equal(result, 2, 'With 3 variants, degrees of freedom should be 2');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Best Variant'] = {
  'Returns the variant with the highest rate': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 60,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 63,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 80,
      eventCount: 100
    });

    var bestVariant = confidence.getBestVariant();

    test.equal(bestVariant, 'C', 'Variant C should have the highest rate');

    test.done();
  },
};

//**************************************************************************//

module.exports['Marascuillo'] = {
  'There is a winner': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 20,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 90,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 40,
      eventCount: 100
    });

    var bestVariantID = 'B';
    var critChi = 5.9915;

    var result = confidence.marascuillo(bestVariantID, critChi);
    test.equal(result.hasWinner, true, 'There should be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, 'B', '\'B\' should be the winning variant ID');
    test.equal(result.winnerName, 'Variant B', '\'Variant B\' should be the winning variant');

    test.done();
  },

  'There is no winner': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 91,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 90,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'C',
      name: 'Variant C',
      conversionCount: 40,
      eventCount: 100
    });

    var bestVariantID = 'A';
    var critChi = 5.9915;

    var result = confidence.marascuillo(bestVariantID, critChi);
    test.equal(result.hasWinner, false, 'There should not be a winner');
    test.equal(result.hasEnoughData, true, 'There should be enough data');
    test.equal(result.winnerID, null, 'There should be no winner ID');
    test.equal(result.winnerName, null, 'There should be no winner name');

    test.done();
  },
};

//**************************************************************************//

module.exports['Compute Test Statistic'] = {
  'Tie for winner': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 60,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 60,
      eventCount: 100
    });

    var bestVariantID = 'A';
    var challengerVariantID = 'B';

    var testStatistic = confidence.computeTestStatistic(bestVariantID, challengerVariantID);
    test.equal(testStatistic, 0, 'When there is a tie, the test stat should be 0');

    test.done();
  },

  'Large difference between variant rates': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 40,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 90,
      eventCount: 100
    });

    var bestVariantID = 'B';
    var challengerVariantID = 'A';

    var testStatistic = confidence.computeTestStatistic(bestVariantID, challengerVariantID);
    test.equal(testStatistic, 0.5, 'The test stat should be 0.5');

    test.done();
  },
};

//**************************************************************************//

module.exports['Compute Critical Value'] = {
  'Computes critical value accurately': function(test) {
    var confidence = new Confidence();

    // create some variants
    confidence.addVariant({
      id: 'A',
      name: 'Variant A',
      conversionCount: 40,
      eventCount: 100
    });
    confidence.addVariant({
      id: 'B',
      name: 'Variant B',
      conversionCount: 90,
      eventCount: 100
    });

    var bestVariantID = 'B';
    var challengerVariantID = 'A';
    var critChi = 5.9915;

    var criticalValue = confidence.computeCriticalValue(bestVariantID, challengerVariantID, critChi);

    test.equal(criticalValue, 0.14061276613451568, 'Critical Value should be 0.14...');

    test.done();
  },
};