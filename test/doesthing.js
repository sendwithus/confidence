var ABTestHelper = require('../ABTestHelper.js');
module.exports['Test Input'] = {
  setUp: function(callback) {
    this.abTestHelper = new ABTestHelper();
    this.abTestHelper.addVersion('A', { name: 'Original', eventCount: 1356, totalCount: 3150 });
    this.abTestHelper.addVersion('B', { name: 'Original', eventCount: 1356, totalCount: 0 });

    callback();
  },
  'Has Enough Data - Test existence of version': function(test) {
    test.ok(this.abTestHelper);
    var that = this;

    test.throws(function() {
        that.abTestHelper.hasEnoughData('F');
    }, Error, 'Version F should not have existed.');

    test.doesNotThrow(function() {
        that.abTestHelper.hasEnoughData('A');
    }, Error, 'Version A should have existed.');

    test.done();
  },
  'Get Rate - Divide by zero': function(test) {
    test.ok(this.abTestHelper);
    var that = this;

    test.throws(function() {
        that.abTestHelper.getRate('B');
    }, Error, 'Total is zero: cannot divide by zero to produce rate.');

    test.done();
  },
};