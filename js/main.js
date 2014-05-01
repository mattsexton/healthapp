require.config(
{
	enforceDefine: true,
	shim:
	{
		dropbox:
		{
			exports: 'Dropbox'
		}
	},
	paths:
	{
		dropbox: 'https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest'
	}
});

define(
	[
		'dropboxconnector'
	],
	function (dbc)
	{
		'use strict';

		dbc.init();
	}
);