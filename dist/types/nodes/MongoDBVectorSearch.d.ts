import type { ChartNode, Rivet } from "@ironclad/rivet-core";
export type MongoDBVectorSearch = ChartNode<"mongoDBVectorSearch", MongoDBVectorSearchData>;
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
export default function (rivet: typeof Rivet): import("@ironclad/rivet-core").PluginNodeDefinition<MongoDBVectorSearch>;
