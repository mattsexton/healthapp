HealthApp.main = (function(model, dbc) {
	'use strict';

	console.dir(dbc);
	dbc.init();

	return model;
}(
	HealthApp,
	HealthApp.dropboxConnector
));
