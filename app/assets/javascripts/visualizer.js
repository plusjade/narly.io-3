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
        width = 300,
        nodeHeight = 20,
        svgWrap = d3.select("#world").append("svg"),
        svg = svgWrap.append("g")
                .attr("transform", "translate(" + margin + "," + margin + ")");

    function update(data) {
        data.forEach(function(d, i) {
            d.indentLevel = d.path.split('/').length - 1;
            d.position = i;
        });

        // Dynamically build the viewport and scaling based on dataset.
        var height = 20 + (data.length * nodeHeight * 2);
        var y = d3.scale.linear();
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(data.length, "d");

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
            .append("svg:circle")
                .attr("r", 8)
                .attr("cy", 20)

        nodeEnter
            .append("text")
                .attr("dy", 25)
                .attr("dx", 14)
                .style("text-anchor", "start")
                .text(function(d) { return d.path });

        // UPDATE
        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(World.duration)
            .attr("class", function(d) { return "g-node " + d.status; })
            .attr("transform", function(d) {
                return "translate(" + 0 + "," + (d.position*nodeHeight*1.5) + ")";
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

    return {
        update : update
    }
})();
