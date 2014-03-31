var Sixpack = require('../Sixpack.js');

//**************************************************************************//

// TODO:  Change error messages to say what the test /should/ do instead of what it does.

module.exports['Add Version'] = {

  // Verifies that the total count cannot be zero.
  'Incorrectly formatted version': function(test) {
    sixpack = new Sixpack();
    test.ok(sixpack);

    test.throws(function() {
      sixpack.addVersion('A', {
        name: 'Original',
        eventCount: 1356,
      });
    }, Error, 'version object needs name, eventCount, and totalCount properties');
    test.done();
  },

  'Correctly formatted version adds successfully': function(test) {
    sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 3000,
      totalCount: 3000
    });

    test.ok(sixpack._versions.hasOwnProperty('B'));

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Version'] = {

  'Test existence of specific version': function(test) {

    this.sixpack = new Sixpack();
    test.ok(sixpack);

    this.sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 3150
    });
    this.sixpack.addVersion('B', {
      name: 'Original',
      eventCount: 2356,
      totalCount: 3150
    });

    test.ok(this.sixpack);
    var that = this;

    // Verify that the requested version throws an error when it doesn't exist
    test.throws(function() {
      that.sixpack.getVersion('F');
    }, Error, 'Version F should not have existed.');

    // Verify that the requested version doesn't throw an error when it does exist
    test.doesNotThrow(function() {
      that.sixpack.getVersion('A');
    }, Error, 'Version A should have existed.');

    test.done();
  },
};

//**************************************************************************//

module.exports['Has Versions'] = {

  'Test existence of any version' : function(test) {

    var sixpack = new Sixpack();
    test.ok(sixpack);


    // If no versions have been added, hasVersions returns false
    test.equals(sixpack.hasVersions(sixpack._versions), false, 'No versions have been added');

    sixpack.addVersion('A', {
      name: 'Version A',
      eventCount: 3000,
      totalCount: 3000
    });

    // If a version has been added, hasVersions returns true
    test.equals(sixpack.hasVersions(sixpack._versions), true, 'At least one version has been added');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Result'] = {
  // Verifies that an error is thrown when no versions have been added
  // and if versions have been added, no error is thrown.
  'No versions': function(test) {
    var sixpack = new Sixpack();
    test.ok(sixpack);

    test.throws(function() {
      sixpack.getResult();
    }, Error, 'There are no versions available.');

    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 3150
    });
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 1356,
      totalCount: 3150
    });

    test.doesNotThrow(function() {
      sixpack.getResult();
    }, Error, 'There should have been versions available.');

    test.done();
  },
  // Verifies that if there is a version with less than 100 total count,
  // there is not enough data to produce a result.
  'Less than 100 totalCount': function(test) {
    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 20,
      totalCount: 50
    });

    var result = sixpack.getResult();

    // Only one version
    test.equal(result.status, Sixpack.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    // Another version that has enough data
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 800,
      totalCount: 1000
    });

    result = sixpack.getResult();

    test.equal(result.status, Sixpack.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');


    test.done();
  },
  // Verifies that if there is a version with greater than 100 total count,
  // if we haven't reached the required sample size there is not enough data
  // to produce a result
  'More than 100 totalCount but still not enough data': function(test) {
    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 20,
      totalCount: 101
    });

    var result = sixpack.getResult();

    // Only one version
    test.equal(result.status, Sixpack.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    // Another version with not enough data
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 25,
      totalCount: 101
    });

    result = sixpack.getResult();

    test.equal(result.status, Sixpack.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    test.done();
  },
  // Verifies correct output if there is enough data but no result.
  'Enough data but no result': function(test) {
    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 200,
      totalCount: 3150
    });
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 201,
      totalCount: 3150
    });

    var result = sixpack.getResult();

    test.equal(result.status, Sixpack.STATUS_ENOUGH_DATA_AND_NO_RESULT, 'Enough data, no result');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'We have enough data to say we cannot predict a winner with 95% certainty.', 'Enough data, but no conclusive result');

    test.done();


  },
  // Verifies correct output if there is enough data and there is a winner.
  'Enough data and a clear winner': function(test) {
    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 800,
      totalCount: 3150
    });
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 200,
      totalCount: 3150
    });

    var result = sixpack.getResult();

    test.equal(result.status, Sixpack.STATUS_ENOUGH_DATA_AND_RESULT, 'Enough data, and we have a winner');
    test.equal(result.statusMessage, Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_RESULT, 'Enough data, and we have a winner');
    test.equal(result.winner, 'Original', 'Original is the winner');
    test.deepEqual(result.confidenceInterval, {
      min: 23.88,
      max: 26.92
    }, 'Confidence interval does not overlap');
    test.equal(result.readable, 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Original" version will fall between 23.88% and 26.92%, 95% of the time', 'The result');

    test.done();
  },
};

//**************************************************************************//

module.exports['Analyze Confidence Intervals'] = {
  'Test enough data with no clear winner': function(test) {

    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', { name: 'Version A', eventCount: 1500, totalCount: 3000 });
    sixpack.addVersion('B', { name: 'Version B', eventCount: 1501, totalCount: 3000 });

    var confidenceIntervals = {};

    confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

    confidenceIntervals['B'] = { min: 0.48244106709755835, max: 0.5182255995691082 };

    // analyze confidence intervals takes a confidence interval object

    var messageNoWinner = 'We have enough data to say we cannot predict a winner with 95% certainty.';

    var actualResult = sixpack.analyzeConfidenceIntervals(confidenceIntervals);

    var expectedResult = {
      status: Sixpack.STATUS_ENOUGH_DATA_AND_NO_RESULT,
      statusMessage: Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_NO_RESULT,
      winner: null,
      confidenceInterval: null,
      readable: messageNoWinner
    };

    test.deepEqual(actualResult, expectedResult, 'This should return { status: 3, winner: null, confidenceIntervals: null, readable: "We have enough data to say we cannot predict a winner with 95% certainty." }');

    test.done();
  },
    'Test enough data with a clear winner': function(test) {

    var sixpack = new Sixpack();
    test.ok(sixpack);

    sixpack.addVersion('A', { name: 'Version A', eventCount: 1500, totalCount: 3000 });
    sixpack.addVersion('B', { name: 'Version B', eventCount: 2500, totalCount: 3000 });

    var confidenceIntervals = {};

    confidenceIntervals['A'] = { min: 0.4821077297881646, max: 0.5178922702118354 };

    confidenceIntervals['B'] = { min: 0.8199972225115139, max: 0.8466694441551529 };

    var messageWinner = 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Version B" version will fall between 82% and 84.67%, 95% of the time';

    var actualResult = sixpack.analyzeConfidenceIntervals(confidenceIntervals);

    var expectedResult = {
      status: Sixpack.STATUS_ENOUGH_DATA_AND_RESULT,
      statusMessage: Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_RESULT,
      winner: 'Version B',
      confidenceInterval: { min: 82, max: 84.67 },
      readable: messageWinner
    };

    test.deepEqual(actualResult, expectedResult, 'This should return { status: 2, winner: Version B, confidenceIntervals: { min: 82, max: 84.67 }, readable: long winning text" }');

    test.done();
  },
};

//**************************************************************************//

module.exports['Sort List'] = {

  // Verifies that a list gets sorted in the right order
  'Sort a list from greatest to least': function(test) {

    var sixpack = new Sixpack();
    test.ok(sixpack);

    listToSort = [];

    listToSort.push({id: 'A', val: 0.654});
    listToSort.push({id: 'B', val: 0.987});
    listToSort.push({id: 'C', val: 0.765});
    listToSort.push({id: 'D', val: 0.876});


    sortedList = sixpack.sortList(listToSort);

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

    sixpack = new Sixpack();
    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 0,
      totalCount: 50
    });

    test.ok(sixpack);

    var requiredSampleSize = test.equal(sixpack.getRequiredSampleSize('A'), 100, "If rate is 0, the required sample size should be 100");

    test.done();
  },

  'Rate is 1': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('B', {
      name: 'Version B',
      eventCount: 101,
      totalCount: 101
    });
    var requiredSampleSize = test.equal(sixpack.getRequiredSampleSize('B'), 100, "If rate is 1, the required sample size should be 100");

    test.done();
  },

  // When should the required sample size be > 100?
  'Rate is between 0 and 1': function(test) {

    test.done();
  }
};

//**************************************************************************//

module.exports['Has Enough Data'] = {

  'Has Enough Data': function(test) {

    var sixpack = new Sixpack();
    test.ok(sixpack);

  // When should it say yes?
  sixpack.addVersion('A', {
      name: 'Version A',
      eventCount: 2500,
      totalCount: 3000
    });

  test.equal(sixpack.hasEnoughData('A'), true, 'This version should have enough data');

  // When should it say no?
  sixpack.addVersion('B', {
      name: 'Version B',
      eventCount: 5,
      totalCount: 10
    });

  test.equal(sixpack.hasEnoughData('A'), true, 'This version should not have enough data');

  test.done();
  }
};

//**************************************************************************//

module.exports['Get Rate'] = {

  // Verifies that the total count cannot be zero.
  'Divide by zero': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 0
    });

    test.ok(sixpack);
    var that = this;

    test.throws(function() {
      that.sixpack.getRate('A');
    }, Error, 'Total is zero: cannot divide by zero to produce rate.');

    test.done();
  },
  // Verifies that the total count cannot be zero.
  'Divide by negative': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('B', {
      name: 'Version B',
      eventCount: 1356,
      totalCount: -1
    });

    test.ok(sixpack);
    var that = this;

    test.throws(function() {
      that.sixpack.getRate('B');
    }, Error, 'Total is negative: cannot use a negative number to produce rate.');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Confidence Interval'] = {

  // Verifies that the total count cannot be zero.
  'Intervals when rate is 0, 1, and in-between': function(test) {
    sixpack = new Sixpack();
    test.ok(sixpack);

    // If rate is 0, confidence interval will be [0,0]
    sixpack.addVersion('A', {
      name: 'Version A',
      eventCount: 0,
      totalCount: 3000
    });

    test.deepEqual(sixpack.getConfidenceInterval('A'), { min: 0, max: 0 }, 'Rate is 0, interval should be 0, 0');

    // If rate is 1, confidence interval will be [0,0]
    sixpack.addVersion('B', {
      name: 'Version B',
      eventCount: 3000,
      totalCount: 3000
    });

    test.deepEqual(sixpack.getConfidenceInterval('B'), { min: 1, max: 1 }, 'Rate is 1, interval should be 1, 1');

    // Something in between will be something in between (que sera sera)?
    sixpack.addVersion('C', {
      name: 'Version C',
      eventCount: 1500,
      totalCount: 3000
    });
    test.deepEqual(sixpack.getConfidenceInterval('C'), { min: 0.4821077297881646, max: 0.5178922702118354 }, 'Rate is between 0 and 1, interval should be between 0 and 1');

    test.done();
  },
};

//**************************************************************************//

module.exports['Get Standard Error'] = {

  // Test the equivalence of standard errors.
  'Test if rate is 0': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('A', {
      name: 'Original',
      eventCount: 0,
      totalCount: 3150
    });
    test.ok(sixpack);

    // rate is 0
    var standardErr = test.equal(sixpack.getStandardError('A'), 0, "If rate is 0, standard error should be 0");

    test.done();
  },
  'Test if rate is between 0 and 1': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('B', {
      name: 'New',
      eventCount: 1356,
      totalCount: 3150
    });
    test.ok(sixpack);
    // 0 < rate < 1
    var standardErr = test.equal(sixpack.getStandardError('B'), 0.008822166165076539, "If rate is between 0 and 1, standard error should not be 0");

    test.done();
  },

  'Test if rate is 1': function(test) {

    sixpack = new Sixpack();
    sixpack.addVersion('C', {
      name: 'Newer',
      eventCount: 3150,
      totalCount: 3150
    });
    test.ok(sixpack);
    // rate is 1
    var standardErr = test.equal(sixpack.getStandardError('C'), 0, "If rate is 1, standard error should be 0");

    test.done();
  },
};

