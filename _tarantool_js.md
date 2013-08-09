Tarantool/Box + JavaScript HOWTO
================================

**Feature Stability:** early alpha

**Tarantool/Box** is an in-memory database designed to store the most volatile and highly accessible web content. Tarantool/Box has been extensively used in production since 2009. It's open source, BSD licensed.

http://tarantool.org/

Installation
------------

Get && install **libv8** library with development files:

```
~ $ svn checkout http://v8.googlecode.com/svn/trunk/ v8
~ $ cd v8
~/v8 $ make dependencies
~/v8 $ make native werror=no library=shared -j8
~/v8 $ install -o root include/* /usr/local/include
~/v8 $ install -o root out/native/lib.target/libv8.so /usr/local/lib
```

Check http://code.google.com/p/v8/wiki/BuildingWithGYP
for more details.

Version 3.20.14 is tested (head ChangeLog -n 1).
Version older than 3.19 is now compatible due to V8 API changes.

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
~/tarantool_js $ git clone https://gist.github.com/4702667.git var
```

Run Tarantool/Box from the `test/var/` directory
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
JS error: Error: dsfsa
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
undefined <!-- Message printed to the Tarantool's log
...
```
Our `require` mostly works like Node.JS's analog. By default **Tarantool/Box** lookups a module in the its modules cache, then checks the list of built-in modules and finally tries to scan your `script_dir`. 

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

**Tarantool/Box** tries to find and load ```init``` module on the start.
All global variables from the module is accesable from the admin console.

Global Objects
--------------
Tarantool/Box exports only one global function to JavaScript - `require`. All other built-in modules can be loaded via this method `require`.

Built-in modules
----------------
+ **platform** - platform-specific things needed for implementation
+ **require** - require functions itself
+ **fiber** module for working with **Tarantool/Box** fibers
+ **box** - interface to the Tarantool/Box transaction processor (is not ready yet)

Module 'require'
--------------

Example:
```
~/tarantool_js/test/var $ cat console.js
exports.log = function(msg) {
    /* some code */
}

~/tarantool_js/test/var $ tarantool
localhost> js console = require('console');
---
[object Object]
...
localhost> console.log('Hey You!')
...

~/tarantool_js/test/var $ tail -n 100 tarantool.log
2013-02-03 21:03:22.754 [13130] 101/js-init-library I> Loading new JS module 'console' from './console.js'
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

TypedArray (built-in module)
----------------------------

See https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays

Example:
```

buffer = new Int8Array(1024)
buffer[0] = 2;
```

Questions
---------

+ http://tarantool.org/
+ https://bugs.launchpad.net/tarantool
+ https://groups.google.com/forum/?fromgroups=#!forum/tarantool
+ https://groups.google.com/forum/?fromgroups=#!forum/tarantool-ru
+ irc://irc.freenode.net/#tarantool
+ roman@tsisyk.com
