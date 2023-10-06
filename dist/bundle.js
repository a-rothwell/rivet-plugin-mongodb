// src/nodes/MongoDBStore.ts
function MongoDBStore_default(rivet) {
  const nodeImpl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          database: "",
          collection: "",
          path: ""
        },
        title: "Store Vector in MongoDB",
        type: "mongoDBStore",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      inputs.push({
        id: "vector",
        title: "Vector",
        dataType: "vector",
        required: true
      });
      inputs.push({
        id: "doc",
        title: "Document Data",
        dataType: "any",
        required: false
      });
      if (data.useDatabaseInput) {
        inputs.push({
          id: "database",
          title: "Database",
          dataType: "string",
          required: true
        });
      }
      if (data.useCollectionInput) {
        inputs.push({
          id: "collection",
          title: "Collection",
          dataType: "string",
          required: true
        });
      }
      if (data.usePathInput) {
        inputs.push({
          id: "path",
          title: "Path",
          dataType: "string",
          required: true
        });
      }
      return inputs;
    },
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      const outputs = [
        {
          id: "complete",
          title: "Complete",
          dataType: "boolean"
        }
      ];
      return outputs;
    },
    getUIData() {
      return {
        contextMenuTitle: "MongoDB Vector Store",
        group: "MongoDB",
        infoBoxBody: "This is a node that stores a vector in MongoDB.",
        infoBoxTitle: "MongoDB Vector Store"
      };
    },
    getEditors(_data) {
      return [
        {
          type: "string",
          label: "Database",
          dataKey: "database",
          useInputToggleDataKey: "useDatabaseInput"
        },
        {
          type: "string",
          label: "Collection",
          dataKey: "collection",
          useInputToggleDataKey: "useCollectionInput"
        },
        {
          type: "string",
          label: "Path",
          dataKey: "path",
          useInputToggleDataKey: "usePathInput"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
      ${data.useDatabaseInput ? "(Database using input)" : "Database: " + data.database}
      ${data.useCollectionInput ? "(Collection using input)" : "Collection: " + data.collection}
      ${data.usePathInput ? "(Path using input)" : "Path: " + data.path}
      `;
    },
    async process(data, inputData, context) {
      const { MongoClient, ServerApiVersion } = await import("../dist/nodeEntry.cjs");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString;
      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }
      if (inputData["vector"]?.type !== "vector") {
        throw new Error(`Expected vector input, got ${inputData["vector"]?.type}`);
      }
      if (data.usePathInput && inputData["path"]?.type !== "string") {
        throw new Error(`Expected string input, got ${inputData["path"]?.type}`);
      }
      const client = new MongoClient(uri);
      try {
        await client.connect();
        const doc = inputData["doc"]?.value || {};
        const path = inputData["path"]?.value || data.path;
        const database = data.useDatabaseInput ? inputData["database"]?.value : data.database;
        const collection = data.useCollectionInput ? inputData["collection"]?.value : data.collection;
        console.log(`Inserting document into ${database}.${collection} at path ${path}`);
        console.log(doc);
        console.log(inputData["vector"]?.value);
        await client.db(database).collection(collection).updateOne(
          { ...doc },
          { $set: { [path]: inputData["vector"]?.value } },
          { upsert: true }
        );
      } catch (err) {
        throw new Error(`Error inserting document: ${err}`);
      } finally {
        await client.close();
      }
      return {
        ["complete"]: {
          type: "boolean",
          value: true
        }
      };
    }
  };
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Store Vector in MongoDB"
  );
  return nodeDefinition;
}

// src/nodes/MongoDBVectorKNN.ts
function MongoDBVectorKNN_default(rivet) {
  const nodeImpl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          k: 10,
          database: "",
          collection: "",
          path: ""
        },
        title: "Search MongoDB for closest vectors with KNN",
        type: "mongoDBVectorKNN",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      inputs.push({
        id: "vector",
        title: "Vector",
        dataType: "vector",
        required: true
      });
      if (data.useDatabaseInput) {
        inputs.push({
          id: "database",
          title: "Database",
          dataType: "string",
          required: true
        });
      }
      if (data.useCollectionInput) {
        inputs.push({
          id: "collection",
          title: "Collection",
          dataType: "string",
          required: true
        });
      }
      if (data.useKInput) {
        inputs.push({
          id: "k",
          title: "K",
          dataType: "number",
          required: true
        });
      }
      if (data.usePathInput) {
        inputs.push({
          id: "path",
          title: "Path",
          dataType: "string",
          required: true
        });
      }
      return inputs;
    },
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      const outputs = [
        {
          dataType: "object",
          id: "documents",
          title: "Documents"
        }
      ];
      return outputs;
    },
    getUIData() {
      return {
        contextMenuTitle: "MongoDB Vector KNN",
        group: "MongoDB",
        infoBoxBody: "This a node that takes a mongo db vector searches for similar vectors with KNN.",
        infoBoxTitle: "Run Mongo DB vector search with KNN"
      };
    },
    getEditors(_data) {
      return [
        {
          type: "string",
          label: "Database",
          dataKey: "database",
          useInputToggleDataKey: "useDatabaseInput"
        },
        {
          type: "string",
          label: "Collection",
          dataKey: "collection",
          useInputToggleDataKey: "useCollectionInput"
        },
        {
          type: "number",
          label: "K",
          dataKey: "k",
          useInputToggleDataKey: "useKInput"
        },
        {
          type: "string",
          label: "path",
          dataKey: "path",
          useInputToggleDataKey: "usePathInput"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
      ${data.useDatabaseInput ? "(Database using input)" : "Database: " + data.database}
      ${data.useCollectionInput ? "(Collection using input)" : "Collection: " + data.collection}
      ${data.useKInput ? "(K using input)" : "K: " + data.k}
      ${data.usePathInput ? "(Path using input)" : "Path: " + data.path}
      `;
    },
    async process(data, inputData, context) {
      const { MongoClient } = await import("../dist/nodeEntry.cjs");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString;
      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }
      if (inputData["vector"]?.type !== "vector") {
        throw new Error(`Expected vector input, got ${inputData["vector"]?.type}`);
      }
      const client = new MongoClient(uri);
      let results;
      try {
        await client.connect();
        const database = data.useDatabaseInput ? inputData["database"]?.value : data.database;
        const collection = data.useCollectionInput ? inputData["collection"]?.value : data.collection;
        const path = data.usePathInput ? inputData["path"]?.value : data.path;
        results = await client.db(database).collection(collection).aggregate(
          [{
            "$search": {
              "knnBeta": {
                "vector": inputData["vector"]?.value,
                "k": data.useKInput ? inputData["k"]?.value : data.k,
                "path": path
              }
            }
          }]
        ).toArray();
      } catch (err) {
        throw new Error(`Error vector searching document: ${err}`);
      } finally {
        await client.close();
      }
      return {
        ["documents"]: {
          type: "object",
          value: results
        }
      };
    }
  };
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Run Mongo DB vector search with KNN"
  );
  return nodeDefinition;
}

// src/nodes/MongoDBCollectionSearch.ts
function MongoDBCollectionSearch_default(rivet) {
  const nodeImpl = {
    create() {
      const node = {
        id: rivet.newId(),
        data: {
          database: "",
          collection: ""
        },
        title: "Search a MongoDB collection and return documents",
        type: "mongoDBCollectionSearch",
        visualData: {
          x: 0,
          y: 0,
          width: 200
        }
      };
      return node;
    },
    getInputDefinitions(data, _connections, _nodes, _project) {
      const inputs = [];
      if (data.useDatabaseInput) {
        inputs.push({
          id: "database",
          title: "Database",
          dataType: "string",
          required: true
        });
      }
      if (data.useCollectionInput) {
        inputs.push({
          id: "collection",
          title: "Collection",
          dataType: "string",
          required: true
        });
      }
      return inputs;
    },
    getOutputDefinitions(_data, _connections, _nodes, _project) {
      const outputs = [
        {
          dataType: "object",
          id: "documents",
          title: "Documents"
        }
      ];
      return outputs;
    },
    getUIData() {
      return {
        contextMenuTitle: "MongoDB Collection Search",
        group: "MongoDB",
        infoBoxBody: "This is a node that searches a MongoDB collection and returns documents.",
        infoBoxTitle: "Search a MongoDB collection and return documents"
      };
    },
    getEditors(_data) {
      return [
        {
          type: "string",
          label: "Database",
          dataKey: "database",
          useInputToggleDataKey: "useDatabaseInput"
        },
        {
          type: "string",
          label: "Collection",
          dataKey: "collection",
          useInputToggleDataKey: "useCollectionInput"
        }
      ];
    },
    getBody(data) {
      return rivet.dedent`
      ${data.useDatabaseInput ? "(Database using input)" : "Database: " + data.database}
      ${data.useCollectionInput ? "(Collection using input)" : "Collection: " + data.collection}
      `;
    },
    async process(data, inputData, context) {
      const { MongoClient } = await import("../dist/nodeEntry.cjs");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString;
      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }
      const client = new MongoClient(uri);
      let results;
      try {
        await client.connect();
        const database = data.useDatabaseInput ? inputData["database"]?.value : data.database;
        const collection = data.useCollectionInput ? inputData["collection"]?.value : data.collection;
        results = await client.db(database).collection(collection).find().toArray();
      } catch (err) {
        throw new Error(`Error vector searching document: ${err}`);
      } finally {
        await client.close();
      }
      return {
        ["documents"]: {
          type: "object",
          value: results
        }
      };
    }
  };
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Search a MongoDB collection and return documents"
  );
  return nodeDefinition;
}

// src/index.ts
var initializer = (rivet) => {
  const mongoDBStore = MongoDBStore_default(rivet);
  const mongoDBVectorSearch = MongoDBVectorKNN_default(rivet);
  const mongoDBCollectionSearch = MongoDBCollectionSearch_default(rivet);
  const plugin = {
    // The ID of your plugin should be unique across all plugins.
    id: "rivetPluginMongodb",
    // The name of the plugin is what is displayed in the Rivet UI.
    name: "Rivet Plugin MongoDB",
    // Define all configuration settings in the configSpec object.
    configSpec: {
      mongoDBConnectionString: {
        type: "secret",
        label: "Rivet MongoDB Connection String",
        description: "The connection string for the MongoDB service.",
        pullEnvironmentVariable: "RIVET_MONGODB_CONNECTION_STRING",
        helperText: "You may also set the RIVET_MONGODB_CONNECTION_STRING environment variable."
      }
    },
    // Define any additional context menu groups your plugin adds here.
    contextMenuGroups: [
      {
        id: "mongoDB",
        label: "MongoDB"
      }
    ],
    // Register any additional nodes your plugin adds here. This is passed a `register`
    // function, which you can use to register your nodes.
    register: (register) => {
      register(mongoDBStore);
      register(mongoDBVectorSearch);
      register(mongoDBCollectionSearch);
    }
  };
  return plugin;
};
var src_default = initializer;
export {
  src_default as default
};
