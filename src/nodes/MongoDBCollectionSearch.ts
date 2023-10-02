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

export type MongoDBCollectionSearch = ChartNode<
  "mongoDBCollectionSearch",
  MongoDBCollectionSearchData
>;

export type MongoDBCollectionSearchData = {
  database: string;
  useDatabaseInput?: boolean;

  collection: string;
  useCollectionInput?: boolean;
};

export default function (rivet: typeof Rivet) {
  const nodeImpl: PluginNodeImpl<MongoDBCollectionSearch> = {
    create(): MongoDBCollectionSearch {
      const node: MongoDBCollectionSearch = {
        id: rivet.newId<NodeId>(),
        data: {
          database: '',
          collection: '',
        },
        title: "Search a MongoDB collection and return documents",
        type: "mongoDBCollectionSearch",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },
    getInputDefinitions(
      data: MongoDBCollectionSearchData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeInputDefinition[] {
      const inputs: NodeInputDefinition[] = [];

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
      _data: MongoDBCollectionSearchData,
      _connections: NodeConnection[],
      _nodes: Record<NodeId, ChartNode>,
      _project: Project
    ): NodeOutputDefinition[] {
      const outputs: NodeOutputDefinition[] = [
        {
          dataType: 'object',
          id: 'documents' as PortId,
          title: 'Documents',
        },
      ];
  
      return outputs;
    },

    getUIData(): NodeUIData {
      return {
        contextMenuTitle: "MongoDB Collection Search",
        group: "MongoDB",
        infoBoxBody:
          "This is a node that searches a MongoDB collection and returns documents.",
        infoBoxTitle: "Search a MongoDB collection and return documents",
      };
    },

    getEditors(
      _data: MongoDBCollectionSearchData
    ): EditorDefinition<MongoDBCollectionSearch>[] {
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
      data: MongoDBCollectionSearchData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
      ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
      ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
      `;
    },

    async process(
      data: MongoDBCollectionSearchData,
      inputData: Inputs,
      context: InternalProcessContext
    ): Promise<Outputs> {
      const { MongoClient } = await import("../nodeEntry");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString as string | undefined;

      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }

      const client = new MongoClient(uri);
      let results: Record<string, unknown>;
      try {
        await client.connect();

        const database = data.useDatabaseInput ? inputData['database' as PortId]?.value as string : data.database as string;
        const collection = data.useCollectionInput ? inputData['collection' as PortId]?.value as string : data.collection as string;

        results = await client.db(database).collection(collection).find().toArray() as any;
      } catch (err) {
        throw new Error(`Error vector searching document: ${err}`);
      } finally {
        await client.close();
      }

      return {
        ['documents' as PortId]: {
          type: 'object',
          value: results,
        },
      };
    },
  };

  const nodeDefinition = rivet.pluginNodeDefinition(
    nodeImpl,
    "Search a MongoDB collection and return documents"
  );

  return nodeDefinition;
}
