// It is important that you only import types from @ironclad/rivet-core, and not
// any of the actual Rivet code. Rivet is passed into the initializer function as
// a parameter, and you can use it to access any Rivet functionality you need.
import { type RivetPlugin, type RivetPluginInitializer } from "@ironclad/rivet-core";

import mongoDBStoreNode from "./nodes/MongoDBStore";
import mongoDBVectorKNNNode from "./nodes/MongoDBVectorKNN";
import mongoDBCollectionSearchNode from "./nodes/MongoDBCollectionSearch";

// A Rivet plugin must default export a plugin initializer function. This takes in the Rivet library as its
// only parameter. This function must return a valid RivetPlugin object.
const initializer: RivetPluginInitializer = (rivet) => {
  // Initialize any nodes in here in the same way, by passing them the Rivet library.
  const mongoDBStore = mongoDBStoreNode(rivet);
  const mongoDBVectorSearch = mongoDBVectorKNNNode(rivet);
  const mongoDBCollectionSearch = mongoDBCollectionSearchNode(rivet);

  // The plugin object is the definition for your plugin.
  const plugin: RivetPlugin = {
    // The ID of your plugin should be unique across all plugins.
    id: "rivetPluginMongodb",

    // The name of the plugin is what is displayed in the Rivet UI.
    name: "Rivet Plugin MongoDB",

    // Define all configuration settings in the configSpec object.
    configSpec: {
      mongoDBConnectionString: {
        type: 'secret',
        label: 'Rivet MongoDB Connection String',
        description: 'The connection string for the MongoDB service.',
        pullEnvironmentVariable: 'RIVET_MONGODB_CONNECTION_STRING',
        helperText: 'You may also set the RIVET_MONGODB_CONNECTION_STRING environment variable.',
      },
    },

    // Define any additional context menu groups your plugin adds here.
    contextMenuGroups: [
      {
        id: "mongoDB",
        label: "MongoDB",
      },
    ],

    // Register any additional nodes your plugin adds here. This is passed a `register`
    // function, which you can use to register your nodes.
    register: (register) => {
      register(mongoDBStore);
      register(mongoDBVectorSearch);
      register(mongoDBCollectionSearch);
    },
  };

  // Make sure to return your plugin definition.
  return plugin;
};

// Make sure to default export your plugin.
export default initializer;
