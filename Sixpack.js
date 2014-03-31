
/** Private Constants */
var DEFAULT_Z_SCORE = 1.96;
var DEFAULT_MARGIN_OF_ERROR = 0.01;

var Sixpack = function(settings) {
    settings = settings || { };

	this._zScore = settings.hasOwnProperty('zScore') ? settings.zScore : DEFAULT_Z_SCORE;
	this._marginOfError = settings.hasOwnProperty('marginOfError') ? settings.marginOfError : DEFAULT_MARGIN_OF_ERROR;
	this._versions = {};
	this._confidenceIntervals = {};
};

/** Public Constants **/

// TODO status message // string instead of a number
Sixpack.STATUS_NOT_ENOUGH_DATA = 1;
Sixpack.STATUS_ENOUGH_DATA_AND_NO_RESULT = 2;
Sixpack.STATUS_ENOUGH_DATA_AND_RESULT = 3;

Sixpack.STATUS_MESSAGE_NOT_ENOUGH_DATA = 'Not enough data';
Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_NO_RESULT = 'Enough data no result';
Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_RESULT = 'Enough data and result';

Sixpack.prototype.addVersion = function(id, version) {
	// TODO verify version first
	// version must have properties name, eventCount, totalCount
	if (version.hasOwnProperty('name') && version.hasOwnProperty('eventCount') && version.hasOwnProperty('totalCount')){
		this._versions[id] = version;
	} else {
		throw new Error('version object needs name, eventCount, and totalCount properties');
	}
};

Sixpack.prototype.getVersion = function(versionID) {
	if (this._versions.hasOwnProperty(versionID)){
		return this._versions[versionID];
	} else {
		throw new Error('The version you requested does not exist.');
	}
};

Sixpack.prototype.hasVersions = function(versions) {
	for(var version in versions) {
		if(versions.hasOwnProperty(version)) {
			return true;
		}
	}
	return false;
};

Sixpack.prototype.getResult = function() {
	if (this.hasVersions(this._versions)) {

		confidenceIntervals = {};

		var result;
		// for each version in versions
		for (var versionID in this._versions) {
			// get sample size required for statistically significant answer
			var requiredSampleSize = this.getRequiredSampleSize(versionID);
			// verify whether we have enough data
			var hasEnoughData = this.hasEnoughData(versionID);

			// If we don't have enough data yet, we cannot yet declare a result.
			if (!hasEnoughData) {
				result = {
					status: Sixpack.STATUS_NOT_ENOUGH_DATA,
					statusMessage: Sixpack.STATUS_MESSAGE_NOT_ENOUGH_DATA,
					winner: null,
					confidenceInterval: null,
					readable: "There is not enough data to determine a conclusive result."
				};
				return result;
			}

			//calculate confidence interval
			var confidenceInterval = this.getConfidenceInterval(versionID);

			confidenceIntervals[versionID] = confidenceInterval;
		}

		// At this point, we have enough data to determine whether there is a winner or not
		result = this.analyzeConfidenceIntervals(confidenceIntervals);
		return result;
	} else {
		throw new Error('There are no versions available.');
	}
};

Sixpack.prototype.analyzeConfidenceIntervals = function(confidenceIntervals) {

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

	// if highest min > highest max, declare the ID of the winner to be the min
	if (largestMin > largestMax){
		winningVersionName = this._versions[idWithLargestMin].name;
		var roundedMin = (Math.round(10000 * confidenceIntervals[idWithLargestMin].min)/100);
		var roundedMax = (Math.round(10000 * confidenceIntervals[idWithLargestMin].max)/100);

		var message = "In a hypothetical experiment that is repeated infinite times, the average rate of the \"";
		message += winningVersionName + "\" version will fall between ";
		message += roundedMin + "% and ";
		message += roundedMax + "%, 95% of the time";

		result = {
			status: Sixpack.STATUS_ENOUGH_DATA_AND_RESULT,
			statusMessage: Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_RESULT,
			winner: winningVersionName,
			confidenceInterval: { min: roundedMin, max: roundedMax },
			readable: message
		};
		return result;
	} else {
		// otherwise, there is no winner
		var messageNoWinner = "We have enough data to say we cannot predict a winner with 95% certainty.";

		result = {
			status: Sixpack.STATUS_ENOUGH_DATA_AND_NO_RESULT,
			statusMessage: Sixpack.STATUS_MESSAGE_ENOUGH_DATA_AND_NO_RESULT,
			winner: null,
			confidenceInterval: null,
			readable: messageNoWinner
		};
	}

	return result;

};

// Sorts list from greatest to least
Sixpack.prototype.sortList = function(list) {
	list.sort(function(a, b) {
		return b.val - a.val;
	});
	return list;
};


// Are these result statistically significant?
// (zscore^2 * stdErr * (1 - stdErr)) / marginErr^2
Sixpack.prototype.getRequiredSampleSize = function(versionID) {
	var standardError = this.getStandardError(versionID);
	var numerator = (Math.pow(this._zScore, 2) * standardError * (1 - standardError));
	var denominator = Math.pow(this._marginOfError, 2);

	var requiredSampleSize = Math.max((numerator/denominator), 100);
	return requiredSampleSize;
};

Sixpack.prototype.hasEnoughData = function(versionID) {
	var version = this.getVersion(versionID);
	var requiredSampleSize = this.getRequiredSampleSize(versionID);
	if (version.totalCount >= requiredSampleSize) {
		return true;
	} else {
		return false;
	}
};

Sixpack.prototype.getRate = function(versionID) {

	var version = this.getVersion(versionID);
	if (version.totalCount === 0) {
		throw new Error('Total is zero: cannot divide by zero to produce rate.');
	} else if (version.totalCount < 0) {
		throw new Error('Total is negative: cannot use a negative number to produce rate.');
	} else {
		var rate = version.eventCount / version.totalCount;
		return rate;
	}
};

// Calculate the interval for which we are <zscore> confident
// rate +- (zscore * standard error)
Sixpack.prototype.getConfidenceInterval = function(versionID) {
	var confidenceInterval = {};
	var rate = this.getRate(versionID);
	var standardError = this.getStandardError(versionID);
	//lower limit
	var min = rate - (this._zScore * standardError);
	//upper limit
	var max = rate + (this._zScore * standardError);

	confidenceInterval = { min: min, max: max };

	return confidenceInterval;
};

// Calculate standard error:
// SE = sqrt(rate*(1-rate)/total)
Sixpack.prototype.getStandardError = function(versionID) {
	var version = this.getVersion(versionID);

	//Throw error if rate is not okay.
	var rate = this.getRate(versionID);

	//Check total Count - if total count is 0
	var standardError = Math.sqrt(rate*(1-rate)/version.totalCount);
	return standardError;
};
// TODO fix for use with browser (script) instead of node
module.exports = Sixpack;