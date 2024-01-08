import type { ChartNode, Rivet } from "@ironclad/rivet-core";
export type MongoDBAggregation = ChartNode<"mongoDBAggregation", MongoDBAggregationData>;
export type MongoDBAggregationData = {
    database: string;
    useDatabaseInput?: boolean;
    collection: string;
    useCollectionInput?: boolean;
    aggregation: string;
};
export default function (rivet: typeof Rivet): import("@ironclad/rivet-core").PluginNodeDefinition<MongoDBAggregation>;
