import type { ChartNode, Rivet } from "@ironclad/rivet-core";
export type MongoDBStoreNode = ChartNode<"mongoDBStore", MongoDBStoreNodeData>;
export type MongoDBStoreNodeData = {
    database: string;
    useDatabaseInput?: boolean;
    collection: string;
    useCollectionInput?: boolean;
    path: string;
    usePathInput?: boolean;
};
export default function (rivet: typeof Rivet): import("@ironclad/rivet-core").PluginNodeDefinition<MongoDBStoreNode>;
