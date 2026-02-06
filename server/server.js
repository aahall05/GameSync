import express from 'express';


const app = express();
const PORT = process.env.PORT || 3000;


app.get('/', (req, res) => {
    res.send('Welcome to GameSync Server!');
});



app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'ok',
        message: 'Server is running',
        uptime: process.uptime(),
        timestamp: new Date().toISOString()
    });
});


app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
    console.log(`Open in browser: http://localhost:${PORT}`);
    console.log(`Health check:   http://localhost:${PORT}/health`);
});
