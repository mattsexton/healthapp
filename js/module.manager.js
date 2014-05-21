var module = (function()
{
	'use strict';

	console.clear();

	var properties = {},
		pendingModules = {},
		model = function(dependancies, newmodule)
		{
			var name = getCurrentScript();

			if (isArray(dependancies))
			{
				moduleWithDependancies(name, dependancies, newmodule);
			}
			else if (isFunction(dependancies))
			{
				moduleWithNoDependancies(name, dependancies);
			}
			else
			{
				throw 'Incorrect argument format';
			}
		};

	properties.name = 'module.manager.js';
	properties.element = document.querySelector('script[src$="' + properties.name + '"]');
	properties.path = properties.element.src;

	model.config = {
		basePath: properties.path.replace(document.location.href, '')
			.replace(properties.name, ''),
		moduleMap: []
	};

	function moduleWithDependancies(name, dependancies, newmodule)
	{
		if (!isFunction(newmodule))
		{
			throw 'Missing module definition';
		}

		pendingModules[name] = {
			item: newmodule,
			dependancies: dependancies
		};

		dependancies.forEach(function(value)
		{
			loadScript(value, name);
		});
	}

	function moduleWithNoDependancies(name, newmodule)
	{
		pendingModules[name] = {
			item: newmodule,
			dependancies: null
		};
	}

	function getCurrentScript()
	{
		var path = document.location.href + model.config.basePath,
			start, script;

		try
		{
			script = document.currentScript.src;
		}
		catch (e)
		{
			start = e.stack.lastIndexOf(path);
			script = e.stack.slice(start, e.stack.indexOf(':', start + path.length));
		}

		return script.replace(path, '')
			.replace('.js', '');
	}

	function getModule(scriptName)
	{
		var filter = model.config.moduleMap.filter(function(value)
		{
			return value.name === scriptName;
		});

		return filter[0];
	}

	function loadScript(scriptName, dependingId)
	{
		var module = getModule(scriptName);

		if (!module)
		{
			var scriptTag = document.createElement('script');

			module = {
				name: scriptName,
				dependancies: null,
				item: null
			};

			model.config.moduleMap.push(module);

			scriptTag.type = 'text/javascript';
			scriptTag.charset = 'utf-8';
			scriptTag.dataset.moduleName = scriptName;
			scriptTag.dataset.dependingModuleId = dependingId;
			scriptTag.src = makePath(scriptName);

			scriptTag.addEventListener('load', scriptLoadEvent, false);
			// scriptTag.addEventListener('error', scriptError, false);

			document.querySelector('head')
				.appendChild(scriptTag);
		}
		else if (!module.item)
		{
			console.warn('This will happen if a module is loading.');
		}
		else
		{
			console.error('This will happend when the module has already been loaded. This shouldn\'t happen yet');
		}
	}

	function scriptLoadEvent(evt)
	{
		var script = evt.target,
			name = script.dataset.moduleName,
			module = getModule(name),
			itemIsFuncion = function(value)
			{
				var mod = getModule(value);
				return mod && isFunction(mod.item);
			},
			pending;

		script.removeEventListener('load', scriptLoadEvent);

		module.item = pendingModules[name].item;
		module.dependancies = pendingModules[name].dependancies;
		delete pendingModules[name];

		if (!module.dependancies)
		{
			module.item.apply(document);
		}

		pending = getModule(script.dataset.dependingModuleId);

		if (pending && pending.dependancies && pending.dependancies.every(itemIsFuncion))
		{
			pending.item.apply(
				document,
				pending.dependancies.map(function(value)
				{
					return getModule(value)
						.item;
				}));
		}
	}

	function makePath(name)
	{
		var path = name;
		if (name.indexOf('http') < 0)
		{
			path = document.location.href + model.config.basePath + name + '.js';
		}

		return path;
	}

	function isOfType(obj, type)
	{
		return obj && Object.prototype.toString.call(obj) === '[object ' + type + ']';
	}

	function isArray(obj)
	{
		return isOfType(obj, 'Array');
	}

	function isFunction(obj)
	{
		return isOfType(obj, 'Function');
	}

	function isString(obj)
	{
		return isOfType(obj, 'String');
	}

	if (isString(properties.element.dataset.init))
	{
		loadScript(properties.element.dataset.init);
	}

	return model;
}());
