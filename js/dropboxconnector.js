HealthApp.dropboxConnector = function(healthdata, dropbox)
{
	'use strict';

	var module = {},
		client = new dropbox.Client(
		{
			key: 'lp5b4gpd7jc2z47',
			secret: 'g8i959uzvy6qfwi',
			uid: 508841
		});

	module.addRecord = function(record)
	{
		var dsm = client.getDatastoreManager();

		dsm.openDefaultDatastore(function(error, datastore)
		{
			if (error)
			{
				alert('Error opening data store: ' + error);
				return;
			}

			var healthTable = datastore.getTable('health');
			// healthTable.insert(record);
			// console.dir(healthTable.query()[0]);
			var xxx = healthTable.query()[0].getFields();
			console.dir(xxx);

		});

		dsm.listDatastores(function(error, datastores)
		{
			// console.dir(datastores);
		});

		dsm.close();
	};

	function authenticatUser()
	{
		if (!client.isAuthenticated())
		{
			client.authenticate(
				{
					interactive: false
				},
				function(error)
				{
					if (error)
					{
						alert('Authentication error: ' + error);
					}
				}
			);
		}
	}

	authenticatUser();

	return module;
};

define([
		'healthdata',
		'dropbox'
	],
	HealthApp.dropboxConnector);
