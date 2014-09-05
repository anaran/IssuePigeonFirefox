var main = require("../lib/main");

exports["test main"] = function(assert) {
  assert.pass("Unit test running!");
};

exports["test main async"] = function(assert, done) {
  assert.pass("async Unit test running!");
  done();
};

exports["test self"] = function(assert, done) {
    [
        "id",
        "name",
        "title",
        "version"
    ].forEach(function(prop) {
        main.testSelfProperty(prop, function(value) {
            assert.ok((value !== undefined), "self." + prop
                      + " is " + value);
            done();
        });
    });
    main.dummy(function(value) {
        assert.ok(value !== undefined, "metadata is " + value);
        done();
    });
};

require("sdk/test").run(exports);
