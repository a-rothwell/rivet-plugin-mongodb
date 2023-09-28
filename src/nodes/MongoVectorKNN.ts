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

export type MongoVectorKNN = ChartNode<
  "mongoDBVectorKNN",
  MongoVectorKNNData
>;

export type MongoVectorKNNData = {
  database: string;
  useDatabaseInput?: boolean;

  collection: string;
  useCollectionInput?: boolean;

  k: number;
  useKInput?: boolean;
};

export default function (rivet: typeof Rivet) {
  const nodeImpl: PluginNodeImpl<MongoVectorKNN> = {
    create(): MongoVectorKNN {
      const node: MongoVectorKNN = {
        id: rivet.newId<NodeId>(),
        data: {
          k: 10,
          database: '',
          collection: '',
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
      data: MongoVectorKNNData,
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

      return inputs;
    },

    getOutputDefinitions(
      _data: MongoVectorKNNData,
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
          "This is an example of running a mongo db vector search with KNN.",
        infoBoxTitle: "Run Mongo DB vector search with KNN",
      };
    },

    getEditors(
      _data: MongoVectorKNNData
    ): EditorDefinition<MongoVectorKNN>[] {
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
      ];
    },

    getBody(
      data: MongoVectorKNNData
    ): string | NodeBodySpec | NodeBodySpec[] | undefined {
      return rivet.dedent`
      ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
      ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
      `;
    },

    async process(
      data: MongoVectorKNNData,
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

        results = await client.db(database).collection(collection).aggregate([{
          "$search": {
            "knnBeta" : {
              "vector": inputData['vector' as PortId]?.value,
              "k": data.useKInput ? inputData['k' as PortId]?.value : data.k,
              "path": "plot_embedding"
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
    "Store Vector in MongoDB"
  );

  return nodeDefinition;
}
