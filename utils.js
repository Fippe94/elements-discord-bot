const request = require('request');

module.exports = class {
    constructor() { 
        this.base_url = 'http://elementscommunity.org/tools/discord-bot/';
    }
    
    static module_exists = name => {
        try {
            return require.resolve(name);
        } catch(e) {
            return false;
        }
    };
    
    static post = (file_name, data, callback) => {
        request.post(this.base_url + file_name, data, (err, res, body) => {
            if (err) {
                throw err;
            }
            
            callback(body);
        });
    }
};
