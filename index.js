var express = require('express');
var express_graphql = require('express-graphql');
var { buildSchema } = require('graphql');

const mongoose = require('mongoose');
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
const Card = mongoose.model('Card', { title: String, plot: String, plotReveal: String });

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
        title: String
        plot: String
        plotReveal: String
    }

    input inputCard {
        title: String!
        plot: String!
        plotReveal: String!
    }

    type Mutation{
        createCard(cardData: inputCard!): Card
    }

`);

const getRandom = async () => {
    const count = await Card.count().exec()
    var random = Math.floor(Math.random() * count)
    const card = await Card.findOne().skip(random).exec()
    return card;
}
var root = {
    getOneCard: async () => getRandom(),
    createCard: (arg) => new Card(arg.cardData).save(),
};
// Create an express server and a GraphQL endpoint
var app = express();
app.use(function (req, res, next) {
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
app.use('/', (req, res) => {
    res.send('<h1>Micro-servico de Cartas</h1>');
});
const port = 8000
app.listen(process.env.PORT || port, () => console.log(`Microservico de cartas on ${process.env.IP}:${process.env.PORT}/graphql`));