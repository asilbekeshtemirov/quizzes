const http = require('http');
const fs = require('fs');
const path = require('path');
const { getQuizzes, createQuiz, getQuizById, updateQuiz, deleteQuiz } = require('./quiz');

const server = http.createServer((req, res) => {
    const urlParts = req.url.split('/');
    
    if (req.method === 'GET' && req.url === '/') {
        fs.readFile(path.join(__dirname, 'public/index.html'), (err, data) => {
            if (err) {
                console.error('Error reading index.html:', err);
                res.writeHead(500, { 'Content-Type': 'text/plain' });
                return res.end('Internal Server Error');
            }
            res.writeHead(200, { 'Content-Type': 'text/html' });
            res.end(data);
        });
    } else if (req.method === 'GET' && req.url === '/quizzes') {
        return getQuizzes(res);
    } else if (req.method === 'POST' && req.url === '/quizzes') {
        return createQuiz(req, res);
    } else if (req.method === 'GET' && urlParts[1] === 'quizzes' && urlParts[2]) {
        return getQuizById(res, urlParts[2]);
    } else if ((req.method === 'PUT' || req.method === 'PATCH') && urlParts[1] === 'quizzes' && urlParts[2]) {
        return updateQuiz(req, res, urlParts[2]);
    } else if (req.method === 'DELETE' && urlParts[1] === 'quizzes' && urlParts[2]) {
        return deleteQuiz(res, urlParts[2]);
    } else {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'Not Found' }));
    }
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));