$(document).ready(function() {

	var metrics = {}, data = {};

	// Load the name of the components and the available metrics
	$.when($.getJSON('../meta/_view/names', {
		group: true
	}).done(function(data) {
		$('#name').html(_.map(data.rows, function(row) {
			return '<option>' + row.key + '</option>';
		}).join(''));
	}), $.getJSON('../meta/_view/metrics', {
		group_level: 2
	}).done(function(data) {
		$('#browser').empty();
		_.each(data.rows, function(row) {
			if (typeof metrics[row.key[0]] === 'undefined') {
				metrics[row.key[0]] = [];
				$('#browser').append($('<option>').html(row.key[0]));
			}
			metrics[row.key[0]].push(row.key[1]);
		});
	})).done(function() {
		$('select').prop('disabled', false);
		$('#browser').change();
		window.setTimeout(triggerChart, 1000);
	});

	$('#browser').on('change', function() {
		var metricHTML = [];
		var browser = $("#browser").val();
		$('#metric').html(_.map(metrics[browser], function(m) {
			return '<option>' + m + '</option>';
		}));
		triggerChart();
	});

	$('#component, #metric').on('change', function() {
		triggerChart();
	});

	function triggerChart() {
		$('#chartDiv').html('<center>Loading</center>');
		var component = $('#name').val();
		var metric = $('#metric').val();
		var browser = $('#browser').val();
		getStats(browser, component, metric).then(function(res) {
			$('#chartDiv').empty();
			drawGraph([res], metric.match(/\([\S]*\)/g));
		}, function(err) {
			showModal('Error', 'Could not load results from remote server : ' + err.statusText);
		});
	}

	function getStats(browser, component, metric) {
		return $.Deferred(function(dfd) {
			$.getJSON('../data/_view/metrics', {
				startkey: JSON.stringify([browser, component, metric]),
				endkey: JSON.stringify([browser, component, metric, {}]),
				group: true
			}).then(function(data) {
				var result = _.map(data.rows, function(obj, index) {
					return [obj.key[4], obj.value.sum / obj.value.count];
				});
				dfd.resolve(result);
			}, dfd.reject);
		});
	}

	function drawGraph(data, yaxisLabel) {
		$.jqplot("chartDiv", data, {
			// Turns on animatino for all series in this plot.
			animate: true,
			// Will animate plot on calls to plot1.replot({resetAxes:true})
			animateReplot: true,
			series: [],
			axesDefaults: {
				pad: 0
			},
			seriesDefaults: {
				rendererOptions: {
					smooth: true
				},
				lineWidth: 1,
				markerOptions: {
					size: 2,
					style: "circle"
				}
			},
			axes: {
				// These options will set up the x axis like a category axis.
				xaxis: {
					renderer: $.jqplot.CategoryAxisRenderer,
					label: 'Versions',
					labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
					tickRenderer: $.jqplot.CanvasAxisTickRenderer,
					tickOptions: {
						angle: -90,
						mark: 'outside',
						showMark: true,
						showGridline: true,
						markSize: 4,
						show: true,
						showLabel: true,
					},
					showTicks: true, // wether or not to show the tick labels,
					showTickMarks: true,
				},
				yaxis: {
					tickOptions: {},
					rendererOptions: {
						forceTickAt0: false
					},
					label: yaxisLabel || '',
					labelRenderer: $.jqplot.CanvasAxisLabelRenderer,
					tickRenderer: $.jqplot.CanvasAxisTickRenderer
				}
			},
			highlighter: {
				show: true,
				showLabel: true,
				tooltipAxes: 'y',
				sizeAdjust: 7.5,
				tooltipLocation: 'ne'
			}
		});
	}

	function showModal(title, body) {
		$('.modal .modal-title').html(title);
		$('.modal .modal-body').html(body);
		$('.modal').modal(true);
	}
});