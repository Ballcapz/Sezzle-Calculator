const express = require('express')
const dotenv = require('dotenv')
const cors = require('cors')
const connectDB = require('./config/db')

dotenv.config({ path: __dirname + '/.env' })

connectDB();
const Expression = require('./models/expression')

const app = express()
const http = require('http').Server(app)
const io = require('socket.io')(http)
const path = require('path')
const bodyParser = require('body-parser')

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(cors())
app.use(express.static(path.join(__dirname, '/../dist/')))


let data = []


io.on('connection', socket => {

    getData()

    socket.on('evaluate', exp => {
        if (exp) {
            data.unshift(exp)

            addExpression(exp)
        }
        if (data.length > 10) {
            data.pop()
        }
        io.emit('evaluate', data)
    })
    io.emit('evaluate', data)
})

const getData = async () => {
    try {
        let res
        await Expression.find({}, 'expression', { sort: '-date' }, function (err, docs) {
            res = docs
        }).limit(10)

        for (let i = 0; i < res.length && i < 10; i++) {
            data[i] = res[i].expression
        }

    } catch (err) {
        console.log(`no data to be found ${err}`)
    }
}

const addExpression = async (exp) => {
    let expression = new Expression({
        expression: exp
    })

    try {
        await Expression.create(expression)
    } catch (err) {
        console.error(`error adding expression ${expression}... ${err}`)
    }
}


const port = process.env.PORT || 3000;

http.listen(port, () => console.log(`listening on port: ${port}`))
