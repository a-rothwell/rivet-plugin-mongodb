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

export type MongoDBVectorKNN = ChartNode<
  "mongoDBVectorKNN",
  MongoDBVectorKNNData
>;

export type MongoDBVectorKNNData = {
  database: string;
  useDatabaseInput?: boolean;

  collection: string;
  useCollectionInput?: boolean;

  k: number;
  useKInput?: boolean;

  path: string;
  usePathInput?: boolean;
};

export default function (rivet: typeof Rivet) {
  const nodeImpl: PluginNodeImpl<MongoDBVectorKNN> = {
    create(): MongoDBVectorKNN {
      const node: MongoDBVectorKNN = {
        id: rivet.newId<NodeId>(),
        data: {
          k: 10,
          database: '',
          collection: '',
          path: '',
        },
        title: "Search MongoDB for closest vectors with KNN",
        type: "mongoDBVectorKNN",
        visualData: {
          x: 0,
          y: 0,
          width: 200,
        },
      };
      return node;
    },
    getInputDefinitions(
      data: MongoDBVectorKNNData,
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

      if (data.useKInput) {
        inputs.push({
          id: 'k' as PortId,
          title: 'K',
          dataType: 'number',
          required: true,
        });
      }

      if (data.usePathInput) {
        inputs.push({
          id: 'path' as PortId,
          title: 'Path',
          dataType: 'string',
          required: true,
        });
      }

      return inputs;
    },

    getOutputDefinitions(
      _data: MongoDBVectorKNNData,
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
        contextMenuTitle: "MongoDB Vector KNN",
        group: "MongoDB",
        infoBoxBody:
          "This a node that takes a mongo db vector searches for similar vectors with KNN.",
        infoBoxTitle: "Run Mongo DB vector search with KNN",
      };
    },

    getEditors(
      _data: MongoDBVectorKNNData
    ): EditorDefinition<MongoDBVectorKNN>[] {
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
        },
        {
          type: 'number',
          label: 'K',
          dataKey: 'k',
          useInputToggleDataKey: 'useKInput',
        },
        {
          type: 'string',
          label: 'path',
          dataKey: 'path',
          useInputToggleDataKey: 'usePathInput',
        }
      ];
    },

    getBody(
      data: MongoDBVectorKNNData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
      ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
      ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
      ${data.useKInput ? '(K using input)' : 'K: ' + data.k}
      ${data.usePathInput ? '(Path using input)' : 'Path: ' + data.path}
      `;
    },

    async process(
      data: MongoDBVectorKNNData,
      inputData: Inputs,
      context: InternalProcessContext
    ): Promise<Outputs> {
      const { MongoClient } = await import("../nodeEntry");
      const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString as string | undefined;

      if (!uri) {
        throw new Error("No MongoDB connection string provided");
      }

      if (inputData['vector' as PortId]?.type !== 'vector') {
        throw new Error(`Expected vector input, got ${inputData['vector' as PortId]?.type}`);
      }

      const client = new MongoClient(uri);
      let results: Record<string, unknown>;
      try {
        await client.connect();

        const database = data.useDatabaseInput ? inputData['database' as PortId]?.value as string : data.database as string;
        const collection = data.useCollectionInput ? inputData['collection' as PortId]?.value as string : data.collection as string;
        const path = data.usePathInput ? inputData['path' as PortId]?.value as string : data.path as string;

        results = await client.db(database).collection(collection).aggregate([{
          "$search": {
            "knnBeta" : {
              "vector": inputData['vector' as PortId]?.value,
              "k": data.useKInput ? inputData['k' as PortId]?.value : data.k,
              "path": path
            }
          }}]
        ).toArray() as any;
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
    "Run Mongo DB vector search with KNN"
  );

  return nodeDefinition;
}
