Tarantool/Box + JavaScript HOWTO
================================

**Feature Stability:** early alpha

**Tarantool/Box** is an in-memory database designed to store the most volatile and highly accessible web content. Tarantool/Box has been extensively used in production since 2009. It's open source, BSD licensed.

http://tarantool.org/

Installation
------------

Get && install **libv8** library with development files:

```
debian# apt-get install libv8-dev
redhat# yum install v8-devel
gentoo# emerge dev-lang/v8
```

version 3.14.5.3 and svn bleeding edge rev.13579 are tested.

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
~/tarantool_js $ git clone https://gist.github.com/XXXX.git var
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
+ **array** - JavaScript typed arrays
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

function body1(arg)
{
    console.log("In Fiber: " + fiber.self().id);

    var k = 0;
    for (var i = 0; i < arg; i++) {
        console.debug("Before yield");
        k = fiber.yield(i + k);
        console.debug("After yield");
    }

    return 48;
}

f = new fiber(body1)
console.log("f.id     = " + f.id);
console.log("f.name   = " + f.name);
console.log("f.state  = " + f.state);
console.log("f.resume =>" + f.resume(2));
console.log("f.resume =>" + f.resume(10));
console.log("f.resume =>" + f.resume(15));
console.log("f.state  = " + f.state);

fiber.sleep(1.0)
```

Module 'array'
--------------

See https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays

Example:
```
array = require('array');

buffer = array.Int8Array(1024)
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
