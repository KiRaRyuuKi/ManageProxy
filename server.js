const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const path = require('path');
const app = express();
const port = 2550;

require('events').EventEmitter.defaultMaxListeners = 20;

app.use(express.static('public'));

app.get('/', (_req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.use('/proxy', (req, res, next) => {
    const protocol = req.query.protocol || 'http';
    const targetAddress = req.query.address;
    const targetPort = req.query.port;

    if (!targetAddress || !targetPort) {
        console.log("Kesalahan: Address atau Port tidak disediakan!");
        return res.status(400).send("Address atau port tidak lengkap!");
    }

    const target = `${protocol}://${targetAddress}:${targetPort}`;
    console.log(`Mencoba proxy: ${target}`);

    const proxy = createProxyMiddleware({
        target: target,
        changeOrigin: true,
        logLevel: 'debug',
        secure: protocol === 'https',
        onError: (err, _req, res) => {
            console.error(`Proxy error: ${target}: ${err.message}`);
            res.status(500).send(`Error: ${err.message}`);
        },
        onProxyRes: (proxyRes, _req, _res) => {
            console.log(`Proxy berhasil: ${target}`);
            delete proxyRes.headers['x-frame-options'];
            delete proxyRes.headers['content-security-policy'];
        },
        pathRewrite: {
            '^/proxy': ''
        }
    });

    return proxy(req, res, next);
});

app.listen(port, () => {
    console.log(`Proxy server berjalan di http://localhost:${port}`);
});
