module("Basic Tests");
 
test("truthy", function() {
  ok(true, "true is truthy");
  equal(1, true, "1 is truthy");
  notEqual(0, true, "0 is NOT truthy");
});

test("isPair", function() {
	ok(isPair(0,1), "First two tiles makes a pair");
});