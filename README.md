<h1 align="center"><img src="https://rivet.ironcladapp.com/img/logo-banner-wide.png" alt="Rivet Logo"></h1>

# Rivet MongoDB Plugin

This plugin provides 3 new nodes for interacting with MongoDB for Rivet.

- MongoDBStore - Store a vector in MongoDB with associated metadata

- MongoDBVectorKNN - Find the K nearest neighbors of a vector in MongoDB ($search - knnBeta)

- MongoDBCollectionSearch - Select a MongoDB collection of documents


# Installation

Navigate to the plugins section of the project tab and click the + button

Search and install the `rivet-mongodb-plugin`

Make sure to add your database connection string in settings

For the MongoDBVectorKNN node to work you must create a index. Documentation on how to create an index can be found here: https://www.mongodb.com/docs/atlas/atlas-search/field-types/knn-vector/#std-label-bson-data-types-knn-vector

# Plugin Cookbook

Check out the cookbook for examples of how to use the nodes in this plugin.

# Roadmap

- [ ] Add search filter support for the MongoDBCollectionSearch node
- [ ] Improve the MongoDBCollectionSearch load performance and avoid loading the entire collection into memory
- [ ] Optimize client connections to avoid reconnecting for each request
- [ ] Add support for MongoDB Vector Search ($vectorSearch)
