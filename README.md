Tarantool + JavaScript HOWTO
============================

**Feature Stability:** beta

**Tarantool** is an in-memory database designed to store the most volatile and highly accessible web content. Tarantool has been extensively used in production since 2009. It's open source, BSD licensed.

http://tarantool.org/

Installation
------------

Get && install **libv8** library with development files:

```
~ $ svn checkout http://v8.googlecode.com/svn/trunk/ v8
~ $ cd v8
~/v8 $ patch -p0 ../tarantool/third_party/tarantool-v8.patch
~/v8 $ make dependencies
~/v8 $ make native werror=no library=shared -j8
~/v8 $ install -o root include/* /usr/local/include
~/v8 $ install -o root out/native/lib.target/libv8.so /usr/local/lib
```

Check http://code.google.com/p/v8/wiki/BuildingWithGYP
for more details.

Version 3.20.14 is tested (head ChangeLog -n 1).
Version older than 3.19 is not compatible due to V8 API changes.

Clone **tarantool-js** repository:
```
~ $ git clone https://github.com/rtsisyk/tarantool tarantool-js 
~/tarantool_js $ cd tarantool-js
~/tarantool_js $ git checkout js
```

Compile **Tarantool/Box** with JavaScript support

```
~/tarantool_js $ cmake . -DENABLE_JS=ON
~/tarantool_js $ make
```
**Note:** `make -jN` is known to be broken

Clone content of **this gist** to the `test/var` directory
```
~/tarantool_js $ cd test
~/tarantool_js $ git clone git@github.com:rtsisyk/tarantool_js_primer.git var
```

Run Tarantool from the `test/var/` directory
```
~/tarantool_js $ cd test/var
~/tarantool_js/test/var $ ../../src/box/tarantool_box --init-storage
~/tarantool_js/test/var $ ../../src/box/tarantool_box
```

Usage
-----

You can use JavaScript mostly like Lua:
```
~$ tarantool
localhost> js 2 + 2
---
4
...
localhost> js Date()
---
Sun Feb 03 2013 20:43:06 GMT+0700 (NOVST)
...
localhost> js throw Error('message')
---
{
        "error": {
                "stack": "Error: message\n    at Error (<anonymous>)\n    at admin/127.0.0.1:43617:1:7",
                "message": "message",
                "code": 56,
                "fileName": "admin/127.0.0.1:43617",
                "lineNumber": 1,
                "sourceLine": "throw Error('message')",
                "startColumn": 6,
                "endColumn": 7
        }
}
...

```

To load module use `require` function:
```
localhost> js console = require('console');
---
[object Object]
...
localhost> js console.log('Hey You!')
---
"Hey You!"  <!-- Message printed to the Tarantool's log
...
```
Our `require` mostly works like Node.JS's analog. By default **Tarantool**
lookups a module in the its modules cache, then checks the list of built-in
modules and finally tries to scan your `script_dir`. 

A small subset of Node.JS modules is already supported:
```
localhost> js util = require('node_util');
---
[object Object]
...
localhost> js util.format("%s %d", "String", 12)
---
String 12
...
```

**Tarantool** tries to find and load ```init``` module on the start.
All global variables from the module is accessible from the admin console.

Global Objects
--------------
Tarantool exports only one global function to JavaScript - `require`.
All other modules can be loaded using `require`.

 * function require(module: String) - loads module

JavaScript module example:
```
~/tarantool_js/test/var $ cat test.js
exports.log = function(msg) {
    /* some code */
}

~/tarantool_js/test/var $ tarantool
localhost> js test = require('test');
---
[object Object]
...
localhost> test.log('Hey You!')
...

~/tarantool_js/test/var $ tail -n 100 tarantool.log
2013-02-03 21:03:22.754 [13130] 101/js-init-library I> Loading new JS module 'console' from './console.js'
```

Built-in modules that can be loaded by `require`:

+ **require** - require itself
+ **console** - platform-specific things needed for implementation
+ **fiber** module for working with **Tarantool** fibers
+ **lua** JavaScript <-> Lua bindings
+ **box** - interface to the Tarantool transaction processor

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
for list of standard globals objects exported by the JavaScript engine.

[Module reference](jsdoc/index.html).

Module 'console'
----------------

### console.log

#### Summary
Outputs a message to the log file.


#### Syntax

```
console.log(obj1 [, obj2, ..., objN);
console.log(msg [, subst1, ..., substN);

```

#### Parameters

**obj1 ... objN** -- A list of JavaScript objects to output. The string representations of each of these objects are appended together in the order listed and output.

** msg ** -- A JavaScript string containing zero or more substitution strings.
    
** subst1 ... substN** -- JavaScript objects with which to replace substitution strings within msg. This gives you additional control over the format of the output. 

### console.info

#### Summary
Same as console.log.

#### Example
```
localhost> js console = require('console')
---
{}
...
localhost> js console.log('Hello: %s %d %j', "String", 2, { "key": "value"})
---
"Hello: String 2 {\"key\":\"value\"}"
...
localhost> js console.warn("Warning");
---
"Warning"
...
localhost> js console.trace()
---
[
        {
                "typeName": "[object global]",
                "functionName": null,
                "methodName": null,
                "fileName": "admin/127.0.0.1:60345",
                "lineNumber": 1,
                "columnNumber": 9,
                "evalOrigin": "admin/127.0.0.1:60345"
        }
]
...
```

console.log prints source file name and line number in messages:
```
2013-08-30 18:36:52.252 [27013] 101/js-init-library init.js:93 E> Error message test
```

Module 'fiber'
--------------

Example:
```
fiber = require('fiber')

function body1(msg, count)
{
    console.log("In Fiber: " + this.id);

    var k = 0;
    for (var i = 0; i < count; i++) {
        console.log("Hello from fiber: " + msg);
        fiber.sleep(1.0)
    }

    return 48;
}

f1 = new fiber(body1, "Hello", 10)
f2 = new fiber(body1, "Hey", 5)
console.log("f1.id = " + f1.id)
```


Module 'lua'
--------------

JavaScript <-> Lua bindings on steroids

```
localhost> js lua = require('lua')
---

...
localhost> js lua.box.info
---
{
        "version": "1.5.3-138-g682a52a",
        "build": {
                "flags": " -fno-omit-frame-pointer -fno-stack-protector -fexceptions -funwind-tables -msse2 -std=c11 -Wall -Wextra -Wno-sign-compare -Wno-strict-aliasing -Werror",
                "target": "Linux-x86_64-Debug",
                "compiler": "/usr/bin/clang /usr/bin/clang++",
                "options": "cmake . -DCMAKE_INSTALL_PREFIX=/usr/local -DENABLE_STATIC=OFF -DENABLE_TRACE=ON -DENABLE_BACKTRACE=OFF -DENABLE_CLIENT=OFF"
        },
        "pid": 25846,
        "logger_pid": 0,
        "config": "/data/work/tarantool/js/test/var/tarantool.cfg"
}
...

localhost> js lua.a = 10
---
10
...
localhost> lua a
---
 - 10
...
localhost> lua a = 15
---
...
localhost> js lua.a
---
15
...
localhost> js Object.keys(lua)
---
[
        "toString",
        "coroutine",
        "assert",
        "tostring",
        "tonumber",
        "io",
        /* cut */
        "_G",
        "select",
        "string",
        "type",
        "getmetatable",
        "a",
        "setmetatable"
]
...
localhost> js lbox = lua.box
localhost> js lbox.select(0, 0, 1).toString()
---
"1: {2, 3}"
...

localhost> js x = lua.box.select(0, 0, 0)
---
{}
...
localhost> js x.toString()
---
"0: {1953719668, 'a', 'b', 'a'}"
...
localhost> js x[1]
---
"test"
...
localhost> js x[2]
---
"a"
...
localhost> js x.unpack(x)
---
[
        "\u0000\u0000\u0000\u0000",
        "test",
        "a",
        "b",
        "a"
]
...
localhost> js x.find(x, "a")
---
2
...

localhost> js pk = lua.box.space[0].index[0]
---
{
        "unique": true,
        "key_field": {
                "0": {
                        "type": "NUM",
                        "fieldno": 0
                }
        },
        "idx": {},
        "type": "HASH"
}
...
localhost> js it = pk.iterator(pk, lua.box.index.GE, 1)
---
{}
...
localhost> js it.toString()
---
"[object Lua.Function]"
...
localhost> js it().toString()
---
"1: {}"
...
localhost> js it().toString()
---
"2: {2}"
...
localhost> js it().toString()
---
"1953719668: {'a', 'b', 'a'}"
...
localhost> js it().toString()

localhost> js MyBox.prototype = lua.box
localhost> js mybox = new MyBox()
---
{}
...
localhost> js mybox.cfg
---
{
        "io_collect_interval": 0,
        /* cut */
        "memcached_expire": false
}
localhost> js mybox.space[0].index[0].type
---
"HASH"
...
...
```


Module 'box'
------------

```
localhost> js box = require('box')
---
{}
...
localhost> js box.insert(0, [1, 2, "Hello"])
---
[
        {
                "0": {
                        "0": 1,
                        "1": 0,
                        "2": 0,
                        "3": 0
                },
                "1": {
                        "0": 2,
                        "1": 0,
                        "2": 0,
                        "3": 0
                },
                "2": {
                        "0": 72,
                        "1": 101,
                        "2": 108,
                        "3": 108,
                        "4": 111
                },
                "arity": 3
        }
]
...
localhost> js box.select(0, 0, [1])
---
[
        {
                "0": {
                        "0": 1,
                        "1": 0,
                        "2": 0,
                        "3": 0
                },
                "1": {
                        "0": 2,
                        "1": 0,
                        "2": 0,
                        "3": 0
                },
                "2": {
                        "0": 72,
                        "1": 101,
                        "2": 108,
                        "3": 108,
                        "4": 111
                },
                "arity": 3
        }
]
...

localhost> js f = new box.Iterator(0, 0, box.Iterator.GE, [0])
---
{}
...
localhost> js String(f())
---
"[object Box.Tuple]"
...
localhost> js String(f())
---
"[object Box.Tuple]"
...
localhost> js String(f())
---
"undefined"
```

TypedArrays
-----------

See https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays

Example:
```

buffer = new Int8Array(1024)
buffer[0] = 2;
```

JSON
----

See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/JSON

Example:
```
localhost> js x = JSON.parse('{ "a": 10, "b":15}')
---
{
        "a": 10,
        "b": 15
}
...
localhost> js JSON.stringify(x)
---
"{\"a\":10,\"b\":15}"
...
```

Questions
---------

+ http://tarantool.org/
+ https://bugs.launchpad.net/tarantool
+ https://groups.google.com/forum/?fromgroups=#!forum/tarantool
+ https://groups.google.com/forum/?fromgroups=#!forum/tarantool-ru
+ irc://irc.freenode.net/#tarantool
+ roman@tsisyk.com
