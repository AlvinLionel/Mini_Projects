const http = require('http');
const fs = require('fs');
const path = require('path');
const fsPromises = require('fs/promises');
const logEvents = require('./eventsLog');
const eventEmitter = require('events');

class Emitter extends eventEmitter { };
const myEmitter = new Emitter();
myEmitter.on('log', (msg, fileName) => logEvents(msg, fileName));

const PORT = process.env.PORT || 3500;

const serveFile = async (filePath, contentType, response) => {
    try {
        const rawData = await fsPromises.readFile(filePath, contentType.includes('image') ? null : 'utf8');
        const data = contentType === 'application/json' ? JSON.parse(rawData) : rawData;
        response.writeHead(
            filePath.includes('error.html') ? 404 : 200,
            { 'Content-Type': contentType });
        response.end(rawData);
    } catch (err) {
        console.error(err);
        myEmitter.emit('log', `${err.name}\t${err.message}`, 'errLog.txt');
        response.statusCode = 500;
        response.end();
    }
}

const server = http.createServer((req, res) => {
    console.log(`RequestURL: ${req.url}\tRequestMethod: ${req.method}`);
    myEmitter.emit('log', `${req.url}\t${req.method}`, 'reqLog.txt');

    const extension = path.extname(req.url);
    let contentType;
    switch (extension) {
        case '.css':
            contentType = 'text/css';
            break;
        case '.js':
            contentType = 'text/javascript';
            break;
        case '.json':
            contentType = 'application/json';
            break;
        case '.txt':
            contentType = 'text/plain';
            break;
        case '.jpg':
            contentType = 'image/jpeg';
            break;
        case '.png':
            contentType = 'image/png';
            break;
        case '.gif':
            contentType = 'image/gif';
            break;
        case '.svg':
            contentType = 'image/svg+xml';
            break;
        case '.ico':
            contentType = 'image/x-icon';
            break;
        case '.mp3':
            contentType = 'audio/mpeg';
            break;
        case '.wav':
            contentType = 'audio/wav';
            break;
        case '.mp4':
            contentType = 'video/mp4';
            break;
        case '.webm':
            contentType = 'video/webm';
            break;
        case '.pdf':
            contentType = 'application/pdf';
            break;
        case '.zip':
            contentType = 'application/zip';
            break;
        case '.csv':
            contentType = 'text/csv';
            break;
        default:
            contentType = 'text/html';
            break;
    }
    let filePath =
        contentType === 'text/html' && req.url === '/'
            ? path.join(__dirname, 'pages', 'index.html')
            : contentType === 'text/html' && req.url.slice(-1) === '/'
                ? path.join(__dirname, 'pages', 'index.html')
                : contentType === 'text/html'
                    ? path.join(__dirname, 'pages', req.url)
                    : path.join(__dirname, req.url);

    if (!extension && req.url.slice(-1) !== '/') filePath += '.html';

    const fileExists = fs.existsSync(filePath);
    if (fileExists) {
        serveFile(filePath, contentType, res);
    } else {
        switch (path.parse(filePath).base) {
            case 'old-page.html':
                res.writeHead(301, { 'location': 'new-page.html' });
                res.end();
                break;
            case 'www-page.html':
                res.writeHead(301, { 'location': '/' });
                res.end();
                break;
            default:
                serveFile(path.join(__dirname, 'pages', 'error.html'), 'text/html', res);
                break;
        }
    }
})
server.listen(PORT, () => { console.log(`Server is running on port ${PORT}`) })