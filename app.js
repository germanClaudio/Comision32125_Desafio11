const initServer = require("./server");

const app = initServer()
const port = process.env.PORT || 4000

try {
    app.listen(port)
    console.log(`Escuchando en el puerto ${port}`)
} catch (error) {
    console.log(error)
}
