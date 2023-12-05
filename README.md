# Backend Engineering Challenge Solution by Sohrab Hassibi (sohrabh@stanford.edu)

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

## Searh API endpoint

There is one API endpoint implemented for searching courses

### POST

`<root URL>`/search

The application is hosted on AWS at URL:

```
http://ec2-18-116-82-234.us-east-2.compute.amazonaws.com:8080/search
```

```
curl --location 'http://ec2-18-116-82-234.us-east-2.compute.amazonaws.com:8080/search' \
--header 'Content-Type: application/json' \
--data '{
    "phrase":"winter",
    "maxHits": 3,
    "type": "naive"
}'
```

You are writing a web API for CourseTime, the next iteration of course exploration at Drofnats Wizarding University, and one important feature is searching for courses. You're going to write the API to search for courses!

The API should be called over an HTTP request. It should return JSON representing an ordered list of search results. The exact schema is left to your discretion; you are free (and encouraged) to borrow the input data format in whole or part.

The search functionality has one key requirement: a text search.

You are free to use any framework or language to implement this. [Express](https://expressjs.com/) in JavaScript and [Flask](https://flask.palletsprojects.com/en/2.2.x/) in Python are two options, but there are many good choices and we have no preference.

**We expect this will take you about 1.5 - 2.5 hours.** If you've spent longer than that and are not finished, feel free to stop! Done is better than perfect. Your time is valuable and we want to respect that. If you don't finish the basic functionality, please tell us approximately how long you spent and give us a broad outline of what your next steps would have been.

It's open-ended, but not too long once you get a handle on the problem. For reference, one of our solutions in JavaScript is about 100 lines long (not including the hardcoded course data).

### Text Search

The search API should take a textual query: the user's search string. Based on this string, your backend will need to rank the relevance of various candidate results.

It is completely not expected to do anything fancy (e.g. Google-style negative matches or "multi-word quotes") with your query parsing. (If you want to, we won't stop you!)

You are deliberately left with a large amount of discretion for how to do this, but fret not! Your implementation need not be complicated, efficient, or functionally perfect. What's more important is you come up with a reasonable attempt to address the problem, and have a clear thought process and well-articulated tradeoffs. (I.e. in your README, you should discuss known shortfalls with your approach.) Something using such simple primitives as string splits and string contains is fine!

Some things to think about:

- How should titles versus descriptions be handled, for relevancy matching?
- Should completely irrelevant results (with no overlap with the search query) be included? What constitutes "completely irrelevant"?
- If the user searches directly for a course code, how should that case be handled? (As a user, what would you expect in that case?)

(It is entirely okay not to handle some or most of these cases! That might even give you a tradeoff you can discuss, e.g. is it easier at the cost of a more brittle search user experience?)

### Input Data

Course data is provided for you in the [`backend-course-data.json`](https://github.com/Stanford-Carta/eng-challenge/blob/main/backend-course-data.json) file in this repository. Don't worry about a database or anything; feel free to read from this file into memory, hardcode the data, or otherwise do whatever's easiest to work with this data.

That file is a JSON array of course objects. The course objects have the following fields:

- `id`: Unique integer ID
- `title`: Course title (nonnullable)
- `description`: Course description (nullable)
- `course_code`: Course catalog listing code (nonnullable)
- `requirements`: 0 or more requirements (enumerated strings) that this course fulfills
- `units`: Integer array of length 2 with `units[1] >= units[0]`: the number of units you can take this course for. If `units[0] == units[1]`, then the course is not offered for variable units. Otherwise, students can take the course for any of `units[0], units[0] + 1, units[0] + 2, ..., units[1] - 1, units[1]` units.
- `quarters`: Array of length at-most 4 (enumerated strings): the quarters in which this course is offered

## What We Care About

Completing all or part of this challenge is a great way to demonstrate a very practically-aligned understanding of not just implementation, but also higher-level design of a web API and web-based system. We also care about readability and maintainability: can someone else read your code, and would you be able to test your code? When there are ambiguities or room for design choices, think about the broader impact. What might be useful for another developer? What might be useful for an end user?

## Don't Worry About...

**Edge cases not covered in the provided dataset.** Don't worry about too many edge cases; focus on getting something which works in the provided common cases.

**A database.** Don't worry about a database. Feel free to read the input course data from a file into memory, or to hardcode it directly in source code.

**Algorithmic complexity.** This is not a LeetCode algorithms challenge. Don't worry about an asymptotically optimal implementation. Naive algorithms are totally fine, as long as they make sense.

## Please don't spend too much time!

To reiterate: this problem mirrors a (more complex) variant that Carta has genuinely faced -- this means that even in the simplified version, there is plenty of complexity which you could easily spend many hours addressing. Please don't! Your time is valuable, and we've tried to focus this problem and our expectations on what we think is most important for our recruiting (and which we think poses an interesting challenge).

If you don't finish in the projected time range, it's okay to stop and submit what you have, describing what your next steps would have been!

## What We Want

- Source code for a runnable program
  - The web server should expose a HTTP REST API endpoint to search for courses
  - The search endpoint should take a textual query parameter for text search of some kind. You have discretion over your exact search algorithm, as long as it is conceptually reasonable. It need not be complicated.
  - You have discretion over the response format. Feel free to use the same format as the stored data.
- A README containing:
  - Instructions to compile (if needed) and run the program
  - A brief description of major design/architectural decisions (e.g. how you structured your search endpoint, your algorithm for ordering search results, etc). This need not be long; pick about 2 important or nontrivial ones to talk about.
  - Rationale for the above design decisions ("I thought it would be easiest to get working quickly" or "I'm most comfortable with it" are valid contributing reasons), and notable tradeoffs.
  - (Optional) Anything else you'd like us to know about your project, or feedback on the challenge

Deliverables should be submitted as specified in the [eng-challenge README](https://github.com/Stanford-Carta/eng-challenge/blob/main/README.md).

Good luck, thank you for considering joining Carta, and we hope to hear from you soon!
