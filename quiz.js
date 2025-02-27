const fs = require('fs');
const path = require('path');
const DATA_FILE = path.join(__dirname, 'db/quizzes.json');

function getQuizzes(res) {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            console.error('Error reading quizzes.json:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(data);
    });
}

function createQuiz(req, res) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try {
            let newQuiz = JSON.parse(body);
            fs.readFile(DATA_FILE, (err, data) => {
                let quizzes = [];
                if (!err) {
                    try {
                        quizzes = JSON.parse(data);
                    } catch (parseErr) {
                        console.error('Error parsing quizzes.json:', parseErr);
                        quizzes = [];
                    }
                }
                
                newQuiz.id = Date.now();
                quizzes.push(newQuiz);
                
                fs.writeFile(DATA_FILE, JSON.stringify(quizzes, null, 2), err => {
                    if (err) {
                        console.error('Error writing to quizzes.json:', err);
                        res.writeHead(500, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Failed to save quiz' }));
                    }
                    res.writeHead(201, { 'Content-Type': 'application/json' });
                    res.end(JSON.stringify(newQuiz));
                });
            });
        } catch (err) {
            console.error('Error parsing request body:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
        }
    });
}

function getQuizById(res, id) {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            console.error('Error reading quizzes.json:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        
        try {
            const quizzes = JSON.parse(data);
            const quiz = quizzes.find(q => q.id == id);
            
            if (!quiz) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Quiz not found' }));
            }
            
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify(quiz));
        } catch (parseErr) {
            console.error('Error parsing quizzes.json:', parseErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Error parsing quiz data' }));
        }
    });
}

function updateQuiz(req, res, id) {
    let body = '';
    req.on('data', chunk => { body += chunk; });
    req.on('end', () => {
        try {
            const updateData = JSON.parse(body);
            
            fs.readFile(DATA_FILE, (err, data) => {
                if (err) {
                    console.error('Error reading quizzes.json:', err);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Internal Server Error' }));
                }
                
                try {
                    let quizzes = JSON.parse(data);
                    let index = quizzes.findIndex(q => q.id == id);
                    
                    if (index === -1) {
                        res.writeHead(404, { 'Content-Type': 'application/json' });
                        return res.end(JSON.stringify({ error: 'Quiz not found' }));
                    }
                    
                    quizzes[index] = { ...quizzes[index], ...updateData };
                    
                    fs.writeFile(DATA_FILE, JSON.stringify(quizzes, null, 2), (writeErr) => {
                        if (writeErr) {
                            console.error('Error writing to quizzes.json:', writeErr);
                            res.writeHead(500, { 'Content-Type': 'application/json' });
                            return res.end(JSON.stringify({ error: 'Failed to update quiz' }));
                        }
                        
                        res.writeHead(200, { 'Content-Type': 'application/json' });
                        res.end(JSON.stringify(quizzes[index]));
                    });
                } catch (parseErr) {
                    console.error('Error parsing quizzes.json:', parseErr);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Error parsing quiz data' }));
                }
            });
        } catch (err) {
            console.error('Error parsing request body:', err);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON in request body' }));
        }
    });
}

function deleteQuiz(res, id) {
    fs.readFile(DATA_FILE, (err, data) => {
        if (err) {
            console.error('Error reading quizzes.json:', err);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Internal Server Error' }));
        }
        
        try {
            let quizzes = JSON.parse(data);
            let filtered = quizzes.filter(q => q.id != id);
            
            if (quizzes.length === filtered.length) {
                res.writeHead(404, { 'Content-Type': 'application/json' });
                return res.end(JSON.stringify({ error: 'Quiz not found' }));
            }
            
            fs.writeFile(DATA_FILE, JSON.stringify(filtered, null, 2), (writeErr) => {
                if (writeErr) {
                    console.error('Error writing to quizzes.json:', writeErr);
                    res.writeHead(500, { 'Content-Type': 'application/json' });
                    return res.end(JSON.stringify({ error: 'Failed to delete quiz' }));
                }
                
                res.writeHead(204);
                res.end();
            });
        } catch (parseErr) {
            console.error('Error parsing quizzes.json:', parseErr);
            res.writeHead(500, { 'Content-Type': 'application/json' });
            return res.end(JSON.stringify({ error: 'Error parsing quiz data' }));
        }
    });
}

module.exports = { getQuizzes, createQuiz, getQuizById, updateQuiz, deleteQuiz };