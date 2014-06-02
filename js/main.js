/*global module*/
module.external.push(
{
	name: 'handlebars',
	url: '/js/external/handlebars-v1.3.0.js',
	map: 'Handlebars'
});

module(['connector/dropbox', 'handlebars'], function (dbc, hb)
{
	'use strict';

	function mainLoad()
	{
		document.removeEventListener('load', mainLoad);
		dbc.getRecords(showHealthData);
	}

	function showHealthData(records)
	{
		var pts = [],
			ptsB = [],
			trendLine = {
				avgA: 0,
				avgB: 0,
				start: 0,
				end: 0,
				length: 0
			},
			trendLineB = {
				avgA: 0,
				avgB: 0,
				start: 0,
				end: 0,
				length: 0
			},
			svgData = {
				multiplier: 2,
				offset: 0,
				max: 0, // start with max at the lowest value
				min: 100, // start with min at the lowest value
				chartHeight: 250,
				graphHeight: 0,
				graphWidth: 100,
				smallGrid: 2,
				bigGrid: 20
			},
			toCoordinate = function (i, v)
			{
				// i = Math.round((i * svgData.multiplier) + (svgData.width / 2));
				i = Math.round((i * svgData.multiplier) + svgData.offset);
				if (Object.prototype.toString.call(v) !== '[object Number]')
				{
					return i;
				}
				else
				{
					return i + ',' + v;
				}
			},
			pointInvert = function (i)
			{
				return Math.round(((svgData.max - i) / svgData.max) * 100);
			};

		// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
		records = records.concat(records);
		records = records.concat(records);
		records = records.concat(records);
		records = records.concat(records);

		svgData.max = Math.max.apply(null, records.map(function (v)
		{
			return v.get('bpsys');
		}));

		svgData.min = Math.min.apply(null, records.map(function (v)
		{
			return v.get('bpdia');
		}));

		svgData.graphHeight = pointInvert(svgData.min - 20);
		svgData.graphWidth = Math.round((records.length * svgData.multiplier * (svgData.chartHeight / svgData.graphHeight)) + svgData.offset);

		svgData.smallGrid = svgData.graphHeight / 10;
		svgData.bigGrid = svgData.smallGrid * 5;

		records.forEach(function (v, i)
		{
			var bpsysval = pointInvert(v.get('bpsys')),
				bpdiaval = pointInvert(v.get('bpdia'));

			if ((i + 1) <= records.length / 2)
			{
				trendLine.avgA += bpsysval;
				trendLineB.avgA += bpdiaval;
			}
			else
			{
				trendLine.avgB += bpsysval;
				trendLineB.avgB += bpdiaval;
			}

			pts.push(toCoordinate(i, bpsysval));
			ptsB.push(toCoordinate(i, bpdiaval));
		});

		trendLine.avgA = Math.round(trendLine.avgA / (records.length / 2));
		trendLine.avgB = Math.round(trendLine.avgB / (records.length / 2));
		trendLine.end = toCoordinate(records.length);
		trendLine.length = Math.round(Math.sqrt(Math.pow(trendLine.end - trendLine.start, 2) + Math.pow(trendLine.avgB - trendLine.avgA, 2)));

		trendLineB.avgA = Math.round(trendLineB.avgA / (records.length / 2));
		trendLineB.avgB = Math.round(trendLineB.avgB / (records.length / 2));
		trendLineB.end = toCoordinate(records.length);
		trendLineB.length = Math.round(Math.sqrt(Math.pow(trendLineB.end - trendLineB.start, 2) + Math.pow(trendLineB.avgB - trendLineB.avgA, 2)));

		var hdModel = function (evt)
		{
			document.removeEventListener('healthTemplateLoaded', hdModel);
			var view = hb.compile(evt.detail.content),
				data = {
					barData: records.map(function (v, i)
					{
						var fields = v.getFields(),
							fieldData = {
								height: fields.bpsys - fields.bpdia + 1,
								min: pointInvert(fields.bpdia),
								max: pointInvert(fields.bpsys),
								x: toCoordinate(i),
								y: 0
							};

						return fieldData;
					}),
					bpSysTrendLine: trendLine,
					bpDiaTrendLine: trendLineB,
					points: pts.join(' '),
					pointsB: ptsB.join(' '),
					svgData: svgData
				};

			prepareTemplate('healthnumbers', view(data));
		};

		document.addEventListener('healthTemplateLoaded', hdModel, false);
		getTemplate('health');
	}

	function prepareTemplate(id, content)
	{
		var view = document.createElement('div'),
			stage = document.querySelector('#health-data');

		view.classList.add('template-view');
		view.id = 'view-' + id;
		view.innerHTML = content;

		stage.appendChild(view);
	}

	function getTemplate(name)
	{
		var http = new XMLHttpRequest();
		http.open('get', '/templates/' + name + '.html');
		http.templateId = name;
		http.addEventListener('load', templateLoad, false);
		http.send();
	}

	function templateLoad(evt)
	{
		if (evt.target && evt.target.response)
		{
			// document.querySelector('#templates').innerHTML = evt.target.response;
			document.dispatchEvent(new CustomEvent(evt.target.templateId + 'TemplateLoaded',
			{
				detail:
				{
					success: true,
					templateName: evt.target.templateId,
					content: evt.target.response
				}
			}));
		}
		else
		{
			throw 'Template Load Error';
		}
	}

	mainLoad();
});

/*
function randomizeData(records)
{
var d = null;
records.forEach(function (v, i)
{
console.log(v.getFields());

if (i === 0)
{
d = new Date(v.get('date'));
v.set('date', d);
}

if (i > 0)
{
v.set('bpsys', parseInt(Math.random() * 50 + 100));
v.set('bpdia', parseInt(Math.random() * 20 + 80));
v.set('heartrate', parseInt(Math.random() * 30 + 70));
v.set('weight', parseInt(Math.random() * 30 + 70));

v.set('date', d.setDate(d.getDate() + i));
d.setDate(d.getDate() + i);

v.update(
{
'bpsys': parseInt(Math.random() * 50 + 100),
'bpdia': parseInt(Math.random() * 20 + 80),
'heartrate': parseInt(Math.random() * 30 + 70),
'weight': parseInt(Math.random() * 30 + 70),
'date': d
});		}
});
}
*/
