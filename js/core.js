// file:///Users/mattsexton/Sites/index.html
var client = new Dropbox.Client(
{
    key: 'lp5b4gpd7jc2z47',
    secret: 'g8i959uzvy6qfwi',
    uid: 508841
});

// Try to finish OAuth authorization.
client.authenticate(
{
    interactive: true
}, function(error, dclient)
{
    console.dir(error);
    console.dir(dclient);

    console.dir(dclient.getUserInfo());

    if (error)
    {
        alert('Authentication error: ' + error);
    }
    else
    {
        console.log('yay');
    }

});

if (client.isAuthenticated())
{
    // Client is authenticated. Display UI.
    console.dir(client);
}
else
{
    console.log('boo');
}
