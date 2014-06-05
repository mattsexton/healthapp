module(['helpers/views'], function (views)
{
	'use strict';
	var model = {};

	var Chart = (function ()
	{
		function chart(records, maxValue, minValue)
		{
			this.records = records;

			this.svgData = {
				multiplier: 2,
				offset: 0,
				max: 100,
				min: 0,
				chartHeight: 250,
				graphHeight: 100,
				graphWidth: 0,
				smallGrid: 2,
				bigGrid: 20
			};

			if (utils.isNumber(maxValue))
			{
				this.svgData.max = maxValue;
			}
			else if (utils.isString(maxValue))
			{
				this.svgData.max = Math.max.apply(null, this.records.map(function (v)
				{
					return v.get(maxValue);
				}));
			}

			if (utils.isNumber(minValue))
			{
				this.svgData.min = minValue;
			}
			else if (utils.isString(minValue))
			{
				this.svgData.min = Math.min.apply(null, this.records.map(function (v)
				{
					return v.get(minValue);
				}));
			}

			this.svgData.graphHeight = this.invertPoint(this.svgData.min);

			var twidth = Math.round(
				(this.records.length * this.svgData.multiplier *
					(this.svgData.chartHeight / this.svgData.graphHeight)) +
				this.svgData.offset
			);

			this.svgData.graphWidth = twidth > this.svgData.chartHeight ? twidth : this.svgData.chartHeight;

			this.svgData.smallGrid = this.svgData.graphHeight / 20;
			this.svgData.bigGrid = this.svgData.smallGrid * 4;
		}

		function dataPoints(trendName)
		{
			var points = [];

			for (var i = 0; i < this.records.length; i += 1)
			{
				points.push(this.convertToCoordinate(i, this.invertPoint(this.records[i].get(trendName))));
			}

			return points;
		}

		function barData(maxValue, minValue)
		{
			var that = this,
				max = 100,
				maxIsKey = utils.isString(maxValue),
				min = 0,
				minIsKey = utils.isString(minValue);

			if (utils.isNumber(maxValue) || maxIsKey)
			{
				max = maxValue;
			}

			if (utils.isNumber(minValue) || minIsKey)
			{
				min = minValue;
			}

			return this.records.map(function (v, i)
			{
				var fields = v.getFields(),
					fieldData = {},
					top = maxIsKey ? fields[max] : max,
					bottom = minIsKey ? fields[min] : min;

				fieldData = {
					height: top - bottom,
					max: that.invertPoint(top),
					min: that.invertPoint(bottom),
					point: that.convertToCoordinate(i)
				};

				return fieldData;
			});
		}

		function trendLines(trendName)
		{
			var tl,
				trendLine,
				recordsLength = this.records.length - 1,
				recordsHalf = Math.round(recordsLength / 2),
				i = 0;

			tl = {
				a: 0,
				b: 0,
				c: 0
			};

			trendLine = {
				avgA: 0,
				avgB: 0,
				start: 0,
				end: 0,
				length: 0
			};

			for (i; i < recordsHalf; i += 1)
			{
				trendLine.avgA += this.invertPoint(this.records[i].get(trendName));
				trendLine.avgB += this.invertPoint(this.records[i + recordsHalf].get(trendName));
			}

			trendLine.avgA = Math.round(trendLine.avgA / recordsHalf);
			trendLine.avgB = Math.round(trendLine.avgB / recordsHalf);
			trendLine.end = this.convertToCoordinate(recordsLength);

			tl.a = Math.pow(trendLine.end - trendLine.start, 2);
			tl.b = Math.pow(trendLine.avgB - trendLine.avgA, 2);
			tl.c = Math.sqrt(tl.a + tl.b);

			trendLine.length = Math.round(tl.c);

			return trendLine;
		}

		function colorBand(max, min, className)
		{
			var band = {
				className: className,
				start: this.invertPoint(max)
			};

			band.height = this.invertPoint(min) - band.start;

			return band;
		}

		function invertPoint(point)
		{
			return Math.round(((this.svgData.max - point) / this.svgData.max) * 100);
		}

		function convertToCoordinate(point, value)
		{
			point = Math.round((point * this.svgData.multiplier) + this.svgData.offset);

			if (!utils.isNumber(value))
			{
				return point;
			}
			else
			{
				return point + ',' + value;
			}
		}

		chart.prototype = {
			createDataPoints: dataPoints,
			createBarData: barData,
			createTrendLine: trendLines,
			createColorBand: colorBand,
			invertPoint: invertPoint,
			convertToCoordinate: convertToCoordinate
		};

		return chart;
	}());

	model.showBloodPressure = function (records)
	{
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		records = records.concat(records);
		records = records.concat(records);
		records = records.concat(records);
		records = records.concat(records);
		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

		console.groupCollapsed('records');
		records.forEach(function (v)
		{
			console.log(v);
		});
		console.groupEnd();

		duelChart(records);
		bpSysChart(records);
		bpDiaChart(records);
	};

	function duelChart(records)
	{
		var chart = new Chart(records, 180, 60),
			data = {
				barData: chart.createBarData('bpsys', 'bpdia'),
				trendLines: [
					chart.createTrendLine('bpsys'),
					chart.createTrendLine('bpdia')
				],
				dataPoints: [
					chart.createDataPoints('bpsys'),
					chart.createDataPoints('bpdia')
				],
				svgData: chart.svgData
			};

		views.getTemplate('health', showChart, data);
	}

	function bpSysChart(records)
	{
		var chart = new Chart(records, 180, 90),
			data = {
				barData: chart.createBarData('bpsys'),
				trendLines: [
					chart.createTrendLine('bpsys')
				],
				dataPoints: [
					chart.createDataPoints('bpsys')
				],
				colorBands: [
					chart.createColorBand(180, 160, 'red'),
					chart.createColorBand(160, 140, 'orange'),
					chart.createColorBand(140, 120, 'yellow'),
					chart.createColorBand(120, 90, 'green')
				],
				svgData: chart.svgData
			};

		views.getTemplate('health', showChart, data);
	}

	function bpDiaChart(records)
	{
		var chart = new Chart(records, 120, 60),
			data = {
				barData: chart.createBarData('bpdia'),
				trendLines: [
					chart.createTrendLine('bpdia')
				],
				dataPoints: [
					chart.createDataPoints('bpdia')
				],
				colorBands: [
					chart.createColorBand(120, 100, 'red'),
					chart.createColorBand(100, 90, 'orange'),
					chart.createColorBand(90, 80, 'yellow'),
					chart.createColorBand(80, 60, 'green')
				],
				svgData: chart.svgData
			};

		views.getTemplate('health', showChart, data);
	}

	function showChart(detail)
	{
		var view = views.compile(detail.content);
		views.showTemplate('healthnumbers', view(detail.data));
	}

	return model;
});
