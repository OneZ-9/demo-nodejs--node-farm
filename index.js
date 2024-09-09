import * as fs from "node:fs";
import * as http from "node:http";
import * as url from "node:url";
import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import slugify from "slugify";

import replaceTemplate from "./modules/replaceTemplate.js";

const __dirname = dirname(fileURLToPath(import.meta.url));

/*
/////////////////////////////////
// Files
// Blocking, synchronous way
// Read from file
const textIn = fs.readFileSync("./txt/input.txt", "utf-8");
console.log(textIn);
// Write to file
const textOut = `This is what we know about the avocado: ${textIn}.\nCreated on: ${Date.now()}`;
fs.writeFileSync("./txt/output.txt", textOut);
console.log("File written!");


// Non-blocking, asynchronous way
fs.readFile("./txt/start.txt", "utf-8", (err, data1) => {
  if (err) return console.log("ERROR!");

  fs.readFile(`./txt/${data1}.txt`, "utf-8", (err, data2) => {
    console.log(data2);
    fs.readFile("./txt/append.txt", "utf-8", (err, data3) => {
      console.log(data3);

      fs.writeFile("./txt/final.txt", `${data2}\n${data3}`, "utf-8", (err) => {
        console.log("Your file has been written 😀");
      });
    });
  });
});
console.log("Reading text...");
*/

/////////////////////////////////
// Server

// Top level code only executes once, so we can do synchronous operations
// fs.readFile("./dev-data/data.json");
const tempOverview = fs.readFileSync(
  `${__dirname}/templates/template-overview.html`,
  "utf-8"
);
const tempCard = fs.readFileSync(
  `${__dirname}/templates/template-card.html`,
  "utf-8"
);
const tempProduct = fs.readFileSync(
  `${__dirname}/templates/template-product.html`,
  "utf-8"
);
const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const dataObj = JSON.parse(data);

const slugs = dataObj.map((el) => slugify(el.productName, { lower: true }));
// console.log(slugs);

const server = http.createServer((req, res) => {
  //   console.log(req.url);
  //   console.log(url.parse(req.url, true));

  const { query, pathname } = url.parse(req.url, true);

  // Overview page
  if (pathname === "/" || pathname === "/overview") {
    res.writeHead(200, { "Content-type": "text/html" });
    const cardsHtml = dataObj
      .map((el) => replaceTemplate(tempCard, el))
      .join("");
    const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);

    res.end(output);

    // Product page
  } else if (pathname === "/product") {
    const product = dataObj[query.id];
    res.writeHead(200, { "Content-type": "text/html" });
    const output = replaceTemplate(tempProduct, product);

    res.end(output);

    // Api page
  } else if (pathname === "/api") {
    res.writeHead(200, { "Content-type": "application/json" });
    res.end(data);

    // Not found
  } else {
    res.writeHead(404, {
      "Content-type": "text/html",
      "my-own-header": "hello world",
    });
    res.end("<h1>Page not found!</h1>");
  }
});

server.listen(8000, "127.0.0.1", () => {
  console.log("Listening to requests on port 8000");
});
