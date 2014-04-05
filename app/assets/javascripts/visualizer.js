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

    var margin = {top: 20, right: 20, bottom: 30, left: 40},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;
    var svg = d3.select("#world").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function update(deltas) {
        console.log('d3 beaning!');
        _.each(deltas, function(d, i){ d.indentLevel = 1; d.position = i; });
        var data = deltas;
        console.log(data);

        // Dynamically build the viewport and scaling based on dataset.
        height = data.length * 20;
        var x = d3.scale.linear().rangeRound([0, width]);
        var y = d3.scale.linear();
        var xAxis = d3.svg.axis()
            .scale(x)
            .orient("bottom");
        var yAxis = d3.svg.axis()
            .scale(y)
            .orient("left")
            .ticks(data.length, "d");

        y.rangeRound([0, height]);
        y.domain([0, data.length]);


        // var x = d3.scale.linear().range([0, width]);
        // x.domain([0,10]);
        // var xAxis = d3.svg.axis().scale(x).orient("left");

        // var y = d3.time.scale();
        // if(data.length === 1) {
        //     y.domain([Renderer.attribute(data[0]), maxExtent]);
        // }
        // else {
        //     y.domain(d3.extent(data, function(d) { return Renderer.attribute(d) }));
        // }
        // y.range([0, height-cardWidth]); // account for the last card's width
        // var yAxis = d3.svg.axis()
        //     .scale(y)
        //     .tickFormat(Renderer.tickFormat)
        //     .ticks(d3.time.months)
        //     .orient("right");


        // data.sort(function(a, b){ return (Renderer.attribute(a) > Renderer.attribute(b)) ? +1 : -1 ; })
        // data.forEach(function(d, i) {
        //     d._position = i+1;
        // })

        // var total = data.length;

        // // break data into vertical chunks for display.
        // var i = 1;
        // data.forEach(function(d) {
        //   if(i > 9) i = 1;
        //   d.x = (i);
        //   ++i;
        // });

        svg.transition()
            .attr("width", width)
            .attr("height", height);

        svg.selectAll('g.axis').remove();
        // svg.append("g")
        //     .attr('transform', 'translate(10, '+ margin.top +')')
        //     .attr("class", "x axis _clear")
        //     .call(yAxis);
        // svg.append("g")
        //     .attr('transform', 'translate(1120, '+ margin.top +')')
        //     .attr("class", "y axis _clear")
        //     .call(xAxis);





        y.domain(data.map(function(d) { return d.position; }));
        x.domain([0, d3.max(data, function(d) { return d.indentLevel; })]);
        svg.append("g")
            .attr("class", "x axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "y axis")
            .call(yAxis)







        // DATA
        var node = svg.selectAll("g.g-node")
                    .data(data, function(d) { return d.path });

        var nodeEnter = node.enter().append("svg:g")
            .attr("class", function(d) { return "g-node " + d.status; })

        nodeEnter
            .append("rect")
                .attr("class", function(d) { return "bar " + d.status; })
                .attr("height", 20)
                .attr("width", 300)

        nodeEnter
            .append("text")
                .attr("dy", 15)
                .attr("dx", 10)
                .style("text-anchor", "start")
                .text(function(d) { return d.path });


        // Transition nodes to their new position.
        var nodeUpdate = node.transition()
            .duration(World.duration)
            .attr("transform", function(d) {
                return "translate(" + 0 + "," + y(d.position) + ")";
            });

        var nodeExit = node.exit();

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
