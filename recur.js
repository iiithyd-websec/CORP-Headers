var i=0;
var arr=[1,2,3,4,5];
var len=arr.length;

run(0);
function run(i){
	if(i===len) return;
	console.log('computing '+i);
	i=i+1;
	run(i);
phantom.exit(1);
}