module.exports = function (RED) {

    RED.nodes.createNode(this, config);

    function connection() {
        RED.nodes.createNode(this, config);
        console.log("Connection");
        var node = this;
        this.config =
            {
                endpoint: node.credentials.endpoint,
                key: node.credentials.key,
                database: node.database,
                collection: node.collection
            };
        RED.nodes.registerType('Connection', connection);
    };
   
    function cosmos() {
        RED.nodes.createNode(this, config);
        console.log("Cosmos")
    };
    
    node.on('input', function (msg) {
        //msg.payload = msg.payload.toLowerCase();
        console.log(node.config)
        msg.payload = "TEST";
        node.send(msg);
    });

    RED.nodes.registerType('Cosmos', cosmos);
};