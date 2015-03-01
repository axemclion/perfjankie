// Migrating from 0.2.x to 1.2.x

var Q = require('q');

var utility = require('./utility');

module.exports = function(oldDb, newDb, config) {
	var log = config.log;

	return utility.forEachDoc(oldDb, newDb, function(doc) {
		if (doc.type !== 'perfData') {
			return null;
		}
		delete doc._id;
		delete doc._rev;

		for (var key in doc.data) {
			if (typeof doc.data.mean_frame_time === 'number') { // From TracingMetrics
				doc.data.frames_per_sec = 1000 / doc.data.mean_frame_time;
			}
			if (typeof doc.data.meanFrameTime === 'number') { // from RAF
				doc.data.framesPerSec_raf = 1000 / doc.data.meanFrameTime;

			}
		}

		return doc;
	});
};

var getFramesPerSec = function(val, metrics) {
	var mft;
	// Iterate over each candidate to calculate FPS
	for (var i = 0; i < metrics.length; i++) {
		if (val[metrics[i]]) {
			mft = val[metrics[i]].sum / val[metrics[i]].count;
		}
		if (mft >= 10 && mft <= 60) {
			break;
		} else {
			mft = null;
		}
	}
	if (mft) {
		return {
			sum: 1000 / mft,
			count: 1
		};
	}
};