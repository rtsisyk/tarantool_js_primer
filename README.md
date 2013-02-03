Tarantool JavaScript Example

Put these files into the var/ directory and run server 

1. Install v8 library with development files
apt-get install v8
emerge dev-lang/v8

2. Clone repository
git clone https://github.com/rtsisyk/tarantool tarantool-js 
cd tarantool-js
git checkout js
3. Compile Tarantool with JavaScript support
cmake . -DENABLE_JS=ON
