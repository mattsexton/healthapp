module.external.push(
{
	name: 'handlebars',
	url: '/js/external/handlebars-v1.3.0.js',
	map: 'Handlebars'
});

module(['handlebars'], function (hb)
{
	'use strict';

	var model = {};

	model.showTemplate = function (id, content)
	{
		var view = document.createElement('div'),
			stage = document.querySelector('#health-data');

		view.classList.add('template-view');
		view.id = 'view-' + id;
		view.innerHTML = content;

		stage.appendChild(view);
	};

	model.getTemplate = function (name, callback, data)
	{
		/// HERE WE SHOULD MAKE SURE THAT WE DON'T REQUEST A TEMPLATE THAT HAS ALREADY BEEN RETRIEVED
		var http = new XMLHttpRequest();
		http.open('get', '/templates/' + name + '.tmpl');

		http.templateId = name;
		http.callback = callback;
		http.viewData = data;
		http.addEventListener('load', templateLoad, false);

		http.send();
	};

	model.compile = function (view)
	{
		return hb.compile(view);
	};

	function templateLoad(evt)
	{
		if (evt.target && evt.target.response && evt.target.callback)
		{
			var detail = {
				templateName: evt.target.templateId,
				content: evt.target.response,
				data: evt.target.viewData
			};

			evt.target.callback(detail);
		}
		else
		{
			throw 'Template Load Error';
		}
	}

	return model;
});

// document.dispatchEvent(new CustomEvent(evt.target.templateId + 'TemplateLoaded',
// {
// 	detail:
// 	{
// 		templateName: evt.target.templateId,
// 		content: evt.target.response
// 	}
// }));
