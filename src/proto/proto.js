/*eslint-disable block-scoped-var, id-length, no-control-regex, no-magic-numbers, no-prototype-builtins, no-redeclare, no-shadow, no-var, sort-vars*/
"use strict";

var $protobuf = require("protobufjs/light");

var $root = ($protobuf.roots["default"] || ($protobuf.roots["default"] = new $protobuf.Root()))
.addJSON({
  Model: {
    fields: {
      event: {
        type: "int32",
        id: 1
      },
      sendUid: {
        type: "string",
        id: 2
      },
      receiver: {
        type: "string",
        id: 3
      },
      sendTime: {
        type: "int64",
        id: 4
      },
      messageId: {
        type: "string",
        id: 5
      },
      content: {
        type: "bytes",
        id: 6
      }
    }
  }
});

module.exports = $root;
