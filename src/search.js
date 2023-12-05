const lunr = require("lunr");
const natural = require("natural");
const { removeStopwords, eng, fra } = require("stopword");
const _ = require("lodash");
const courses = require("../data/courses").courses;

var tokenizer = new natural.WordTokenizer();

// ---------------------------------------------------------------
// third party search library lunr
// see: https://www.npmjs.com/package/lunrh

// index the courses wit title, descriotion, course_code and quarters meta data
var idxLunr = lunr(function () {
  this.field("title");
  this.field("description");
  this.field("course_code");
  this.field("quarters");

  for (let i = 0; i < courses.length; i++) {
    const course = courses[i];
    this.add({
      title: course["title"],
      description: course["description"],
      course_code: course["course_code"],
      quarters: course["quarters"],
      id: course["id"],
    });
  }
});

// search based on lunr
module.exports.searchLunr = function (phrase) {
  // return best matching courses
  return idxLunr.search(phrase);
};

var getCleanStringForSearch = function (input) {
  let inputArray = tokenizer.tokenize(
    removeStopwords(input.split(/[ ,;.:!?]/)).join(" ")
  );
  let inputStemmedString = "";
  let inputStemmedArray = [];

  for (var j = 0; j < inputArray.length; j++) {
    const stemmed = natural.PorterStemmer.stem(inputArray[j]);
    inputStemmedArray.push(stemmed);
    inputStemmedString += stemmed + " ";
  }

  return [inputStemmedArray, inputStemmedString];
};

// take all courses, flatten them, tokenize and stem and then see matches

let idxNaive = [];
let naiveRef = {};

for (var i = 0; i < courses.length; i++) {
  // concatenate each course into one string
  const course = courses[i];
  const courseString =
    course["title"] +
    " " +
    course["description"] +
    " " +
    course["course_code"] +
    " " +
    course["quarters"].toString();

  const [courseStemmedArray, courseStemmedString] =
    getCleanStringForSearch(courseString);

  idxNaive.push(courseStemmedString);

  naiveRef[i] = course["id"];
}

// console.log("idxNaive = " + JSON.stringify(idxNaive, null, 4));
// console.log("naiveRef = " + JSON.stringify(naiveRef, null, 4));

module.exports.searchNaive = function (input) {
  // normalize the input
  const [phraseArray, phraseString] = getCleanStringForSearch(input.phrase);
  let scores = new Array(idxNaive.length).fill(0);
  for (var i = 0; i < idxNaive.length; i++) {
    const courseArray = idxNaive[i].split(" ");
    for (var k = 0; k < courseArray.length; k++) {
      for (var j = 0; j < phraseArray.length; j++) {

        const score = Number(phraseArray[j] == courseArray[k]);
        scores[i] += score;
      }
    }
    scores[i] /= courseArray.length;
  }

  // sort score and return top hits accordingly
  const indices = Array.from({ length: scores.length }, (_, index) => index);
  const sortedIndices = indices.sort((a, b) => scores[b] - scores[a]);

  const maxHits = input.hasOwnProperty("maxHits") ? input["maxHits"] : 100;
  const topHits = [];
  for (var i = 0; i < Math.min(maxHits, sortedIndices.length); i++) {
    const course = courses[sortedIndices[i]];
    topHits.push(
      _.merge(
        {
          score: scores[sortedIndices[i]],
          phraseStemmed: phraseArray.join(" "),
        },
        course
      )
    );
  }

  return topHits;
};

// return top hits <= maxHi, format output to include all course data
module.exports.search = function (input) {
  const phrase = input.phrase;
  const maxHits = input.hasOwnProperty("maxHits") ? input["maxHits"] : 100;
  const rawHits = idxLunr.search(phrase);

  const topHits = [];
  for (var i = 0; i < Math.min(maxHits, rawHits.length); i++) {
    const course = _.find(courses, function (course) {
      return course["id"] == rawHits[i]["ref"];
    });
    topHits.push(_.merge({ score: rawHits[i]["score"] }, course));
  }

  return topHits;
};
