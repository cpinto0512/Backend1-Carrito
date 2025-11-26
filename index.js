const server = require("./src/app")

const PORT = 3000

server.listen(PORT, () => {
  console.log(`Example app listening on port http://localhost:${PORT}`)
})