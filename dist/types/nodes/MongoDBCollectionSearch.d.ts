import type { ChartNode, Rivet } from "@ironclad/rivet-core";
export type MongoDBCollectionSearch = ChartNode<"mongoDBCollectionSearch", MongoDBCollectionSearchData>;
export type MongoDBCollectionSearchData = {
    database: string;
    useDatabaseInput?: boolean;
    collection: string;
    useCollectionInput?: boolean;
};
export default function (rivet: typeof Rivet): import("@ironclad/rivet-core").PluginNodeDefinition<MongoDBCollectionSearch>;
