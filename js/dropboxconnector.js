HealthApp.dropboxConnector = (function(healthdata, dropbox) {
	'use strict';

	var module = {},
		client;

	module.init = function() {
		getClient();
		authenticatUser();
	};

	module.addRecord = function(record) {
		var dsm = client.getDatastoreManager();

		dsm.openDefaultDatastore(function(error, datastore) {
			if (error) {
				alert('Error opening data store: ' + error);
				return;
			}

			var healthTable = datastore.getTable('health');
			healthTable.insert(record);
			console.dir(healthTable.query());
		});

		dsm.listDatastores(function(error, datastores) {
			console.dir(datastores);
		});

		dsm.close();
	};

	function getClient() {
		if (!client) {
			console.log('creating client');
			client = new dropbox.Client({
				key: 'lp5b4gpd7jc2z47',
				secret: 'g8i959uzvy6qfwi',
				uid: 508841
			});
		}
		else {
			console.log('client created already');
		}
	}

	function authenticatUser() {
		if (!client.isAuthenticated()) {
			client.authenticate({
					interactive: false
				},
				function(error) {
					if (error) {
						alert('Authentication error: ' + error);
					}
				}
			);
		}
	}

	return module;
}(
	HealthApp.healthdata,
	Dropbox
));
