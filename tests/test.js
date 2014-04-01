test("truthy", function() {
	ok(true, "true is truthy");
	equal(1, true, "1 is truthy");
	notEqual(0, true, "0 is NOT truthy");
});

test("isPair", function() {
	ok(isPair(0, 1), 'isPair passed.');
	ok(isPair(24,25),'isPair2 passed.');
	ok(isPair(0,23) === false,'isPair3 passed');
});

test("getRank",function(){
	ok(getRank(0) === 1, "getRank1 passed");
	ok(getRank(0) === getRank(1),"getRank2 passed");
});

test("getNonPairValue",function(){
	ok(getNonPairValue(0,31) === 8,"getNonPairValue1 passed");
	ok(getNonPairValue(10,14) === 4,"getNonPairValue2 passed");
	ok(getNonPairValue(0,1) === -1,"getNonPairValue3 passed");
	ok(getNonPairValue(4,31) === 7,"getNonPairValue4 passed");
	ok(getNonPairValue(18,22) === 6,"getNonPairValue5 passed");
	ok(getNonPairValue(6,20) === 5, "getNonPairValue6 passed");
});

test("getRoundWinner",function(){
	ok(getRoundWinner([0,31,10,14],[0,31],[4,31,18,22],[4,31]) === -1,"getRoundWinner push1 passedd");
	ok(getRoundWinner([0,31,10,14],[31,0],[4,31,18,22],[4,31]) === -1,"getRoundWinner push2 passedd");
	ok(getRoundWinner([0,31,10,14],[10,14],[4,31,18,22],[4,31]) === -1,"getRoundWinner push3 passedd");
	ok(getRoundWinner([0,31,10,14],[0,31],[4,31,18,22],[18,22]) === -1,"getRoundWinner push4 passedd");
});


test("getWinner",function(){
	ok(getWinner(6,7,22,23) === 1,"getWinner1 passed");
	ok(getWinner(22,23,6,7) === 2,"getWinner2 passed");
	ok(getWinner(18,30,6,20) === 2,"getWinner3 passed");
});