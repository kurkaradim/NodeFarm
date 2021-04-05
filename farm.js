const fs = require("fs");
const http = require("http");
const slugify = require("slugify");
const replaceTemplate = require("./modules/replaceTemplate");

const data = fs.readFileSync(`${__dirname}/dev-data/data.json`, "utf-8");
const tempOverview = fs.readFileSync(`${__dirname}/templates/overview.html`, "utf-8");
const tempCard = fs.readFileSync(`${__dirname}/templates/template-card.html`, "utf-8");
const tempProduct = fs.readFileSync(`${__dirname}/templates/product.html`, "utf-8");

const productData = JSON.parse(data);
productData.map(el => (el["slug"] = slugify(el.productName, { lower: true })));

const server = http.createServer((req, res) => {
    const baseURL = `http://${req.headers.host}`;
    const requestURL = new URL(req.url, baseURL);
    const pathName = requestURL.pathname;

    if (pathName === "/" || pathName === "/overview") {
        res.writeHead(200, {
            "Content-type": "text/html"
        });
        const cardsHtml = productData.map(el => replaceTemplate(tempCard, el)).join("");
        const output = tempOverview.replace("{%PRODUCT_CARDS%}", cardsHtml);
        res.end(output)
    } else if (pathName.startsWith('/product')) {
        const prod = productData.find(el => el.slug === requestURL.pathname.split("/")[2]);
        if (!prod) {
            res.writeHead(404, {
                "Content-Type": "text/html"
            });
            res.end("<h1>Page not found.</h1>")
        } else {
            const output = replaceTemplate(tempProduct, prod);
            res.writeHead(200, {
                "Content-type": "text/html"
            });
            res.end(output)
        }

    } else if (pathName === "/api") {
        res.writeHead("200", { "Content-type": "application/json" })
        res.end(data);
    } else {
        res.writeHead(404, {
            "Content-Type": "text/html"
        });
        res.end("<h1>Page not found.</h1>")
    }
});

server.listen(process.env.PORT || 3000, () => {
    console.log("Server initialised.");
});