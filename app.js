var csv = require('./csv');
var store= require('./store');

console.log(csv(store.get(), 'yellow'));