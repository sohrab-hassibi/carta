const search = require("./search");

const express = require("express");
const app = express();

app.use(express.json());

// port to listen on
const PORT = 8080;

/*
JSON input format in request body:
{
    "phrase":"<search phrase/input>",
    "maxHits": <max number of hits returned>,
    "type": <"naive" or "lunr" (default)>
}
For example:
{
    "phrase":"magic",
    "maxHits": 2
}
*/
app.post("/search", function (req, res) {
  // must have at least "phrase" in input json, otherwise return 400 status
  if (!req.body.hasOwnProperty("phrase")) {
    return res.status(400).json({
      error: "Bad Request",
      message:
        "The request could not be understood due to incorrect input format or syntax ('phrase' not specified in input json).",
    });
  }

  let topHits;
  if (req.body.hasOwnProperty("type") && req.body.type == "naive") {
    topHits = search.searchNaive(req.body);
  } else {
    topHits = search.search(req.body);
  }
  return res.status(200).send({
    input: req.body,
    output: topHits
  });
});

// listen on port for http traffic
app.listen(PORT, function () {
  console.log(`app listening on port ${PORT}!`);
});
