const express = require('express')
const logger = require('morgan')
const session = require('express-session')

require('dotenv').config()
const cors = require('cors')
const { Server: HttpServer } = require('http')
const { Server: IOServer } = require('socket.io')

const routerfProductos = require('./Routes/productos.route.js')
const initSocket = require('./utils/initSocket.js')
const { authRouter } = require('./Routes/auth.routes.js')

//______________________________ mongo para session ______________________________ //
const MongoStore = require('connect-mongo')
const advancedOptions = { useNewUrlParser: true, useUnifiedTopology: true }
//________________________________________________________________________________ //
const passport = require('passport')
const { initPassport } = require('./middlewares/passport.js')

//________________________________________________________________________________ //

const initServer = () => {    

    const app = express()
    const httpServer = new HttpServer(app)
    const io = new IOServer(httpServer)

    /////////////////////// configuracion de EJS /////////////////////////
    app.set('view engine', 'ejs')
    app.set('views', __dirname + '/public/views/pages') 

    //////////////  middleware  ///////////////////////
    // app.use(session({
    //     secret: process.env.SECRET_KEY_COOKIE,
    //     cookie: {
    //         httpOnly: false,
    //         secure: false,
    //         maxAge: 1000 * 60 * 60 * 24
    //     },
    //     rolling: true,
    //     resave: true,
    //     saveUninitialized: false
    // }))

    app.use(session({
        secret: process.env.SECRET_KEY_SESSION,    
        store: MongoStore.create({
            mongoUrl: process.env.MONGO_URL_CONNECT,
            mongoOptions: advancedOptions,
        }),
        resave: true, 
        saveUninitialized: true
    }))

    initPassport()
    app.use(passport.initialize())
    app.use(passport.session())

    app.use(express.static('public'))
    app.use(express.static('src/images'))
    app.use(express.json())
    app.use(express.urlencoded({ extended: true }))
    app.use(cors())
    app.use(logger('dev'))
        
    ////////////////////// Rutas //////////////////////////////    
    app.use('/api/productos', routerfProductos)
    app.use('/api/auth', authRouter)
    
    ////////////////////////////////////////////////////////

    // app.get('/historial', (req, res) => {
    //     console.log('paso por historial...')
    //     res.render('historial')
    //     //res.send('Hello World!')
    // })


//_____________________________________________ socket.io _____________________________________ //   
    initSocket(io)
//______________________________________________________________________________________________//

    return {
        listen: port => new Promise((res, rej)=>{
            const server = httpServer.listen(port, () => {
                res(server)
            })
            server.on('error', err => rej(err))
        })
    }
}

module.exports = initServer