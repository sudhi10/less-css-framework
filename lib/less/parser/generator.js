
var lessparser = require('./lessparser');
var benchmark = require('fs').readFileSync('../../../benchmark/benchmark.less', { encoding: 'UTF8'});
lessparser.parse(benchmark);