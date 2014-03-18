var ABTestHelper = require('../ABTestHelper.js');
module.exports['Analyze Confidence Intervals Goes Here'] = {
  setUp: function(callback) {
    // Put test setup here

    // initialize vars and stuff

    this.abTestHelper = new ABTestHelper();
    this.abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 3150
    });
    this.abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 1356,
      totalCount: 3150
    });

    callback();
  },

  // Test format of confidence interval list.

  // Same tests as getResult for the different result equivalence classes.

  'Test existence of version': function(test) {
    test.ok(this.abTestHelper);
    var that = this;

    test.throws(function() {
      that.abTestHelper.getRate('F');
    }, Error, 'Version F should not have existed.');

    test.doesNotThrow(function() {
      that.abTestHelper.getRate('A');
    }, Error, 'Version A should have existed.');

    test.done();
  },
};

module.exports['Get Result'] = {
  // Verifies that an error is thrown when no versions have been added
  // and if versions have been added, no error is thrown.
  'No versions': function(test) {
    var abTestHelper = new ABTestHelper();
    test.ok(abTestHelper);

    test.throws(function() {
      abTestHelper.getResult();
    }, Error, 'There are no versions available.');

    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 3150
    });
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 1356,
      totalCount: 3150
    });

    test.doesNotThrow(function() {
      abTestHelper.getResult();
    }, Error, 'There should have been versions available.');

    test.done();
  },
  // Verifies that if there is a version with less than 100 total count,
  // there is not enough data to produce a result.
  'Less than 100 totalCount': function(test) {
    var abTestHelper = new ABTestHelper();
    test.ok(abTestHelper);

    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 20,
      totalCount: 50
    });

    var result = abTestHelper.getResult();

    // Only one version
    test.equal(result.status, ABTestHelper.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    // Another version that has enough data
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 800,
      totalCount: 1000
    });

    result = abTestHelper.getResult();

    test.equal(result.status, ABTestHelper.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');


    test.done();
  },
  // Verifies that if there is a version with greater than 100 total count,
  // if we haven't reached the required sample size there is not enough data
  // to produce a result
  'More than 100 totalCount but still not enough data': function(test) {
    var abTestHelper = new ABTestHelper();
    test.ok(abTestHelper);

    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 20,
      totalCount: 101
    });

    var result = abTestHelper.getResult();

    // Only one version
    test.equal(result.status, ABTestHelper.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    // Another version with not enough data
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 25,
      totalCount: 101
    });

    result = abTestHelper.getResult();

    test.equal(result.status, ABTestHelper.STATUS_NOT_ENOUGH_DATA, 'Not enough data');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'There is not enough data to determine a conclusive result.', 'Not enough data to determine result');

    test.done();
  },
  // Verifies correct output if there is enough data but no result.
  'Enough data but no result': function(test) {
    var abTestHelper = new ABTestHelper();
    test.ok(abTestHelper);

    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 200,
      totalCount: 3150
    });
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 201,
      totalCount: 3150
    });

    var result = abTestHelper.getResult();

    test.equal(result.status, ABTestHelper.STATUS_ENOUGH_DATA_AND_NO_RESULT, 'Enough data, no result');
    test.equal(result.winner, null, 'No winner');
    test.equal(result.confidenceInterval, null, 'No confidence interval');
    test.equal(result.readable, 'We have enough data to say we cannot predict a winner with 95% certainty.', 'Enough data, but no conclusive result');

    test.done();


  },
  // Verifies correct output if there is enough data and there is a winner.
  'Enough data and a clear winner': function(test) {
    var abTestHelper = new ABTestHelper();
    test.ok(abTestHelper);

    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 800,
      totalCount: 3150
    });
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 200,
      totalCount: 3150
    });

    var result = abTestHelper.getResult();

    test.equal(result.status, ABTestHelper.STATUS_ENOUGH_DATA_AND_RESULT, 'Enough data, and we have a winner');
    test.equal(result.winner, 'Original', 'Original is the winner');
    test.deepEqual(result.confidenceInterval, {
      min: 23.88,
      max: 26.92
    }, 'Confidence interval does not overlap');
    test.equal(result.readable, 'In a hypothetical experiment that is repeated infinite times, the average rate of the "Original" version will fall between 23.88% and 26.92%, 95% of the time', 'The result');

    test.done();
  },
};

module.exports['Get Rate'] = {

  // Verifies that the total count cannot be zero.
  'Divide by zero': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 0
    });

    test.ok(abTestHelper);
    var that = this;

    test.throws(function() {
      that.abTestHelper.getRate('B');
    }, Error, 'Total is zero: cannot divide by zero to produce rate.');

    test.done();
  },
};

module.exports['Get Version'] = {

  'Test existence of version': function(test) {

    this.abTestHelper = new ABTestHelper();
    this.abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 1356,
      totalCount: 3150
    });
    this.abTestHelper.addVersion('B', {
      name: 'Original',
      eventCount: 2356,
      totalCount: 3150
    });

    test.ok(this.abTestHelper);
    var that = this;

    // Verify that the requested version throws an error when it doesn't exist
    test.throws(function() {
      that.abTestHelper.getVersion('F');
    }, Error, 'Version F should not have existed.');

    // Verify that the requested version doesn't throw an error when it does exist
    test.doesNotThrow(function() {
      that.abTestHelper.getVersion('A');
    }, Error, 'Version A should have existed.');

    test.done();
  },
};

module.exports['Get Standard Error'] = {

  // Test the equivalence of standard errors.
  'Test if rate is 0': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 0,
      totalCount: 3150
    });
    test.ok(abTestHelper);

    // rate is 0
    var standardErr = test.equal(abTestHelper.getStandardError('A'), 0, "If rate is 0, standard error should be 0");

    test.done();
  },
  'Test if rate is between 0 and 1': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 1356,
      totalCount: 3150
    });
    test.ok(abTestHelper);
    // 0 < rate < 1
    var standardErr = test.equal(abTestHelper.getStandardError('B'), 0.008822166165076539, "If rate is between 0 and 1, standard error should be as well");

    test.done();
  },

  'Test if rate is 1': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('C', {
      name: 'Newer',
      eventCount: 3150,
      totalCount: 3150
    });
    test.ok(abTestHelper);
    // rate is 1
    var standardErr = test.equal(abTestHelper.getStandardError('C'), 0, "If rate is 1, standard error should be 0");

    test.done();
  },
};

module.exports['Get Required Sample Size'] = {

  // When should the required sample size be 100?
  'Rate is 0': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('A', {
      name: 'Original',
      eventCount: 0,
      totalCount: 50
    });

    test.ok(abTestHelper);

    var requiredSampleSize = test.equal(abTestHelper.getRequiredSampleSize('A'), 100, "If rate is 0, the required sample size should be 100");

    test.done();
  },

  'Rate is 1': function(test) {

    abTestHelper = new ABTestHelper();
    abTestHelper.addVersion('B', {
      name: 'New',
      eventCount: 101,
      totalCount: 101
    });
    var requiredSampleSize = test.equal(abTestHelper.getRequiredSampleSize('B'), 100, "If rate is 1, the required sample size should be 100");

    test.done();
  },

  // When should the required sample size be > 100?
  'Rate is between 0 and 1': function(test){

    test.done();
  }
};

module.exports['Has Enough Data'] = {

  // When should it say yes?

  // When should it say no?

};