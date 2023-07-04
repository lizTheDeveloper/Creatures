// HTTP Server
const HTTP = require("http");
const PATH = "public";
const FS = require("fs");
const routes = {
    "/": "/index.html"
};

function send404(res) {
    res.writeHead(404, {
        'content-type': "text/html"
    });
    res.end('<!DOCTYPE html> <html><head><title>404</title></head><body>404 - Not Found</body></html>');
}

const MIMES = {
    "html": "text/html"
};
function getMime(path) {
  let li = path.lastIndexOf('.') + 1;
  let ext = path.slice(li);
  return MIMES[ext] || "text/plain";
}

module.exports.server = HTTP.createServer(function(req, res) {
    let reqpath = req.url;

    if (routes.hasOwnProperty(reqpath)) {
        reqpath = routes[reqpath];
    }

    console.log(PATH + reqpath);

    FS.readFile(PATH + reqpath, function(err, data) {
        if (err) {
            send404(res);
            return;
        }

        res.writeHead(200, {
            'content-type': getMime(reqpath)
        });

        res.end(data);
    });
});

