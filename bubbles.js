(function () {

	var margin = {top:30, right:30, bottom:30, left:30},
		width = 1600 - margin.left - margin.right,
		height = 1000 - margin.top - margin.bottom;

	var svg = d3.select("#chart")
		.append("svg")
		.attr("height", height)
		.attr("width", width)
		.append("g")
		.attr("transform", "translate(800, 500)")

	var rectW = 350, rectH = 350;
	var rectWCoor = rectW / 2; rectHCoor = rectH / 2;

	var rectCoor = {x:[-rectWCoor - margin.left	,
										width/2 - 2*margin.right - rectW,
										width/2 - 2*margin.right - rectW,
										-width/2,
										-width/2],
									y:[-rectHCoor - margin.top,
										-height/2,
										 height/2 - 2*margin.bottom - rectH,
										 height/2 - 2*margin.bottom - rectH,
										-height/2],
								textV:["Huge Volume",
											"Low Volume",
											"Lower Volume",
											"Mid Volume",
											"High Volume"],
								textN:["Most Frequent",
											"Just Once",
											"Less Frequent",
											"Mid Frequent",
											"Frequent"],

										}


	var radiusScale = d3.scaleSqrt().domain([1, 60]).range([2, 40])
// the simulation is a collection of force
// about where we want our circles to go and
// how we want them to interact
// ONE: get them to the middle
// TWO: don't collide them
	var forceX = d3.forceX(function(d) {
		return -margin.left;
	}).strength(0.03)

	var forceY = d3.forceY(function(d) {
		return -margin.top;
	}).strength(0.03)

	// define force for sales
	var forceSalesX = d3.forceX(function(d) {
		var radius = Number(d.radius);
		if(radius === 1) {
			return rectCoor.x[1] + rectWCoor;
		} else if(radius === 2 || radius === 3) {
			return rectCoor.x[2] + rectWCoor;
		} else if(radius > 14) {
			return -margin.left;
		} else {
			return rectCoor.x[3] + rectWCoor;
		}
	}).strength(0.05)

	var forceSalesY = d3.forceY(function(d) {
		var radius = Number(d.radius);
		if(radius === 1) {
			return rectCoor.y[1] + rectHCoor;
		} else if(radius === 2 || radius === 3) {
			return rectCoor.y[2] + rectHCoor;
		} else if(radius >= 4 && radius <= 6) {
			return rectCoor.y[3] + rectHCoor;
		} else if(radius > 6 && radius <= 14) {
			return rectCoor.y[4] + rectHCoor;
		} else if(radius > 14) {
			return -margin.top;
		} else {
			return 0.3*height;
		}
	}).strength(0.05)

	// define force for volume of sales [€]
	var forceSumX = d3.forceX(function(d) {
		if(Number(d.sum) < 25000) {
			return rectCoor.x[1] + rectWCoor;
		} else if(Number(d.sum) > 25000 && Number(d.sum) < 200000) {
			return rectCoor.x[3] + rectWCoor;
		} else {
			return -margin.right;
		}
	}).strength(0.05)

	var forceSumY = d3.forceY(function(d) {
		if(Number(d.sum) <= 10000) {
			return rectCoor.y[1] + rectHCoor;
		} else if(Number(d.sum) > 10000 && Number(d.sum) < 25000) {
			return rectCoor.y[2] + rectHCoor;
		} else if(Number(d.sum) > 25000 && Number(d.sum) < 70000) {
			return rectCoor.y[3] + rectHCoor;
		} else if(Number(d.sum) > 70000 && Number(d.sum) < 200000) {
			return rectCoor.y[4] + rectHCoor;
		} else {
			return -margin.top;
		}
	}).strength(0.05)

	//value for anti-collision
	var forceCollide = d3.forceCollide(function(d) {
		return radiusScale(d.radius) + 3.5;
	})

	// starting the simulation
	var simulation = d3.forceSimulation()
		.force("x", forceX)
		.force("y", forceY)
		.force("anticollide", forceCollide)

	d3.queue()
		.defer(d3.csv, "coordinates.csv")
		.await(ready)


// creating the bubbles and acessing functionality to the
// buttons
	function ready (error, datapoints) {

		var div = d3.select("body").append("div")
		    .attr("class", "tooltip")
		    .style("opacity", 0);

		// variables for color scale
		var minVolume = function(d) {
			d3.min(d3.values(d.sum));
		}

		var maxVolume = function(d) {
			d3.max(d3.values(d.sum))
		}

		var colors = d3.scaleLinear()
			.domain([10000, 70000, 450000])
			.range([d3.rgb("#ffffff"), d3.rgb("#ff00bf"), d3.rgb('#000000')]);
			//.range(["green", "blue", "yellow", "red"])

		var circles = svg.selectAll(".artist")
			.data(datapoints)
			.enter().append("circle")
			.attr("class", "artist")
			.attr("r", function(d) {
				return radiusScale(d.radius)
			})
			.attr("fill", function(d) {return colors(d.sum); })
			//.attr("stroke", "white")
			.on("mouseover", function(d) {
       			div.transition()
         			.duration(200)
         			.style("opacity", .9);
		       	div.html("n: " + Number(d.radius) + "<br/>" +
					"ID: " + Number(d.customerID) + "<br>" +
					"€ : " + d.sum)
		        	.style("left", (d3.event.pageX) + "px")
		         	.style("top", (d3.event.pageY - 28) + "px");
			})
			.on("mouseout", function(d) {
		       div.transition()
		         	.duration(500)
		         	.style("opacity", 0);
       });



			 function tabulate(data, columns) {

			     var table = d3.select('body').append("table")
						//.attr("x", 160)
						.attr("style", "margin-left: 770px")
						.attr("class", "table-bordered")
			            .style("border-collapse", "collapse")
	                 	.style("border", "2px black solid");
			         thead = table.append("thead"),
			         tbody = table.append("tbody");

			     // append the header row
			     thead.append("tr")
			         .selectAll("th")
			         .data(columns)
			         .enter()
			         .append("th")
			             .text(function(column) { return column; })
					 .style("border", "1px black solid")
					 .style("padding", "5px")
					 .style("background-color", "lightgray")
					 .style("font-weight", "bold");

			     // create a row for each object in the data
			     var rows = tbody.selectAll("tr")
			         .data(data)
			         .enter()
			         .append("tr")
					 .style("border", "1px black solid")
					 .style("padding", "5px");

			     // create a cell in each row for each column
			     var cells = rows.selectAll("td")
			         .data(function(row) {
			             return columns.map(function(column) {
			                 return {column: column, value: row[column]};
			             });
			         })
			         .enter()
			         .append("td")
			         .attr("style", "font-family: Courier") // sets the font style
			             .html(function(d) { return d.value; });

			     return table;
};




	  // define rectangles for grouping of bubbles
    var addRectangles = function(t) {
			for(var i=0; i<5; i++) { svg.append("rect")
				.data(datapoints)
				.attr("x", rectCoor.x[i])
				.attr("y", rectCoor.y[i])
				.attr("opacity", .15)
				.attr("width", rectW)
				.attr("height", rectH)
				.attr("fill", "white")
				.attr("rx", 20, "ry", 20)
				.on("mouseover", function(d) {
						d3.select(this)
							.style('fill', 'blue')
							.on('click', function(d){
								tabulate(datapoints, ["customerID", 'sum', 'radius'])
								d3.selectAll('table').raise()
							})
				})
				.on("mouseout", function() {
						d3.select(this)
							.style('fill', 'white')
							//d3.selectAll('table').remove()
				})
				svg.append("text")
					.attr("x", rectCoor.x[i]+30)
					.attr("y", rectCoor.y[i]+30)
					.attr("font-size", "18px")
					.attr("fill", "brown")
					.text(t[i]);
			}
		}
		
		
		
		
		
		// selecting different types of data
		d3.select("#volume").on("click", function() {
			d3.selectAll("text").remove();
			d3.selectAll("rect").remove();
			addRectangles(rectCoor.textV);
			d3.selectAll('circle').raise();
			simulation
				.force("x", forceSumX)
				.force("y", forceSumY)
				.force("anticollide", forceCollide)
				.alphaTarget(0.3)
				.restart()
		})

		d3.select("#nSales").on("click", function() {
			d3.selectAll("text").remove();
			d3.selectAll("rect").remove();
			addRectangles(rectCoor.textN);
			d3.selectAll('circle').raise();
			simulation
				.force("x", forceSalesX)
				.force("y", forceSalesY)
				.force("anticollide", forceCollide)
				.alphaTarget(0.5)
				.restart()
		})

		d3.select("#unsorted").on("click", function() {
			d3.selectAll("text").remove();
			d3.selectAll("rect").remove();
			simulation
				.force("x", forceX)
				.force("y", forceY)
				.force("anticollide", forceCollide)
				.alphaTarget(0.3)
				.restart()
		})



		simulation.nodes(datapoints)
			.on("tick", ticked)

		function ticked() {
			circles
				.attr("cx", function(d) {
					return d.x
				})
				.attr("cy", function(d) {
					return d.y
				})
		}
	}
})();
