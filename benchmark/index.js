var path = require('path'),
    fs = require('fs'),
    now = require("performance-now");

var less = require('../lib/less-node');
var file = path.join(__dirname, 'benchmark.less');

if (process.argv[2]) { file = path.join(process.cwd(), process.argv[2]) }

fs.readFile(file, 'utf8', function (e, data) {
    var start, total;

    console.log("Benchmarking...\n", path.basename(file) + " (" +
             parseInt(data.length / 1024) + " KB)", "");

    var renderBenchmark = []
      , parserBenchmark = []
      , pegBenchmark = []
      , nearleyBenchmark = [];

    var totalruns = 50;
    var ignoreruns = 5;
    var PEGparser = require('../lib/less/parser/less_peg_parser');

    var nearley = require("nearley");
    var grammar = require("../lib/less/parser/less_nearley_parser");
    var p = new nearley.Parser(grammar.ParserRules, grammar.ParserStart);

    var i = 0;

    runNearley();
    //nextRun();

    function nextRun() {
        var start, renderEnd, parserEnd;

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
            console.log('Less Run #: ' + i);
            if(i < totalruns) {
                nextRun();
            }
            else {
                runPeg();
            }
        });
    }
    function runPeg() {
        var start, pegEnd;

        for(var i = 0; i < totalruns; i++) {
            start = now();
            PEGparser.parse(data);
            console.log('PEG Run #: ' + i);
            pegEnd = now();
            pegBenchmark.push(pegEnd - start);
        }    
        runNearley();    
    }
    function runNearley() {
        var start, end;
        for(var i = 0; i < totalruns; i++) {
            start = now();
            console.log('Nearley Run #: ' + i);
            try {
                p.feed(".box { a: b }");
            } catch(parseError) {
                console.log(
                    "Error at character " + parseError.offset
                ); // "Error at character 2"
            }

            end = now();
            nearleyBenchmark.push(end - start);
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
       
        // analyze('Parser Data', parserBenchmark);
        // analyze('Render Data', renderBenchmark);
        // analyze('(Experimental) PEG Parser Data', pegBenchmark);
        analyze('(Experimental) Nearley Parser Data', nearleyBenchmark);

    }

});

