//var s = 'S130208 300 35 0 5.4 324 26 0 0';
var s = 'S130209	300	35	1	5.9	354	33	4	1,5-2,0				';
s = s.trim();
var r = s.split('\t');



console.log(s.length);

for(var i in r) {
	console.log(i,r[i]);	
}
