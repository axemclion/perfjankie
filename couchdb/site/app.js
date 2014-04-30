$(document).ready(function() {

	var metrics = {}, data = {};

	var chartHeight = window.innerHeight - $('.head-container').height() - $('.results > form').height() - 200;
	chartHeight = chartHeight < 300 ? 300 : chartHeight;
	$('#chartDiv').height(chartHeight);

	$.getJSON('../meta/_view/suites', {
		group: true
	}).done(function(data) {
		if (data.rows.length == 1 && data.rows[0].key) {
			$('.page-header > h1').html(data.rows[0].key);
		}
	});

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
				$('#browser').append($('<option>').html('' + row.key[0]));
			}
			metrics[row.key[0]].push(row.key[1]);
		});
		$('#browser>option:first').prop('selected', true);
		displayBrowserMetrics();

	})).done(function() {
		var loc = window.location.href;
		if (loc.indexOf('#') !== -1) {
			loc = loc.substring(loc.indexOf('#') + 1);
			var parts = {};
			_.each(loc.split('&'), function(val) {
				var part = val.split('=');
				parts[part[0]] = part[1];
			});
			$('#browser').val(parts.browser);
			$('#name').val(parts.component);
			$('#metric').val(parts.metric);
			_.each($('#browser, #name, #metric'), function(el) {
				if ($(el).children("option:selected").length === 0) {
					$(el).children("option:eq(0)").prop('selected', true);
				}
			});
		}
		$('select').prop('disabled', false);
		triggerChart();
	});

	$('#browser').on('change', function() {
		displayBrowserMetrics();
		triggerChart();
	});

	$('#component, #metric').on('change', function() {
		triggerChart();
	});

	function displayBrowserMetrics() {
		var m = _.pluck(metrics[$("#browser").val()], 'key');
		var common = ['meanFrameTime', 'Layout_avg', 'ExpensivePaints'];

		var html = ['<optgroup label = "Common">'];
		html.push(_.map(_.intersection(m, common), function(a) {
			return '<option value = "' + a + '">' + formatMetrics(a) + '</option>'
		}));
		html.push('</optgroup><optgroup label = "Others">');
		html.push(_.map(_.difference(m, common), function(a) {
			return '<option value = "' + a + '">' + formatMetrics(a) + '</option>'
		}));
		html.push('</optgroup>');

		$('#metric').html(html.join(''));
	}

	function formatMetrics(metric) {
		metric = metric.replace(/_/g, ' ');
		metric = metric.replace(/avg/, '(avg)').replace(/max/, '(max)').replace(/count/, '(count)');
		return metric;
	}

	function triggerChart() {
		$('#chartDiv').html('<center>Loading</center>');
		var component = $('#name').val();
		var metric = $('#metric').val();
		var browser = $('#browser').val();
		var loc = window.location.href;
		loc = loc.substring(0, loc.indexOf('#'));
		window.location = loc + '#browser=' + browser + '&metric=' + metric + '&component=' + component;
		getStats(browser, component, metric).then(function(res) {
				$('#chartDiv').empty();
				drawGraph([res], _.find(metrics[browser], function(m) {
					return m.key === metric;
				}).unit);
			},
			function(err) {
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
		if (data.length === 0 || data[0].length === 0) {
			showModal('Error', 'Could not get results for drawing the graph');
			return;
		}
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
					label: 'Runs',
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
					label: yaxisLabel || 'Y AXIS',
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