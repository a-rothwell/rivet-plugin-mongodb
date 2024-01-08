import type { ChartNode, Rivet } from "@ironclad/rivet-core";
export type MongoDBVectorKNN = ChartNode<"mongoDBVectorKNN", MongoDBVectorKNNData>;
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
export default function (rivet: typeof Rivet): import("@ironclad/rivet-core").PluginNodeDefinition<MongoDBVectorKNN>;
