NexGen Milestone 1
======
**NexGen** is a web application for browsing a MySQL schema in the form of automated ER diagrams.

## Usage
```
$ git clone http://jira.seng.uvic.ca:8051/scm/nex/milestone-1.git
$ npm install
$ npm start
```
Browse to http://localhost:3000 and begin using the application

## Development Guide

### Requirements
In order to run the API server, NodeJS V7.0.0 or higher is required with the '--harmony-async-await' flag. The 'npm start' command will use this flag by default.

### Run standalone server
* `npm start` — Will run a Koa server that will serve the files in the 'public' folder

### Live reload
Live reload is used in the development to speed up development time. CSS code is injected into the page, while JS/HTML code will refresh the page.

* `npm run dev` — Will run a BrowserSync server and open your browser to the dev page

### Directory Layout

The project is laid out as following:

```
.
├── /node_modules/            # 3rd-party libraries and utilities
├── /public/                  # Public folder served as the frontend application
│   ├── /js/                  # Collection of frontend JavaScript code
│   │   └── main.js           # Entry-point for frontend application logic
│   ├── /css/                 # Collection of frontend CSS scripts
│   │   ├── main.css          # Primary application style
│   │   └── reset.css         # Normalize.css reset
│   └── /index.html           # The static application page
├── /server/                  # Backend application code
│   └── /main.js              # Web-server
└── package.json              # The list of 3rd party libraries and utilities
```

### Linting
Run one or the combination of commands to perform code linting

* `npm test` — Lint all JavaScript source code
* `npm run test-client` — Lint the frontend code
* `npm run test-server` — Lint the backend code

## Contributors
* Chris Hampu
* Deon Liang
* Adam Leung
* Aman Bhayani

### Third party libraries
* GoJS
* Koa

### Tools Used
* Browser-Sync
* ESLint with AirBNB plugin
* Husky

## License 
* MIT