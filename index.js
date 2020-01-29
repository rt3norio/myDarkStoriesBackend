var ds = require('nedb-promise');
var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');
var Nedb = require('nedb')
cardsDb = new Nedb({ filename: 'cards.db', autoload: true });
cards = ds.datastore.fromInstance(cardsDb);

// GraphQL schema
var schema = buildSchema(`
    type Query {
        getOneCard(filter: cardFilter): Card
    }

    input cardFilter {
        _id: ID
    }

    type Card {
        _id: ID
        name: String
        plot: String
        plotReveal: String
    }

    input inputCard {
        name: String!
        plot: String!
        plotReveal: String!
    }

    type Mutation{
        createCard(cardData: inputCard!): Card
        deleteCard(which: String): Boolean
    }

`);

var root = {
    getOneCard: (arg) => cards.findOne(arg),
    createCard: (arg) => cards.insert({...arg.cardData}),
    deleteCard: (arg) => cards.delete(arg),
};
// Create an express server and a GraphQL endpoint
var app = express();
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });
app.use('/graphql', express_graphql({
    schema: schema,
    rootValue: root,
    graphiql: true,
    customFormatErrorFn: error => ({
        message: error.message,
        locations: error.locations,
        stack: error.stack ? error.stack.split('\n') : [],
        path: error.path,
      })
}));
app.use('/', (req,res)=>{
    res.send('<h1>Micro-servico de Cartas</h1>');
});
const port = 8000
app.listen(process.env.PORT || port, () => console.log(`Microservico de cartas on ${process.env.IP}:${process.env.PORT}/graphql`));