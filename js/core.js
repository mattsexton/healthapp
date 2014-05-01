(function (Dropbox)
{
    'use strict';

    var client;

    function init()
    {

        client = new Dropbox.Client(
        {
            key: 'lp5b4gpd7jc2z47',
            secret: 'g8i959uzvy6qfwi',
            uid: 508841
        });

        // Try to finish OAuth authorization.
        client.authenticate(
        {
            interactive: false
        }, function (error)
        {
            if (error)
            {
                alert('Authentication error: ' + error);
            }
        });

        if (client.isAuthenticated())
        {
            // Client is authenticated. Display UI.
            dataStore();
        }
        else
        {
            console.log('User is not authenticated');
        }
    }

    function dataStore()
    {
        var dsm = client.getDatastoreManager();

        dsm.openDefaultDatastore(function (error, datastore)
        {
            if (error)
            {
                alert('Error opening data store: ' + error);
                return;
            }

            var healthTable = datastore.getTable('health'),
                record = healthTable.insert(healthdata[0]);

            console.dir(record.get('date'));
            console.dir(healthTable.query());
        });

        dsm.listDatastores(function (error, datastores)
        {
            console.dir(datastores);
        });

        dsm.close();
    }

    init();
}(
    window.Dropbox
));