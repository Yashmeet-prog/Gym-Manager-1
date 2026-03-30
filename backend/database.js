const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'data.json');

// create file if not exists
if (!fs.existsSync(filePath)) {
    fs.writeFileSync(filePath, JSON.stringify({ users: [] }));
}

const readData = () => {
    return JSON.parse(fs.readFileSync(filePath));
};

const writeData = (data) => {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
};

module.exports = { readData, writeData };