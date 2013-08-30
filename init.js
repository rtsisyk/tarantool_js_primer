/*
 * Redistribution and use in source and binary forms, with or
 * without modification, are permitted provided that the following
 * conditions are met:
 *
 * 1. Redistributions of source code must retain the above
 *    copyright notice, this list of conditions and the
 *    following disclaimer.
 *
 * 2. Redistributions in binary form must reproduce the above
 *    copyright notice, this list of conditions and the following
 *    disclaimer in the documentation and/or other materials
 *    provided with the distribution.
 *
 * THIS SOFTWARE IS PROVIDED BY <COPYRIGHT HOLDER> ``AS IS'' AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED
 * TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR
 * A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL
 * <COPYRIGHT HOLDER> OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR
 * BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF
 * LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT
 * (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF
 * THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF
 * SUCH DAMAGE.
 */

/*
 * Require
 */
console = require('console');
console.log('Hello from JS');

/*
 * Test a module with native object
 */
stub = require('stub')
s = new stub()
console.log("stub.add => " + s.add(10))
console.log("stub.add => " + s.add(15))

/* Export the function to IPROTO */
exports.test = function(a, b) {
    return a + b;
}


/* 
 * Try to load node.js module
 */
var util = require('node_util')

console.log("node.js module test: " + util + " " + util.format("%s %d", "util.format", 1));

/*
 * Fibers
 */
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

/*
 * Array
 * @see https://developer.mozilla.org/en-US/docs/JavaScript/Typed_arrays
 */

buffer = new Int8Array(1024)
buffer[0] = 0;
buffer[1023] = 1023;
buffer[1024] = 1024;

console.log("buffer[0]     = " + buffer[0])
console.log("buffer[1023]  = " + buffer[1023])
console.log("buffer[1024]  = " + buffer[1024])

console.error('Error message test')
