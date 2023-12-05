# Backend Engineering Challenge Solution by [Sohrab Hassibi](mailto:sohrabh@stanford.edu)

## Overview

This challenge solution is implemented using the [`Express Node.js web application framework`](https://expressjs.com/).

## Instructions to compile

The code is accessible on github at https://github.com/sohrab-hassibi/carta. To run, first clone the repository:

```js
$ git clone https://github.com/sohrab-hassibi/carta.git
```

and then install using:

```js
$ cd carta
$ npm install
```

and finally:

```js
$ node src/app.js
```

## Search API endpoint

There is one API endpoint implemented for searching courses

### POST

`<Base URL>:8080`/search

**Body raw JSON**

|       Key | Required | Value type | Description                                                                                                                                                                                                        |
| --------: | :------: | :--------: | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
|  `phrase` | required |   string   | The user input search string for courses.                                                                                                                                                                          |
| `maxHits` | optional |    int     | The maximum number of matched courses returned per input search string `phrase`. <br/><br/> Default is `100`.                                                                                                      |
|    `type` | optional |   string   | Choice of search algorithm. Options are `lunr` (default) or `naive`. The former uses the node library [`lunr`](https://www.npmjs.com/package/lunr) while the latter is a native implementation described later on. |

**Example**

**_cURL_**

```
curl --location 'http://ec2-18-116-82-234.us-east-2.compute.amazonaws.com:8080/search' \
--header 'Content-Type: application/json' \
--data '{
   "phrase":"potion",
   "maxHits": 3,
   "type": "naive"
}'
```

**_Request_**

```
{
    "phrase":"potion",
    "maxHits": 3,
    "type": "naive"
}
```

**_Response_**

```
{
    "input": {
        "phrase": "potion",
        "maxHits": 3,
        "type": "naive"
    },
    "output": [
        {
            "score": 0.2727272727272727,
            "phraseStemmed": "potion",
            "id": 7,
            "title": "Potion Tasting",
            "description": "Sampling a variety of delicious and elegant potions.",
            "course_code": "POTIONS 60D",
            "requirements": [],
            "units": [
                1,
                1
            ],
            "quarters": [
                "spring"
            ]
        },
        {
            "score": 0.1111111111111111,
            "phraseStemmed": "potion",
            "id": 4,
            "title": "Advanced Potioncrafting",
            "description": "Brewing, mixing, and stirring effective and elegant magical concoctions beyond the basics. Prerequisites: POTIONS 101.",
            "course_code": "POTIONS 201",
            "requirements": [
                "SpiritMixingAnalysis"
            ],
            "units": [
                4,
                4
            ],
            "quarters": [
                "winter"
            ]
        },
        {
            "score": 0.0625,
            "phraseStemmed": "potion",
            "id": 3,
            "title": "Intro to Potioncrafting",
            "description": "Brewing, mixing, and stirring effective magical concoctions. No prerequisites.",
            "course_code": "POTIONS 101",
            "requirements": [
                "SpiritMixingAnalysis"
            ],
            "units": [
                4,
                4
            ],
            "quarters": [
                "autumn",
                "winter",
                "spring"
            ]
        }
    ]
}
```

## Hosted endpoint

If you run `node src/app.js` locally you can access the API using:

```
POST http://localhost::8080/search
```

The application is also hosted on AWS, so that the API is accessible via:

```
POST http://ec2-18-116-82-234.us-east-2.compute.amazonaws.com:8080/search
```

## Description

I've implemented the course search API in two ways. The first method is based on an existing search package called [Lunr](https://www.npmjs.com/package/lunr). The second method is my own (naive) implemention. The search method is selected by specifying the `type` keyword in the input JSON of the `POST /search` request as shown earlier.

### Lunr-based implementation

Lunr provides out-of-the-box APIs for indexing searchable data (courses) and search. In my code, the courses are indexed as follows:

```
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
```

The search is then carried out using:

```
const rawHits = idxLunr.search(phrase);
```

My code then takes the `rawHits` above and returns the top hits as the response while inserting the score for each course (limited to `maxHits` as specified in the input JSON of the request).

### Native implementation

I've also implemented my own search functionality as I thought perhaps using [Lunr](https://www.npmjs.com/package/lunr) was kind of cheating :-)

My implementation indexes all searchable data (courses) in the following way:

- Flatten every course JSON as one big string after removing all keys (`title`, `description`, etc.)
- Remove all stop words from string using [`stopword`](https://www.npmjs.com/package/stopword)
- Tokenize string using [`natural.WordTokenizer()`](https://www.npmjs.com/package/natural)
- Stem every word in the string using [`natural.PorterStemmer`](https://www.npmjs.com/package/natural)

The result strings for all courses is saved in a JSON array.

Now when the search phrase comes in, we do the same transformations to that search phrase (stop word removal, tokenization, and stemming). Then we do a double loop to see if there's a perfect match or not, and for every perfect match we increase the hit score for the courresponding course by `1`. At the end, we normalize the score by the length of the course string so that in case of ties we favor courses with less string length. See snippet below:

```
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
```

Finally, at the end we sort/rank the courses based on the scores and return the top `maxHits` courses along with the score values.
