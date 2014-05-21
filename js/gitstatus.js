module(function()
{
	'use strict';

	var model = {};

	/**
	 * Updates the status of GIT
	 * @param  {Object} data The last message from the GIT status endpoint.
	 */
	model.update = function(data)
	{
		var gs = document.querySelector('#gitstatus');

		if (gs)
		{
			gs.innerHTML = '<ul><li>' + new Date() + '</li><li>' + data.status + '</li><li>' + data.body + '</li></ul>';
		}
		else
		{
			gs = document.createElement('div');
			gs.id = 'gitstatus';
			document.body.appendChild(gs);
		}

		setInterval(requestGitStatus, 60000);
	};

	model.requestGitStatus = function()
	{
		var scr = document.querySelector('#get-request-status');

		if (scr)
		{
			scr.parentNode.removeChild(scr);
		}

		scr = document.createElement('script');
		scr.id = 'get-request-status';
		scr.src = 'https://status.github.com/api/last-message.json?callback=GitStatus.update';

		document.body.appendChild(scr);
	};

	// window.addEventListener('load', requestGitStatus);
	console.warn('Uncomment to run check git status.');

	return model;
});
