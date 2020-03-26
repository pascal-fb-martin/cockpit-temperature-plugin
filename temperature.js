window.onload = function () {
    resize_canvas()

    var chart = new SmoothieChart({tooltip:true, millisPerPixel: 500, maxValue: 100, minValue: 0, scaleSmoothing: 0.1, grid: { fillStyle: '#ffffff', millisPerLine: 0, verticalSections: 4, sharpLines: true}, labels: { fillStyle: '#000000', fontSize: 12, precision: 0 }, timestampFormatter: SmoothieChart.timeFormatter }),
        canvas = document.getElementById('smoothie-chart'),
        series = [];
        stokes = [{lineWidth: 3.5, strokeStyle: '#ff0000',fillStyle:'rgba(255,0,0,0.08)'},
                  {lineWidth: 3.5, strokeStyle:  '#008800',fillStyle:'rgba(0,136,0,0.08)'},
                  {lineWidth: 3.5, strokeStyle:  '#0000ff',fillStyle:'rgba(0,0,255,0.08)'}];

    function run_init () {
        var i = 0;
        var proc = cockpit.spawn(["sensors"]);
        proc.done(function(data){
            pts = data.match(/temp1:[\t ]+[+]*[0-9\.]+/g);
            if (pts) {
               for (i = 0; i < pts.length; i++) {
                  series[i] = new TimeSeries();
                  chart.addTimeSeries(series[i], stokes[i%stokes.length]);
               }
            }
        });
        proc = cockpit.spawn(["vcgencmd", "measure_temp"]);
        proc.done(function(data){
	        pt = parseFloat(data.match(/temp[=]([0-9\.]+)/)[1]);
            if (pt) {
	            series[i] = new TimeSeries();
                chart.addTimeSeries(series[i], stokes[i%stokes.length]);
            }
	    });
        cockpit.file("/etc/armbianmonitor/datasources/soctemp").read()
        .done(function(data, tag){
            if (data) {
	           pt = parseFloat(data.match(/([0-9]+)/)[1]) / 1000;
               if (pt) {
	               series[i] = new TimeSeries();
                   chart.addTimeSeries(series[i], stokes[i%stokes.length]);
               }
            }
	    });
    };
    run_init();
    chart.streamTo(canvas, 5000);

    function run_proc(series) {
        var i = 0;
        var now = new Date().getTime();

        var proc = cockpit.spawn(["sensors"]);
        proc.done(function(data){
            pts = data.match(/temp1:[\t ]+[+]*[0-9\.]+/g);
            if (pts) {
               for (i = 0; i < pts.length; i++) {
                  pt = parseFloat(pts[i].match(/temp1:[\t ]+[+]*([0-9\.]+)/)[1]);
                  series[i].append(now, pt);
               }
            }
        });
        var proc = cockpit.spawn(["vcgencmd", "measure_temp"]);
        proc.done(function(data){
	        pt = parseFloat(data.match(/temp[=]([0-9\.]+)/)[1]);
            if (pt) {
                series[i].append(now, pt);
            }
	    });
        cockpit.file("/etc/armbianmonitor/datasources/soctemp").read()
        .done(function(data, tag){
            if (data) {
               pt = parseFloat(data.match(/([0-9]+)/)[1]) / 1000;
               if (pt) {
	               series[i].append(now, pt);
               }
            }
	    });
    };

    //run_proc(series)
    setInterval(function () { run_proc(series) }, 5000);
}

function resize_canvas() {
    document.getElementById("smoothie-chart").width = window.innerWidth - 50;
}

