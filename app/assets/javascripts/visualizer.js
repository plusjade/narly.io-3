// Visualizes commit diff stats.
// For example the file structure changes as you walk commit by commit.
// Powered by d3, thanks Mike Bostock and all the contributors.
window.Visualizer = (function() {
    var World = { duration : 500 };
    // World.wrap = d3.select("#world").append("svg:svg");
    // World.container = World.wrap
    //     .append("svg:g")
    //         .attr("transform", "translate(" + 0 + "," + 0 + ")")
    //         .style('background-color', "#ccc")

    var margin = 20,
        width = 500,
        nodeHeight = 20,
        svgWrap = d3.select("#world").append("svg"),
        svg = svgWrap.append("g")
                .attr("transform", "translate(" + margin + "," + margin + ")");

    function update(deltas) {
        console.log('d3 beaning!');
        var data = generateGlobalFileSetFromDeltas(deltas);
        console.log(data);

        // Dynamically build the viewport and scaling based on dataset.
        var height = data.length * nodeHeight * 2;
        var x = d3.scale.linear().rangeRound([0, width]);
        var y = d3.scale.linear();
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(data.length, "d");

        x.domain([0, d3.max(data, function(d) { return d.indentLevel; })]);
        y.domain([0, data.length]);
        y.rangeRound([0, data.length*nodeHeight*2]);

        svgWrap.transition()
            .attr("width", width)
            .attr("height", height);


        // DATA
        var node = svg.selectAll("g.g-node")
                    .data(data, function(d) { return d.path });

        // ENTER
        var nodeEnter = node.enter().append("svg:g")
            .attr("class", function(d) { return "g-node " + d.status; })

        nodeEnter
            .append("rect")
                .attr("class", 'bar')
                .attr("height", nodeHeight)
                .attr("width", 300)

        nodeEnter
            .append("text")
                .attr("dy", 15)
                .attr("dx", 10)
                .style("text-anchor", "start")
                .text(function(d) { return d.path });

        // UPDATE
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(World.duration)
            .attr("class", function(d) { return "g-node " + d.status; })
            .attr("transform", function(d) {
                return "translate(" + (30*d.indentLevel) + "," + (d.position*nodeHeight*1.5) + ")";
            });

        var nodeExit = node.exit();

        // EXIT
        nodeExit
            .transition()
            .duration(World.duration)
            .style("fill-opacity", 0)
            .remove();


        // TODO: I may not need this, I'm just taking code from my other d3 projects.
        // Stash the old positions for transition.
        data.forEach(function(d) {
            d.x0 = d.x;
            d.y0 = d.y;
        });
    }

    var GlobalFiles = {};
    function generateGlobalFileSetFromDeltas(deltas) {
        deltas.forEach(function(d) {
            d.indentLevel = d.path.split('/').length - 1;
            if(d.status === "deleted" && GlobalFiles[d.path]) {
                delete GlobalFiles[d.path];
            }
            else {
                GlobalFiles[d.path] = d;
            }
        });

        var data = [];
        for(key in GlobalFiles) {
            data.push(GlobalFiles[key]);
        }
        data.sort(function(a, b) {
            if (a.path > b.path) {
                return 1;
            }
            if (a.path < b.path) {
                return -1;
            }
            return 0;
        })
        data.forEach(function(d, i) {
            d.position = i;
        })

        return data;
    }

    return {
        update : update
    }
})();
