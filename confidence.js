(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD. Register as an anonymous module.
    define([], factory);
  } else if (typeof exports === 'object') {
    // Node. Does not work with strict CommonJS, but
    // only CommonJS-like environments that support module.exports,
    // like Node.
    module.exports = factory();
  } else {
    // Browser globals (root is window)
    root.Confidence = factory();
  }
}(this, function () {
  /** Private Constants */
  var DEFAULT_Z_SCORE = 1.96;
  var DEFAULT_MARGIN_OF_ERROR = 0.01;
  var VERSION = '1.1.0';

  var Confidence = function(settings) {
    settings = settings || { };
    
    this._zScore = settings.zScore || DEFAULT_Z_SCORE;
    this._marginOfError = settings.marginOfError || DEFAULT_MARGIN_OF_ERROR;
    this._variants = { };
    this._confidenceIntervals = { };
  };
  
  Confidence.version = VERSION;

  /** Public Constants **/

  Confidence.prototype.addVariant = function(variant) {
    // TODO verify variant first
    // variant must have properties name, conversionCount, eventCount
    if (variant.hasOwnProperty('id') &&
      variant.hasOwnProperty('name') &&
      variant.hasOwnProperty('conversionCount') &&
      variant.hasOwnProperty('eventCount')) {
      this._variants[variant.id] = variant;
    } else {
      throw new Error('variant object needs name, conversionCount, and eventCount properties');
    }
  };

  Confidence.prototype.getVariant = function(variantID) {
    if (this._variants.hasOwnProperty(variantID)) {
      return this._variants[variantID];
    } else {
      throw new Error('The variant you requested does not exist.');
    }
  };

  Confidence.prototype.hasVariants = function(variants) {
    for(var variant in variants) {
      if(variants.hasOwnProperty(variant)) {
        return true;
      }
    }
    return false;
  };

  Confidence.prototype.getResult = function() {
    if (this.hasVariants(this._variants)) {

      confidenceIntervals = {};

      var result;
      // for each variant in variants
      for (var variantID in this._variants) {
        // get sample size required for statistically significant answer
        var requiredSampleSize = this.getRequiredSampleSize(variantID);

        // do we have a winner to pass into the result
        var hasWinner = false;

        // verify whether we have enough data
        var hasEnoughData = this.hasEnoughData(variantID);

        // If we don't have enough data yet, we cannot yet declare a result.
        if (!hasEnoughData) {
          result = {
            hasWinner: hasWinner,
            hasEnoughData: hasEnoughData,
            winnerID: null,
            winnerName: null,
            confidenceInterval: null,
            readable: "There is not enough data to determine a conclusive result."
          };
          return result;
        }

        //calculate confidence interval
        var confidenceInterval = this.getConfidenceInterval(variantID);

        confidenceIntervals[variantID] = confidenceInterval;
      }

      // At this point, we have enough data to determine whether there is a winner or not
      result = this.analyzeConfidenceIntervals(confidenceIntervals);
      return result;
    } else {
      throw new Error('There are no variants available.');
    }
  };

  Confidence.prototype.analyzeConfidenceIntervals = function(confidenceIntervals) {
    // TODO if confidence interval bad format, throw an error

    var minimums = [];
    var maximums = [];

    // split confidence intervals into a list of mins and maxes.
    for (var id in confidenceIntervals) {
      // instantiate object
      var min = confidenceIntervals[id].min;
      minimums.push({ id: id, val: min });

      var max = confidenceIntervals[id].max;
      maximums.push({ id: id, val: max });
    }

    // sort list of minimums greatest to least
    minimums = this.sortList(minimums);

    // identify ID with the largest min
    var idWithLargestMin = minimums[0].id;
    var largestMin = minimums[0].val;

    // sort list of maximums greatest to least
    maximums = this.sortList(maximums);

    // remove the ID with the largest min from the list of maximums.
    for (var index = 0; index < maximums.length; index++) {
      var obj = maximums[index];

      if (obj.id == idWithLargestMin) {
        maximums.splice(index, 1);
      }
    }

    // identify ID with the largest max and its value
    var idWithLargestMax = maximums[0].id;
    var largestMax = maximums[0].val;

    var result;

    var hasWinner;
    var hasEnoughData;


    // if highest min > highest max, declare the ID of the winner to be the min
    if (largestMin > largestMax) {
      winningVariantName = this._variants[idWithLargestMin].name;
      var roundedMin = (Math.round(10000 * confidenceIntervals[idWithLargestMin].min)/100);
      var roundedMax = (Math.round(10000 * confidenceIntervals[idWithLargestMin].max)/100);

      var message = "With 95% confidence, the true population parameter of the \"";
      message += winningVariantName + "\" variant will fall between ";
      message += roundedMin + "% and ";
      message += roundedMax + "%.";
      hasWinner = true;
      hasEnoughData = true;

      result = {
        hasWinner: hasWinner,
        hasEnoughData: hasEnoughData,
        winnerID: idWithLargestMin,
        winnerName: winningVariantName,
        confidenceInterval: { min: roundedMin, max: roundedMax },
        readable: message
      };
      return result;
    } else {
      // otherwise, there is no winner
      var messageNoWinner = "There is no winner, the results are too close.";

      hasWinner = false;
      hasEnoughData = true;

      result = {
        hasWinner: hasWinner,
        hasEnoughData: hasEnoughData,
        winnerID: null,
        winnerName: null,
        confidenceInterval: null,
        readable: messageNoWinner
      };
    }

    return result;
  };

  // Sorts list from greatest to least
  Confidence.prototype.sortList = function(list) {
    list.sort(function(a, b) {
      return b.val - a.val;
    });
    return list;
  };


  // Are these result statistically significant?
  // (zscore^2 * stdErr * (1 - stdErr)) / marginErr^2
  Confidence.prototype.getRequiredSampleSize = function(variantID) {
    var standardError = this.getStandardError(variantID);
    var numerator = (Math.pow(this._zScore, 2) * standardError * (1 - standardError));
    var denominator = Math.pow(this._marginOfError, 2);

    var requiredSampleSize = Math.max((numerator/denominator), 100);
    return requiredSampleSize;
  };

  Confidence.prototype.hasEnoughData = function(variantID) {
    var variant = this.getVariant(variantID);
    var requiredSampleSize = this.getRequiredSampleSize(variantID);
    if (variant.eventCount >= requiredSampleSize) {
      return true;
    } else {
      return false;
    }
  };

  Confidence.prototype.getRate = function(variantID) {
    var variant = this.getVariant(variantID);
    if (variant.eventCount === 0) {
      throw new Error('Total is zero: cannot divide by zero to produce rate.');
    } else if (variant.eventCount < 0) {
      throw new Error('Total is negative: cannot use a negative number to produce rate.');
    } else {
      var rate = variant.conversionCount / variant.eventCount;
      return rate;
    }
  };

  // Calculate the interval for which we are <zscore> confident
  // rate +- (zscore * standard error)
  Confidence.prototype.getConfidenceInterval = function(variantID) {
    var confidenceInterval = {};
    var rate = this.getRate(variantID);
    var standardError = this.getStandardError(variantID);
    //lower limit
    var min = rate - (this._zScore * standardError);
    //upper limit
    var max = rate + (this._zScore * standardError);

    confidenceInterval = { min: min, max: max };

    return confidenceInterval;
  };

  // Calculate standard error:
  // SE = sqrt(rate*(1-rate)/total)
  Confidence.prototype.getStandardError = function(variantID) {
    var variant = this.getVariant(variantID);

    //Throw error if rate is not okay.
    var rate = this.getRate(variantID);

    //Check total Count - if event count is 0
    var standardError = Math.sqrt(rate * (1 - rate) / variant.eventCount);
    return standardError;
  };
  return Confidence;
}));
