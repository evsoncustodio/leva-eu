const path = require('path');

module.exports = (api) => {
    return {
        download: (req, res, next) => {
            res.download(path.resolve(__dirname, './../../public/favicon.png'));
        }
    }
}