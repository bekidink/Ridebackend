import http from "http";
const { app } = require("./app");
const server = http.createServer(app);

// create server
server.listen(process.env.PORT, () => {
  console.log(`Server is connected with port ${process.env.PORT}`);
});
