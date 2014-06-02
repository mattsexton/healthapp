var module = (function()
{
	'use strict';

	console.clear();

	var bpath = '',
		extdeps = [],
		pendingModules = {},
		modManagerName = 'module.manager.js',
		modManagerElement = document.querySelector('script[src$="' + modManagerName + '"]'),
		model = function(dependancies, newmodule)
		{
			var name = getCurrentScript(),
				module = getModule(name);

			if (isArray(dependancies) && isFunction(newmodule))
			{
				pendingModules[name] = {
					item: newmodule,
					dependancies: dependancies
				};

				if (!dependancies.every(dependanciesLoaded))
				{
					document.addEventListener(name + 'dependancyLoaded', dependancyLoadedEvent, false);

					dependancies.forEach(function(value)
					{
						loadScript(value, name);
					});
				}
				else
				{
					callModule(newmodule);
				}
			}
			else if (isFunction(dependancies))
			{
				pendingModules[name] = {
					item: dependancies,
					dependancies: null
				};
			}
			else
			{
				throw 'Incorrect argument format';
			}
		};

	Object.defineProperties(model,
	{
		basePath:
		{
			get: function()
			{
				if (!bpath)
				{
					bpath = modManagerElement.src.replace(modManagerName, '');
				}

				return bpath;
			},
			set: function(value)
			{
				bpath = value;
			},
			enumerable: true,
			configurable: true
		},
		external:
		{
			get: function()
			{
				return extdeps;
			},
			set: function(value)
			{
				extdeps = value;
			},
			enumerable: true,
			configurable: true
		}
	});

	model.moduleMap = [];

	function dependancyLoadedEvent(evt)
	{
		var detail = evt.detail,
			module = getModule(detail.depending),
			scriptElement;

		if (module.dependancies.every(dependanciesLoaded))
		{
			document.removeEventListener(detail.depending + 'dependancyLoaded', dependancyLoadedEvent);
			module.item = callModule(module);
			scriptElement = document.querySelector('script[data-module-name="' + detail.depending + '"]');

			if (scriptElement.dataset.dependingModuleId)
			{
				document.dispatchEvent(new CustomEvent(scriptElement.dataset.dependingModuleId + 'dependancyLoaded',
				{
					detail:
					{
						name: scriptElement.dataset.moduleName,
						depending: scriptElement.dataset.dependingModuleId
					}
				}));
			}
		}
	}

	function getCurrentScript()
	{
		var path = model.basePath,
			start,
			script;

		try
		{
			script = document.currentScript.src;
		}
		catch (e)
		{
			start = e.stack.lastIndexOf(path);
			script = e.stack.slice(start, e.stack.indexOf(':', start + path.length));
		}

		return script.replace(path, '').replace('.js', '');
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

			model.moduleMap.push(module);

			scriptTag.type = 'text/javascript';
			scriptTag.charset = 'utf-8';
			scriptTag.dataset.moduleName = scriptName;
			scriptTag.src = makePath(scriptName);

			if (dependingId)
			{
				scriptTag.dataset.dependingModuleId = dependingId;
			}

			scriptTag.addEventListener('load', scriptLoadEvent, false);
			// scriptTag.addEventListener('error', scriptError, false);

			document.querySelector('footer')
				.appendChild(scriptTag);
		}
		else if (!module.item)
		{
			// The requested module is currently loading, nothing else needs to be done at this point
			// However, there might be a possibility that two modules request another at the same time
			// and only one will get it. If that is the case then something more will need to be done.
		}
		else
		{
			// The requested module has already been loaded. Nothing else needs to be done.
		}
	}

	function scriptLoadEvent(evt)
	{
		var script = evt.target,
			name = script.dataset.moduleName,
			depending = script.dataset.dependingModuleId,
			module = getModule(name),
			moduleObject;

		script.removeEventListener('load', scriptLoadEvent);

		if (pendingModules[name])
		{
			module.dependancies = pendingModules[name].dependancies;

			if (!module.dependancies)
			{
				moduleObject = pendingModules[name].item();
			}
			else if (module.dependancies.every(dependanciesLoaded))
			{
				moduleObject = callModule(pendingModules[name]);
			}
			else
			{
				moduleObject = pendingModules[name].item;
			}
		}
		else if (isDependancyExternal(name))
		{
			moduleObject = window[getExternalDependancyObject(name).map];
		}
		else
		{
			throw 'Error find the module :: ' + name;
		}

		module.item = moduleObject;
		delete pendingModules[name];

		if (!depending && name === modManagerElement.dataset.init)
		{
			depending = modManagerElement.dataset.init;
		}

		document.dispatchEvent(new CustomEvent(depending + 'dependancyLoaded',
		{
			detail:
			{
				name: name,
				depending: depending
			}
		}));
	}

	function dependanciesLoaded(value)
	{
		var mod = getModule(value);

		if (mod)
		{
			if (isDependancyExternal(value))
			{
				return isObject(mod.item) || isFunction(mod.item);
			}
			else
			{
				return isObject(mod.item);
			}
		}
	}

	function getModule(scriptName)
	{
		var filter = model.moduleMap.filter(function(value)
		{
			return value.name === scriptName;
		});

		return filter[0];
	}

	function callModule(module)
	{
		var map = function(value)
		{
			return getModule(value).item;
		};

		return module.item.apply(document, module.dependancies.map(map));
	}

	function makePath(name)
	{
		var path = name;

		if (!isDependancyExternal(name))
		{
			path = model.basePath + name + '.js';
		}
		else
		{
			path = getExternalDependancyObject(name).url;
		}

		return path;
	}

	function isDependancyExternal(name)
	{
		return model.external.some(function(value)
		{
			return value.name === name;
		});
	}

	function getExternalDependancyObject(name)
	{
		var obj = model.external.filter(function(value)
		{
			return value.name === name;
		});

		return obj[0];
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

	function isObject(obj)
	{
		return isOfType(obj, 'Object');
	}

	function isString(obj)
	{
		return isOfType(obj, 'String');
	}

	if (isString(modManagerElement.dataset.init))
	{
		loadScript(modManagerElement.dataset.init);
	}

	return model;
}());
