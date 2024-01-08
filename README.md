[![All Contributors](https://img.shields.io/github/all-contributors/a-rothwell/rivet-plugin-mongodb?color=ee8449&style=flat-square)](#contributors)
<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

# Rivet MongoDB Plugin

This plugin provides 4 nodes for interacting with MongoDB for Rivet.

- MongoDBStore - Store a vector in MongoDB with associated metadata
- MongoDBAggregation - Perform an aggregation on a MongoDB collection
- MongoDBCollectionSearch - Select a MongoDB collection of documents
- MongoDBVectorSearch - Perform a vector search on a MongoDB collection ($vectorSearch)

# Installation

Navigate to the plugins tab and find the MongoDB plugin in the plugin list. Click Add. 

Make sure to add your database connection string in settings.

For the MongoDBVectorSearch node to work you must create a index. Documentation on how to create an index can be found here: https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-type/

Note that you will also need to include which fields you would also like to filter on in additional to the vector field.

Full docs on vector search can be found here:
https://www.mongodb.com/docs/atlas/atlas-vector-search/vector-search-stage/

# Plugin Cookbook

Check out the cookbook for examples of how to use the nodes in this plugin.

# Tutorials

https://www.mongodb.com/developer/products/atlas/atlas-rivet-graph-ai-integ/

# Roadmap

- [ ] Add search filter support for the MongoDBCollectionSearch node
- [ ] Improve the MongoDBCollectionSearch load performance and avoid loading the entire collection into memory
- [ ] Optimize client connections to avoid reconnecting for each request

# Changes from 0.0.2 to 0.0.3

- MongoDBVectorKNN deprecated and replaced with MongoDBVectorSearch. See the installation section above for instructions on how to setup a new index for MongoDBVectorSearch.

## Contributors

Thanks goes to these wonderful people ([emoji key](https://allcontributors.org/docs/en/emoji-key)):

<!-- ALL-CONTRIBUTORS-LIST:START - Do not remove or modify this section -->
<!-- prettier-ignore-start -->
<!-- markdownlint-disable -->

<!-- markdownlint-restore -->
<!-- prettier-ignore-end -->

<!-- ALL-CONTRIBUTORS-LIST:END -->

This project follows the [all-contributors](https://github.com/all-contributors/all-contributors) specification. Contributions of any kind are welcome!

