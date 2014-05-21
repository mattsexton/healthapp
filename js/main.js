/*
var HealthApp = {};

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
*/

module(['gitstatus', 'connector/dropbox'], function(gitstatus, dbc)
{
	if (!gitstatus)
	{
		console.dir('gitstatus not loaded - you need to do a call/apply');
	}
	else
	{
		console.dir('success!');
        gitstatus.requestGitStatus();
	}

	if (dbc)
	{
		console.log('hooray for dbc');
		console.log(dbc);
	}
	else
	{
		console.log('no dbc');
	}
});
