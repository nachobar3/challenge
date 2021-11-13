const Hapi = require('@hapi/hapi')
const mongoose = require('mongoose')


mongoose
  .connect('mongodb://localhost/hapidb', {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => console.log('mongo db connected'))
  .catch(err => console.log(err))

//create pair model
const Pair = mongoose.model('Pair', { text: String })

const init = async () => {
  //Init server
  const server = new Hapi.Server({
    port: 8000,
    host: 'localhost'
  })

  await server.register(require('inert'))
  await server.register(require('@hapi/vision'))

  server.route({
    method: 'GET',
    path: '/',
    handler: (req, h) => h.view('index', { name: 'Damianek' })
  })

  //Get pair route
  server.route({
    method: 'GET',
    path: '/pairs',
    handler: async (req, h) => {
      let pairs = await Pair.find((err, pairs) => {
        console.log(pairs)
      })
      return h.view('pairs', {
        pairs: pairs
      })
    }

    //   h.view('pairs', {
    //     pairs: [
    //       { text: 'pair one' },
    //       { text: 'pair two' },
    //       { text: 'pair three' }
    //     ]
    //   })
  })

  //Post pair route
  server.route({
    method: 'POST',
    path: '/pairs',
    handler: async (req, h) => {
      let text = req.payload.text
      let newPair = new Pair({ text: text })
      await newPair.save((err, pair) => {
        if (err) return console.log(err)
      })

      return h.redirect().location('pairs')
    }
  })

  server.route({
    method: 'GET',
    path: '/user/{name}',
    handler: (req, h) => {
      return `Hello world, ${req.params.name}`
    }
  })


  server.views({
    engines: {
      html: require('handlebars')
    },
    relativeTo: __dirname,
    path: 'views'
  })

  await server.start()

  console.log(`Server is running on ${server.info.uri}`)
}

init().catch(err => console.log(err))