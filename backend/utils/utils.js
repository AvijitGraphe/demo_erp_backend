const path = require('path');

const publicroot = "./dispatchEvent";
const getfrontend = async (req, res, next) => {
    res.sendFile("index.html", { root: path.resolve(__dirname, publicroot) });
}

module.exports = { getfrontend };
