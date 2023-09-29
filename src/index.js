const http = require('http'); // Import the HTTP module

// Your code here...

// Set the server port based on the PORT environment variable or default to 8000
let port = process.env.PORT || 8000;

// Create an HTTP server
const server = http.createServer((req, res) => {
  // Handle HTTP requests here...
});

// Listen on the specified PORT
server.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

// The rest of your code...
const Monitor = require('./class/monitor.js');
const { sendWebhook } = require('../utils/webhook.js');

const fs = require('fs');

let proxies = [],
    sites = [],
    webhooks = [];

fs.readFileSync(__dirname + '/../config/proxies.txt', 'utf-8')
    .split(/\r?\n/).forEach(line => proxies.push(line));
fs.readFileSync(__dirname + '/../config/sites.txt', 'utf-8')
    .split(/\r?\n/).forEach(line => sites.push(line));
fs.readFileSync(__dirname + '/../config/webhooks.txt', 'utf-8')
    .split(/\r?\n/).forEach(line => {
        line = line.replace(/\s/g, '');
        if (line != '') webhooks.push(line);
    });

sites.forEach(site => {
    const currentMonitor = new Monitor({
        site,
        proxies
    });

    console.log('Monitor Started for ' + site);

    currentMonitor.on('newProduct', productDetails => {
        for (let i = 0; i < webhooks.length; i++) {
            sendWebhook(webhooks[i], 1305395, 'New Product', productDetails);
        }
        console.log('New Product @ ' + productDetails.site + ': ' + productDetails.product.title)
    });
    
    currentMonitor.on('restockedProduct', restockDetails => {
        for (let i = 0; i < webhooks.length; i++) {
            sendWebhook(webhooks[i], 242172, 'Product Restock', restockDetails);
        }
        console.log('Restock @ ' + restockDetails.site + ': ' + restockDetails.product.title)
    });
});
