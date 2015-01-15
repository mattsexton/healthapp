module(['helpers/views'], function(views)
{
  'use strict';
  var model = {};

  var Chart = (function()
  {
    function chart(records, maxValue, minValue)
    {
      // TODO: Write a map function on the record set to convert the values to the new range? Might be useful?
      this.records = records;

      this.svgData = {
        // Fixed Values:
        chartBodyHeight: 250,
        chartBodyWidth: 250,
        chartBodyOffset: 25,
        chartXAxisHeight: 25,
        chartYAxisWidth: 25,
        multiplier: 5,
        offset: 5,

        // Calculated Values:
        chartHeight: 0, // chartBodyHeight + chartXAxisHeight
        chartWidth: 0, // chartBodyWidth  + chartYAxisWidth
        graphHeight: 100, // the inverted value of min
        max: 100, // Default is 100, max value of the record set based on maxValue
        min: 0, // Default is 0, min value of the record set based on minValue

        // Dynamic Values
        // X and Y axis tick marks are based on the number of records and the scale
        chartXAxisTicMarks: [],
        chartYAxisTicMarks: []
      };

      var svgd = this.svgData,
        recs = this.records;

      if (utils.isNumber(maxValue))
      {
        svgd.max = maxValue;
      }
      else if (utils.isString(maxValue))
      {
        svgd.max = Math.max.apply(null, recs.map(function(v)
        {
          return v.get(maxValue);
        }));
      }

      if (utils.isNumber(minValue))
      {
        svgd.min = minValue;
      }
      else if (utils.isString(minValue))
      {
        svgd.min = Math.min.apply(null, recs.map(function(v)
        {
          return v.get(minValue);
        }));
      }

      svgd.graphHeight = this.mapInversePoint(svgd.min);
      svgd.chartHeight = svgd.chartBodyHeight + svgd.chartXAxisHeight;
      svgd.chartBodyWidth = (recs.length * svgd.multiplier) + svgd.offset;
      svgd.chartWidth = svgd.chartBodyWidth + svgd.chartBodyOffset * 2;
    }

    function dataPoints(trendName)
    {
      var pp, pa, pb, px, pxx, py, pyy,
        len = 0,
        pth = [],
        pthend = [],
        pts = [];

      for (var i = 0; i < this.records.length; i += 1)
      {
        px = i;
        py = this.mapInversePoint(this.records[i].get(trendName));
        pts.push(this.convertToCoordinate(px, py));

        if (i > 0)
        {
          //Get the length of the line
          pp = pts[i - 1];
          pa = parseInt(pp.split(',')[0], 10);
          pb = parseInt(pp.split(',')[1], 10);
          // √|(x-a)²+(y-b)²|
          len += Math.sqrt(Math.abs(Math.pow(px - pa, 2) + Math.pow(py - pb, 2)));
        }

        if (i === 0)
        {
          // Set the first path point, this establishes where the path starts
          pth.push('M' + pts[px]);
        }
        else if (i === 1)
        {
          // The second point should be a quadratice bezier because we dont have enough points yet
          pth.push('Q' + this.convertToCoordinate(0, py) + ' ' + pts[px]);
        }
        else
        {
          // All remaining points will be cubic beziers
          pxx = i - 1;
          pyy = this.mapInversePoint(this.records[pxx].get(trendName));
          pth.push('C' + this.convertToCoordinate(px, pyy) + ' ' + this.convertToCoordinate(pxx, py) + ' ' + pts[px]);
        }
      }

      pthend.push('L' + this.convertToCoordinate(this.records.length - 1, 100));
      pthend.push('L' + this.convertToCoordinate(0, 100));
      pthend.push('Z');

      return {
        points: pts.join(' '),
        path: pth.join(' '),
        pathend: pthend.join(' '),
        length: len / 2,
        time: this.records.length / 2 //TODO: this needs to be an inverse relationship, the bigger the record set, the faster the time
      };
    }

    function barData(maxValue, minValue)
    {
      var that = this,
        max = this.svgData.max,
        min = this.svgData.min,
        maxIsKey = utils.isString(maxValue),
        minIsKey = utils.isString(minValue);

      if (utils.isNumber(maxValue) || maxIsKey)
      {
        max = maxValue;
      }

      if (utils.isNumber(minValue) || minIsKey)
      {
        min = minValue;
      }

      return this.records.map(function(v, i)
      {
        var fields = v.getFields(),
          fieldData = {},
          top = maxIsKey ? fields[max] : max,
          bottom = minIsKey ? fields[min] : min,
          pt = that.convertToCoordinate(i),
          xa = that.mapInversePoint(top),
          xb = that.mapInversePoint(bottom);

        fieldData = {
          height: xb - xa,
          max: xa,
          min: xb,
          point: pt
        };

        if (i % 5 === 0 || i === (that.records.length - 1))
        {
          var tic = {
            x: pt,
            text: fields.date.getMonth() + '/' + fields.date.getDate()
          };

          that.svgData.chartXAxisTicMarks.push(tic);
        }

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
        trendLine.avgA += this.mapInversePoint(this.records[i].get(trendName));
        trendLine.avgB += this.mapInversePoint(this.records[i + recordsHalf].get(trendName));
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
      var ymax = this.mapInversePoint(max),
        ymin = this.mapInversePoint(min),
        band = {
          className: className,
          height: ymin - ymax,
          width: this.svgData.chartBodyWidth - (this.svgData.offset * 2),
          x: this.svgData.offset,
          y: ymax
        };

      return band;
    }

    function mapInversePoint(point)
    {
      // new_value = (old_value - old_min) / (old_max - old_min) * (new_max - new_min) + new_min
      var nmax = 0,
        nmin = 100,
        omin = this.svgData.min,
        omax = this.svgData.max;

      return Math.round(((point - omin) / (omax - omin) * (nmax - nmin)) + nmin);
    }

    // function remapPoint(point, oldMax, oldMin, newMax, newMin)
    // {
    // 	var val,
    // 		omax = oldMax,
    // 		omin = oldMin,
    // 		nmax = newMax || 0,
    // 		nmin = newMin || 100;
    //
    // 	// val = ((point - newMin)(oldmax - oldmin)/(newmax - newmin)) + oldmin
    // 	val = ((point - nmin) * (omax - omin) / (nmax - nmin)) + omin;
    // 	return val;
    // }

    /**
     * Convert a point to the mapped coordinate.
     * @param {number} point [description]
     * @param {number} value [description]
     * @returns {string} the mapped point
     */
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
      mapInversePoint: mapInversePoint,
      convertToCoordinate: convertToCoordinate
    };

    return chart;
  }());

  model.showBloodPressure = function(records)
  {
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
    records = records.concat(records);
    records = records.concat(records);
    records = records.concat(records);
    // records = records.concat(records);
    // records = records.concat(records);
    // !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

    // TODO: Need to ensure charts are loaded in the order they are called
    duelChart(records, 'duel-chart');
    bpSysChart(records, 'bpsys-chart');
    bpDiaChart(records, 'bpdia-chart');
  };

  function duelChart(records, id)
  {
    var chart = new Chart(records, 180, 60),
      data = {
        id: id,
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

  function bpSysChart(records, id)
  {
    var chart = new Chart(records, 190, 80),
      data = {
        id: id,
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

  function bpDiaChart(records, id)
  {
    var chart = new Chart(records, 130, 50),
      data = {
        id: id,
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
