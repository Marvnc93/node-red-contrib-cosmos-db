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
    function cosmos(config) {
        RED.nodes.createNode(this, config);
        var connection = RED.nodes.getNode(config.azrcon)
        console.log("Cosmos");
        var node =this;
        this.config = connection.config;
        //this.connection = connection.connection;

        node.on('input', function (msg) {
            
            const endpoint = String(node.config.endpoint);
            const masterKey = String(node.config.key);
            const databaseId = String(node.config.database);

            //const masterKey = String("This is a wrong key");
            // const endpoint = "https://mczdb.documents.azure.com:443/";
            // const masterKey = "hE3lHT6PeBaQJlYIPXY4e4AYwSbhK9qJ4uNwHWwuuLU7hxyf4FYcwcwC76oXJiCj4dNNas5rxyC7gYk0cPMeOA==";
            // const databaseId = "db1";
            
            const containerId = String(node.config.collection);
            console.log("Endpoint: "+endpoint);
            console.log("Key: "+masterKey);
            console.log("Database: "+databaseId);
            console.log("Container: "+containerId);
            const client = new CosmosClient({ endpoint: endpoint, auth: {masterKey:masterKey}});

            // async function createContainer() {
            //     const { container } = await client.database(databaseId).containers.createIfNotExists({ id: "NewCont" });
            //     console.log(`Created container`);
            // }
            // createContainer();
            //const container = client.database(databaseId).containers.createIfNotExists({ id: "NewCont" });



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
                
                const {result:results} = await client.database(databaseId).container(containerId).items.query(querySpec).toArray();
                console.log(`Got result: ${results}`);
                for (var queryResult of results) {
                    let resultString = JSON.stringify(queryResult);
                    console.log(`\tQuery returned ${resultString}\n`);
                    
                }
                node.send(results.join(', '));
            };
            queryContainer();
            //node.send(msg);
        });
    }
    RED.nodes.registerType('Cosmos', cosmos);
};