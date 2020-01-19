const mongoose = require('mongoose')

const expressionSchema = new mongoose.Schema({
    expression: {
        type: String
    },
    date: {
        type: Date,
        default: Date.now
    }
});


module.exports = mongoose.model('Expression', expressionSchema)
