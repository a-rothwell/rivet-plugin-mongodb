import type {
  ChartNode,
  EditorDefinition,
  Inputs,
  InternalProcessContext,
  NodeBodySpec,
  NodeConnection,
  NodeId,
  NodeInputDefinition,
  NodeOutputDefinition,
  NodeUIData,
  Outputs,
  PluginNodeImpl,
  PortId,
  Project,
  Rivet,
} from "@ironclad/rivet-core";

export type MongoDBStoreNode = ChartNode<
  "mongoDBStore",
  MongoDBStoreNodeData
>;

export type MongoDBStoreNodeData = {
  database: string;
  useDatabaseInput?: boolean;

  collection: string;
  useCollectionInput?: boolean;
};

export default function (rivet: typeof Rivet) {
  const nodeImpl: PluginNodeImpl<MongoDBStoreNode> = {
    create(): MongoDBStoreNode {
      const node: MongoDBStoreNode = {
        id: rivet.newId<NodeId>(),
        data: {
          database: '',
          collection: '',
        },
        title: "Store Vector in MongoDB",
        type: "mongoDBStore",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },

    getInputDefinitions(
      data: MongoDBStoreNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

      inputs.push({
        id: 'vector' as PortId,
        title: 'Vector',
        dataType: 'vector',
        required: true,
      });

      inputs.push({
        id: 'doc' as PortId,
        title: 'Document Data',
        dataType: 'any',
        required: false,
      });

      if (data.useDatabaseInput) {
        inputs.push({
          id: 'database' as PortId,
          title: 'Database',
          dataType: 'string',
          required: true,
        });
      }

      if (data.useCollectionInput) {
        inputs.push({
          id: 'collection' as PortId,
          title: 'Collection',
          dataType: 'string',
          required: true,
        });
      }

      return inputs;
    },

    getOutputDefinitions(
      _data: MongoDBStoreNodeData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      const outputs: NodeOutputDefinition[] = [
        {
          id: 'complete' as PortId,
          title: 'Complete',
          dataType: 'boolean',
        },
      ];
  
      return outputs;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "MongoDB Vector Store",
        group: "MongoDB",
        infoBoxBody:
          "This is a node that stores a vector in MongoDB.",
        infoBoxTitle: "MongoDB Vector Store",
      };
    },

    getEditors(
      _data: MongoDBStoreNodeData
    ): EditorDefinition<MongoDBStoreNode>[] {
      return [
        {
          type: 'string',
          label: 'Database',
          dataKey: 'database',
          useInputToggleDataKey: 'useDatabaseInput',
        },{
          type: 'string',
          label: 'Collection',
          dataKey: 'collection',
          useInputToggleDataKey: 'useCollectionInput',
        }
      ];
    },

    getBody(
      data: MongoDBStoreNodeData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
      ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
      ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
      `;
    },

    async process(
      data: MongoDBStoreNodeData,
      inputData: Inputs,
      context: InternalProcessContext
    ): Promise<Outputs> {
      const { MongoClient, ServerApiVersion } = await import("../nodeEntry");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString as string | undefined;

      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }

      if (inputData['vector' as PortId]?.type !== 'vector') {
        throw new Error(`Expected vector input, got ${inputData['vector' as PortId]?.type}`);
      }

      const client = new MongoClient(uri);

      try {
        await client.connect();
        const doc = inputData['doc' as PortId]?.value || {};

        const database = data.useDatabaseInput ? inputData['database' as PortId]?.value as string : data.database as string;
        const collection = data.useCollectionInput ? inputData['collection' as PortId]?.value as string : data.collection as string;

        await client.db(database).collection(collection).insertOne({
          ...doc,
          plot_embedding: inputData['vector' as PortId]?.value,
        })

      } catch (err) {
        throw new Error(`Error inserting document: ${err}`);
      } finally {
        await client.close();
      }

      return {
        ['complete' as PortId]: {
          type: 'boolean',
          value: true,
        },
      };
    },
  };
  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Store Vector in MongoDB"
  );
  return nodeDefinition;
}
