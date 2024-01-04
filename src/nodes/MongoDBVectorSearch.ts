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
  
  export type MongoDBVectorSearch = ChartNode<
    "mongoDBVectorSearch",
    MongoDBVectorSearchData
  >;
  
  export type MongoDBVectorSearchData = {
    database: string;
    useDatabaseInput?: boolean;
  
    collection: string;
    useCollectionInput?: boolean;

    index: string;
    useIndexInput?: boolean;

    path: string;
    usePathInput?: boolean;

    numCandidates: number;
    useNumCandidatesInput?: boolean;

    limit: number;
    useLimitInput?: boolean;
  
    filter?: Record<string, unknown>;
  };
  
  export default function (rivet: typeof Rivet) {
    const nodeImpl: PluginNodeImpl<MongoDBVectorSearch> = {
      create(): MongoDBVectorSearch {
        const node: MongoDBVectorSearch = {
          id: rivet.newId<NodeId>(),
          data: {
            database: '',
            collection: '',
            index: '',
            path: '',
            numCandidates: 10,
            limit: 5,
            filter: undefined
          },
          title: "Search MongoDB for closest vectors with vector search",
          type: "mongoDBVectorSearch",
          visualData: {
            x: 0,
            y: 0,
            width: 200,
          },
        };
        return node;
      },
      getInputDefinitions(
        data: MongoDBVectorSearchData,
        _connections: NodeConnection[],
        _nodes: Record<NodeId, ChartNode>,
        _project: Project
      ): NodeInputDefinition[] {
        const inputs: NodeInputDefinition[] = [];
  
        inputs.push({
          id: 'queryVector' as PortId,
          title: 'Query Vector',
          dataType: 'vector',
          required: true,
        });

        inputs.push({
          id: 'filter' as PortId,
          title: 'Filter',
          dataType: 'object',
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
        if (data.useIndexInput) {
          inputs.push({
            id: 'index' as PortId,
            title: 'Index',
            dataType: 'string',
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

        if (data.useNumCandidatesInput) {
          inputs.push({
            id: 'numCandidates' as PortId,
            title: 'Number of Candidates',
            dataType: 'number',
            required: true,
          });
        }

        if (data.useLimitInput) {
          inputs.push({
            id: 'limit' as PortId,
            title: 'Limit',
            dataType: 'number',
            required: true,
          });
        }
  
        return inputs;
      },
  
      getOutputDefinitions(
        _data: MongoDBVectorSearchData,
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
          contextMenuTitle: "MongoDB Vector Search",
          group: "MongoDB",
          infoBoxBody:
            "This a node that takes a mongo db vector searches for similar vectors with Search.",
          infoBoxTitle: "Run Mongo DB vector search with Search",
        };
      },
  
      getEditors(
        _data: MongoDBVectorSearchData
      ): EditorDefinition<MongoDBVectorSearch>[] {
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
            type: 'string',
            label: 'Index',
            dataKey: 'index',
            useInputToggleDataKey: 'useIndexInput',
          },
          {
            type: 'string',
            label: 'Path',
            dataKey: 'path',
            useInputToggleDataKey: 'usePathInput',
          },
          {
            type: 'number',
            label: 'Number of Candidates',
            dataKey: 'numCandidates',
            useInputToggleDataKey: 'useNumCandidatesInput',
          },
          {
            type: 'number',
            label: 'Limit',
            dataKey: 'limit',
            useInputToggleDataKey: 'useLimitInput',
          },

        ];
      },
  
      getBody(
        data: MongoDBVectorSearchData
      ): string | NodeBodySpec | NodeBodySpec[] | undefined {
        return rivet.dedent`
        ${data.useDatabaseInput ? '(Database using input)' : 'Database: ' + data.database}
        ${data.useCollectionInput ? '(Collection using input)' : 'Collection: ' + data.collection}
        ${data.useIndexInput ? '(Index using input)' : 'Index: ' + data.index}
        ${data.usePathInput ? '(Path using input)' : 'Path: ' + data.path}
        ${data.useNumCandidatesInput ? '(Number of Candidates using input)' : 'Number of Candidates: ' + data.numCandidates}
        ${data.useLimitInput ? '(limit using input)' : 'Limit: ' + data.limit}
        `;
      },
  
      async process(
        data: MongoDBVectorSearchData,
        inputData: Inputs,
        context: InternalProcessContext
      ): Promise<Outputs> {
        const { MongoClient } = await import("../nodeEntry");
  
        const uri = context.settings.pluginSettings?.rivetPluginMongodb?.mongoDBConnectionString as string | undefined;
  
        if (!uri) {
          throw new Error("No MongoDB connection string provided");
        }
  
        if (inputData['queryVector' as PortId]?.type !== 'vector') {
          throw new Error(`Expected vector input, got ${inputData['queryVector' as PortId]?.type}`);
        }

        if(data.numCandidates > 10000){
          throw new Error(`numCandidates must be between limit and 10000`);
        }

        if(data.numCandidates < data.limit){
          throw new Error('numCandidates must be greater than or equal to limit')
        }
  
        const client = new MongoClient(uri);
        let results: Record<string, unknown>;
        try {
          await client.connect();

          console.log("Input Data",inputData)
  
          const database = data.useDatabaseInput ? inputData['database' as PortId]?.value as string : data.database as string;
          const collection = data.useCollectionInput ? inputData['collection' as PortId]?.value as string : data.collection as string;
          const index = data.useIndexInput ? inputData['index' as PortId]?.value as string : data.index as string;
          const path = data.usePathInput ? inputData['path' as PortId]?.value as string : data.path as string;
          const queryVector = inputData['queryVector' as PortId]?.value as number[];
          const numCandidates = data.useNumCandidatesInput ? inputData['numCandidates' as PortId]?.value as number : data.numCandidates as number;
          const limit = data.useLimitInput ? inputData['limit' as PortId]?.value as number : data.limit as number;
          const filter = inputData['filter' as PortId]?.value as string;

          console.log('filter', filter)

          results = await client.db(database).collection(collection).aggregate([{
            "$vectorSearch": {
              "index": index,
              "path": path,
              "queryVector": queryVector,
              "numCandidates": numCandidates,
              "limit": limit,
              "filter": filter
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
      "Run Mongo DB vector search with Search"
    );
  
    return nodeDefinition;
  }