const request = require('request');

module.exports = class Utils {
    constructor() {}
    
    static BASE_URL() {
        return 'http://elementscommunity.org/tools/discord-bot/';
    }
    
    static module_exists(name) {
        try {
            return require.resolve(name);
        } catch(e) {
            return false;
        }
    };
    
    static post(file_name, data, callback) {
        request.post({
            url: Utils.BASE_URL() + file_name, 
            form: data, 
        },
        (err, res, body) => {
            if (err) {
                throw err;
            }
            
            callback(body);
        });
    }
};
