var csv = require('./csv');
var store = require('./store.js').setup('./store.json')

console.log(csv(store.get(), 'yellow'));