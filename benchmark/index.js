var path = require('path'),
    fs = require('fs'),
    now = require("performance-now");

var less = require('../lib/less-node');
var file = path.join(__dirname, 'benchmark.less');

if (process.argv[2]) { file = path.join(process.cwd(), process.argv[2]) }

fs.readFile(file, 'utf8', function (e, data) {
    var start, parseEnd, renderEnd, pegEnd, total;

    console.log("Benchmarking...\n", path.basename(file) + " (" +
             parseInt(data.length / 1024) + " KB)", "");

    var renderBenchmark = []
      , parserBenchmark = []
      , pegBenchmark = [];

    var totalruns = 1;
    var ignoreruns = 0;
    var PEGparser = require('../lib/less/parser/lessparser');

    var i = 0;

    nextRun();

    function nextRun() {
        start = now();

        less.parse(data, {}, function(err, root, imports, options) {
            if (err) {
                less.writeError(err);
                process.exit(3);
            }
            parserEnd = now();

            var tree, result;
            tree = new less.ParseTree(root, imports);
            result = tree.toCSS(options);

            renderEnd = now();

            renderBenchmark.push(renderEnd - start);
            parserBenchmark.push(parserEnd - start);

            i += 1;
            if(i < totalruns) {
                nextRun();
            }
            else {
                runPeg();
            }
        });
    }
    function runPeg() {
        for(var i = 0; i < totalruns; i++) {
            start = now();
            PEGparser.parse(data);
            pegEnd = now();
            pegBenchmark.push(pegEnd - start);
        }    
        finish();    
    }

    function finish() {
        function analyze(benchmark, benchMarkData) {
            console.log('----------------------');
            console.log(benchmark);
            console.log('----------------------');
            var totalTime = 0;
            var mintime = Infinity;
            var maxtime = 0;
            for(var i = ignoreruns; i < totalruns; i++) {
                totalTime += benchMarkData[i];
                mintime = Math.min(mintime, benchMarkData[i]);
                maxtime = Math.max(maxtime, benchMarkData[i]);
            }
            var avgtime = totalTime / (totalruns - ignoreruns);
            var variation = maxtime - mintime;
            var variationperc = (variation / avgtime) * 100;

            console.log("Min. Time: "+mintime + " ms");
            console.log("Max. Time: "+maxtime + " ms");
            console.log("Total Average Time: " + avgtime + " ms (" +
                parseInt(1000 / avgtime *
                data.length / 1024) + " KB\/s)");
            console.log("+/- " + variationperc + "%");
            console.log("");
        }
       
        analyze('Parser Data', parserBenchmark);
        analyze('Render Data', renderBenchmark);
        analyze('(Experimental) PEG Parser Data', pegBenchmark);
    }

});

