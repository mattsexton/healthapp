module.external.push(
{
  name: 'dropbox-datastore',
  // url: 'https://www.dropbox.com/static/api/dropbox-datastores-1.0-latest.js',
  url: '/js/external/dropbox-datastores-1.0-latest.js',
  map: 'Dropbox'
});

module(['dropbox-datastore'], function(dropbox)
{
  'use strict';

  var model = {},
    healthTable = null,
    dataStoreManager = null,
    client = new dropbox.Client(
    {
      key: 'lp5b4gpd7jc2z47',
      secret: 'g8i959uzvy6qfwi',
      uid: 508841
    });

  model.addRecord = function(record) {};

  model.getRecords = function(callback)
  {
    utils.isFunction(callback);

    if (!healthTable)
    {
      getHealthTable(model.getRecords, callback);
    }
    else
    {
      callback(healthTable.query());
    }
  };

  function getDatastoreManager()
  {
    if (!dataStoreManager)
    {
      dataStoreManager = client.getDatastoreManager();
    }
  }

  function getHealthTable(caller, callback)
  {
    utils.isFunction(caller);
    utils.isFunction(callback);

    if (!dataStoreManager)
    {
      getDatastoreManager();
    }

    dataStoreManager.openDefaultDatastore(function(error, datastore)
    {
      if (error)
      {
        throw 'Error opening data store: ' + error;
      }

      healthTable = datastore.getTable('health');

      if (callback)
      {
        caller(callback);
      }
    });

    dataStoreManager.close();
  }

  function authenticatUser()
  {
    if (!client.isAuthenticated())
    {
      client.authenticate(
        {
          // interactive: false
        },
        function(authError, authClient)
        {
          if (authClient)
          {
            client = authClient;
          }
          else if (authError)
          {
            alert('Authentication error: ' + authError);
          }
        }
      );
    }
  }

  authenticatUser();

  return model;
});
