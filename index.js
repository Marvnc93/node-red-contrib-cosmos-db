module.exports = function (RED) {
    var CosmosClient = require('@azure/cosmos').CosmosClient;
    'use strict';
    // Handling of the node-red configuration input
    function connection(config) {
        RED.nodes.createNode(this, config);
        console.log("Connection");
        var node = this;
        this.config =
            {
                endpoint: node.credentials.endpoint,
                key: node.credentials.key,
                database: config.database,
                collection: config.collection
            };
        //this.connection = client;
    };
    RED.nodes.registerType('Connection', connection,
        {
            credentials:
            {
                endpoint: { type: 'text' },
                key: { type: 'password' }
            }
        });
    // Create the connection to the cosmos db and post the output
    function query(config) {
        RED.nodes.createNode(this, config);
        var connection = RED.nodes.getNode(config.azrcon)
        var node = this;
        this.config = connection.config;
        this.query = config.query;
        //this.connection = connection.connection;

        node.on('input', function (msg) {

            const endpoint = String(node.config.endpoint);
            const masterKey = String(node.config.key);
            const databaseId = String(node.config.database);
            const containerId = String(node.config.collection);

            // console.log("Endpoint: "+endpoint);
            // console.log("Key: "+masterKey);
            // console.log("Database: "+databaseId);
            // console.log("Container: "+containerId);
            const client = new CosmosClient({ endpoint: endpoint, auth: { masterKey: masterKey } });
            async function queryContainer() {
                console.log(`Querying container:\n${containerId}`);

                // query to return all children in a family
                const querySpec = {
                    query: "SELECT VALUE c.id FROM c WHERE c.Temperature > @Temp",
                    parameters: [
                        {
                            name: "@Temp",
                            value: 23
                        }
                    ]
                };

                const { result: results } = await client.database(databaseId).container(containerId).items.query(node.query).toArray();
                console.log(`Got result: ${results}`);
                for (var queryResult of results) {
                    let resultString = JSON.stringify(queryResult);
                }
                node.send({ 'payload': results, 'query': node.query });
            };
            queryContainer();

        });
    }
    RED.nodes.registerType('Query', query);

    function addentry(config) {
        RED.nodes.createNode(this, config);
        var connection = RED.nodes.getNode(config.azrcon)
        var node = this;
        this.config = connection.config;

        node.on('input', function (msg) {

            const endpoint = String(node.config.endpoint);
            const masterKey = String(node.config.key);
            const databaseId = String(node.config.database);
            const containerId = String(node.config.collection);
            const HttpStatusCodes = {NOTFOUND: 404};
            const client = new CosmosClient({ endpoint: endpoint, auth: { masterKey: masterKey } });
            async function createItem(itemBody) {
                try {
                    // read the item to see if it exists
                    const { item } = await client.database(databaseId).container(containerId).item(itemBody.id).read();
                    console.log(`Item with family id ${itemBody.id} already exists\n`);
                }
                catch (error) {
                    // create the family item if it does not exist
                    if (error.code === HttpStatusCodes.NOTFOUND) {
                        const { item } = await client.database(databaseId).container(containerId).items.create(itemBody);
                        console.log(`Created family item with id:\n${itemBody.id}\n`);
                    } else {
                        throw error;
                    }
                }
            };
            console.log(msg.payload);
            msg.payload.forEach(function(element,index){
                createItem(element);
            });
            
            //createItem(msg.payload);
        });
    }
    RED.nodes.registerType('Push', addentry)
};