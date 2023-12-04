const express = require("express");
const app = express();

app.use(express.json());

const port = 8080;

app.get("/", function (req, res) {
  res.send("Hello World!");
});

app.post("/echo", function (req, res) {
  console.log(`request = ${JSON.stringify(req.body, null, 4)}`);
  res.send(req.body);
});

app.listen(port, function () {
  console.log(`app listening on port ${port}!`);
});
