module(['connector/dropbox', 'chart/bp'], function (dbc, bpChart)
{
	'use strict';

	function mainLoad()
	{
		document.removeEventListener('load', mainLoad);
		dbc.getRecords(bpChart.showBloodPressure);
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
