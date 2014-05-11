require.config(
{
	paths:
	{
		'dropbox': 'https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest'
	},
	shim:
	{
		'dropbox':
		{
			exports: 'Dropbox'
		}
	}
});

var HealthApp = {};

/**
 * [Main description]
 * @param {HealthApp.dropboxConnector} dbc The dropbox connector module.
 */
HealthApp.Main = function(dbc)
{
	// dbc.init();
	dbc.addRecord();
};

require(
	[
		'dropboxConnector'
	],
	HealthApp.Main);
