var meta = {},
	selected = {};

$(document).ready(function() {
	var chartHeight = window.innerHeight - ($('.page-title').position().top + $('.page-title').height()) - 150;
	chartHeight = chartHeight < 300 ? 300 : chartHeight;
	$('#chartDiv').height(chartHeight);

	$.getJSON('../meta/_view/suites', {
		group: true
	}).done(function(data) {
		if (data.rows.length == 1 && data.rows[0].key) {
			$('#pageHeader').html(data.rows[0].key);
		}
	});

	$.when(getMeta()).done(function(m) {
		meta = m;
		var loc = window.location.href;
		if (loc.indexOf('#') !== -1) {
			loc = loc.substring(loc.indexOf('#') + 1);
			var parts = {};
			_.each(loc.split('&'), function(val) {
				var part = val.split('=');
				parts[part[0]] = part[1];
			});
			selected = parts;
		}

		if (!selected.component || !selected.browser || !selected.metric) {
			var components = _.keys(meta);
			selected.component = components[0],
			selected.browser = _.keys(meta[selected.component])[0];
			selected.metric = meta[selected.component][selected.browser][0].key;
		}

		renderComponents();
		renderBrowsers();
		renderMetrics();
		triggerChart();
	});

	// Filter metrics
	$('#searchForm').on('submit', function() {
		window.setTimeout(function() {
			$('#filter li.active a').click();
		}, 100);
		return false;
	});

	var filterTemplate = _.template($('#filter script.template').html());
	var metricsDiv = $('#metrics'),
		filter = $('#filter'),
		resultsList = filter.find('ul.results');
	$('#searchForm input').on('keyup', function(e) {
		if (e.keyCode === 40 || e.keyCode === 38) {
			var active = resultsList.find('li.active');
			var next = active[e.keyCode === 40 ? 'next' : 'prev']();
			if (next.length > 0) {
				active.removeClass('active');
				next.addClass('active');
			}
			return;
		}
		var word = $(this).val();
		metricsDiv.addClass('hide');
		filter.removeClass('hide');

		var term = new RegExp(word, 'i');
		var html = _.map(_.filter(meta[selected.component][selected.browser], function(m) {
			return m.key.match(term);
		}), function(m) {
			return filterTemplate({
				id: m.key,
				name: formatMetrics(m.key)
			});
		});
		if (html.length === 0) {
			html = ['<li class = "list-group-item"><a>No results found</a></li>'];
		}
		resultsList.html(html.join(''));
		resultsList.find('li:first').addClass('active');
	});

	$('#filter').on('click', '.filter-metric', function() {
		selected.metric = $(this).data('metric');
		$('#filter .close').click();
		showSelected();
		triggerChart();
	}).on('click', '.close', function() {
		metricsDiv.removeClass('hide');
		filter.addClass('hide');
		$('#searchForm input').val('');
	});

	// Metrics selection
	$('#metrics').on('click', 'a.category', function() {
		$('#metrics').find('.categories, .individual-metrics').addClass('hide');
		$('#metrics').find('.individual-metrics[data-category=' + $(this).attr('href').substring(1) + ']').removeClass('hide');
		return false;
	}).on('click', 'a.category-goback', function() {
		$('#metrics').find('.individual-metrics').addClass('hide');
		$('#metrics').find('.categories').removeClass('hide');
		return false;
	}).on('click', '.individual-metric', function() {
		selected.metric = $(this).attr('href').substring(1);
		triggerChart();
		return false;
	});

	// Component Name selections
	$('.component-list').on('click', 'li', function() {
		selected.component = $(this).data('component');
		selected.browser = _.keys(meta[selected.component])[0];
		selected.metric = meta[selected.component][selected.browser][0].key;

		$('.component').removeClass('open');
		$('#componentName').html(selected.component);
		renderBrowsers();
		renderMetrics();
		showSelected();
		triggerChart();
		return false;
	});

	// Select browser
	$('.browsers').on('click', 'li', function() {
		var $this = $(this);
		var newBrowser = $this.data('browser');
		if ($this.hasClass('disabled') === false && selected.browser !== newBrowser) {
			selected.browser = newBrowser;
			selected.metric = meta[selected.component][newBrowser][0].key;
			renderMetrics();
			showSelected();
			triggerChart();
		}
		return false;
	});

	function getMeta() {
		return $.getJSON('../meta/_view/metrics', {
			group_level: 2
		}).then(function(data) {
			var meta = {};
			_.each(data.rows, function(row) {
				var component = row.key[1].component;
				var browser = row.key[0];
				var metric = row.key[1];
				if (typeof meta[component] === 'undefined') {
					meta[component] = {};
				}

				if (typeof meta[component][browser] === 'undefined') {
					meta[component][browser] = [];
				}
				meta[component][browser].push(metric);
			});
			return meta;
		});
	}

	function getStats(browser, component, metric) {
		return $.Deferred(function(dfd) {
			$.getJSON('../data/_view/metrics', {
				startkey: JSON.stringify([browser, component, metric]),
				endkey: JSON.stringify([browser, component, metric, {}]),
				group: true
			}).then(function(data) {
				var result = [],
					minBand = [],
					maxBand = [];
				_.each(data.rows, function(obj, index) {
					var key = JSON.stringify(obj.key[4]).replace(/\"/g, '');
					result.push([key, obj.value.sum / obj.value.count]);
					minBand.push([key, obj.value.min]);
					maxBand.push([key, obj.value.max]);
				});

				dfd.resolve([result, minBand, maxBand]);
			}, dfd.reject);
		});
	}

	function renderComponents() {
		$('.component-list').html(_.template($('.component-list-template script').html(), {
			components: _.keys(meta)
		}));
		$('#componentName').html(selected.component);
	}

	function renderBrowsers() {
		$(_.keys(meta[selected.component]).map(function(b) {
			return '.' + b;
		}).join()).removeClass('disabled');
	}

	function renderMetrics() {
		var common = ['ExpensiveEventHandlers', 'RecalculateStyles_avg', 'mean_frame_time'];
		var groups = {
			Common: {}
		};
		_.each(common, function(metric) {
			groups['Common'][metric] = {
				name: formatMetrics(metric)
			};
		});

		_.each(meta[selected.component][selected.browser], function(metric) {
			var group = metric.source;
			metric._group = group;
			if (typeof groups[group] === 'undefined') {
				groups[group] = {};
			}

			groups[group][metric.key] = {
				name: formatMetrics(metric.key)
			};
		});

		$('#metrics').html(_.template($('#metricsTemplate').text(), {
			metrics: groups
		}));
	}

	function formatMetrics(metric) {
		metric = metric.replace(/_/g, ' ');
		metric = metric.replace(/avg/, '(avg)').replace(/max/, '(max)').replace(/count/, '(count)');
		return metric;
	}

	function showSelected() {
		var m = _.find(meta[selected.component][selected.browser], function(m) {
			return m.key === selected.metric;
		});
		$('#metrics .categories li a[data-group=' + m._group + ']').click();
	}

	function triggerChart() {
		$('#chartDiv').html('<center>Loading</center>');
		var component = selected.component;
		var metric = selected.metric;
		var browser = selected.browser;

		var loc = window.location.href;
		loc = loc.substring(0, loc.indexOf('#'));
		window.location = loc + '#browser=' + browser + '&metric=' + metric + '&component=' + component;
		getStats(browser, component, metric).then(function(res, band) {
				$('#chartDiv').empty();
				var metric = _.find(meta[selected.component][selected.browser], function(m) {
					return m.key === selected.metric;
				});
				if (metric) {
					drawGraph(res, band, metric.unit);
				} else {
					document.location.hash = "";
					showModal('Error', 'Unknown metric <em>' + selected.metric + '</em> for <em>' + selected.component + '</em> in browser ' + selected.browser);
				}
			},
			function(err) {
				document.location.hash = "";
				showModal('Error', 'Could not load results from remote server : ' + err.statusText);
			});

		$('#metricTitle').html(formatMetrics(metric));
		$('.browsers li, .individual-metric').removeClass('active');
		$('.browsers li[class=' + browser + ']').addClass('active');
		$('.individual-metric[data-metric=' + metric + '').addClass('active');
	}

	function drawGraph(data, band, yaxisLabel) {
		if (data.length === 0 || data[0].length === 0) {
			document.location.hash = "";
			showModal('Error', 'Could not get results for drawing the graph');
			return;
		}
		$.jqplot("chartDiv", data, {
			// Turns on animatino for all series in this plot.
			animate: true,
			// Will animate plot on calls to plot1.replot({resetAxes:true})
			animateReplot: true,
			series: [{
				lineWidth: 1,
				color: "rgb(67, 142, 185)",
				markerOptions: {
					size: 2,
					style: "circle"
				}
			}, {
				show: false
			}, {
				show: false
			}],
			axesDefaults: {
				pad: 1.2
			},
			seriesDefaults: {
				rendererOptions: {
					smooth: true
				}
			},
			fillBetween: {
				series1: 1,
				series2: 2,
				color: "rgba(67, 142, 185, 0.2)",
				baseSeries: 0,
				fill: true
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
						mark: 'inside',
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
		var html = ['<center><h1>', title, '</h1><h3>', body, '</h3></center>'];
		$('#chartDiv').html(html.join(''));
	}
});