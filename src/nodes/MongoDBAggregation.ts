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
  
  export type MongoDBAggregation = ChartNode<
    "mongoDBAggregation",
    MongoDBAggregationData
  >;
  
  export type MongoDBAggregationData = {
    database: string;
    useDatabaseInput?: boolean;
  
    collection: string;
    useCollectionInput?: boolean;
  
    aggregation: string;
  };
  
  export default function (rivet: typeof Rivet) {
    const nodeImpl: PluginNodeImpl<MongoDBAggregation> = {
      create(): MongoDBAggregation {
        const node: MongoDBAggregation = {
          id: rivet.newId<NodeId>(),
          data: {
            database: '',
            collection: '',
            aggregation: '',
          },
          title: "Perform a MongoDB aggregation operation on a collection",
          type: "mongoDBAggregation",
          visualData: {
            x: 0,
            y: 0,
            width: 200,
          },
        };
        return node;
      },
      getInputDefinitions(
        data: MongoDBAggregationData,
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
  
        inputs.push({
            id: 'aggregation' as PortId,
            title: 'Aggregation',
            dataType: 'string',
            required: true,
        });
        

        return inputs;
      },
  
      getOutputDefinitions(
        _data: MongoDBAggregationData,
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
          contextMenuTitle: "MongoDB Aggregation",
          group: "MongoDB",
          infoBoxBody:
            "This a node that takes a MongoDB Aggregation operation and returns results.",
          infoBoxTitle: "Run a MongoDB aggregation operation on a collection and return results",
        };
      },
  
      getEditors(
        _data: MongoDBAggregationData
      ): EditorDefinition<MongoDBAggregation>[] {
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
        data: MongoDBAggregationData
      ): string | NodeBodySpec | NodeBodySpec[] | undefined {
        return rivet.dedent`
        ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
        ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
        `;
      },
  
      async process(
        data: MongoDBAggregationData,
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
          const aggregation = inputData['aggregation' as PortId]?.value as string;

          results = await client.db(database).collection(collection).aggregate(
            aggregation as any
          ).toArray() as any;
        } catch (err) {
          throw new Error(`Error running aggregation: ${err}`);
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
      "Run a MongoDB aggregation operation on a collection and return results"
    );
  
    return nodeDefinition;
  }