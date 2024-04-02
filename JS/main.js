let focusX = 0; 
let focusY = 0;
let focusRadius = 175;

document.addEventListener('DOMContentLoaded', function () {
    // Loading the dataset.
    miniMapPlotter();
    detailViewPlotter();
    contextPlotter();

    // Make the chart draggable
    const chartContainer = document.getElementById("miniChartContainer");
    let isDragging = false;
    let offset = { x: 0, y: 0 };

    chartContainer.addEventListener("mousedown", startDrag);
    chartContainer.addEventListener("mouseup", endDrag);
    chartContainer.addEventListener("mousemove", drag);

    function startDrag(event) {
        isDragging = true;
        offset.x = event.clientX - chartContainer.getBoundingClientRect().left;
        offset.y = event.clientY - chartContainer.getBoundingClientRect().top;
    }

    function endDrag() {
        isDragging = false;
    }

    function drag(event) {
        if (isDragging) {
            chartContainer.style.left = event.clientX - offset.x + "px";
            chartContainer.style.top = event.clientY - offset.y + "px";
            adjustFocusControl(); 
            updateDetailView(); 
        }
    }

    initZoom();
});

let zoom = d3.zoom()
            .scaleExtent([0.25, 10])
            .on('zoom', handleZoom);


function initZoom() {
    d3.select('#detailView').selectAll("*")
        .call(zoom);
    d3.select('#zoomRect').call(zoom);
}

function handleZoom(e) {
    d3.select('#detailView').select('g')
        .attr('transform', e.transform);

    d3.select('#zoomRect')
    .attr('transform', e.transform);
}

function zoomIn(ratio) {
    d3.select('#detailView').selectAll("*")
        //.transition()
        .call(zoom.scaleBy, ratio);

    d3.select('#zoomRect')
    //.transition()
    .call(zoom.scaleBy, 1/ratio);
}

function resetZoom() {
    d3.select('#detailView').selectAll("*")
        //.transition()
        .call(zoom.scaleTo, 1);
}

function center() {
    d3.select('#detailView').selectAll("*")
        //.transition()
        .call(zoom.translateTo, 0.5 * 1600, 0.5 * 800);
}

function pan(xp) {
    d3.select('#detailView').selectAll("*")
        //.transition()
        .call(zoom.translateBy, xp, 0);

    d3.select('#zoomRect')
    //.transition()
    .call(zoom.translateBy, (310/1200)*xp, 0);
}

function detailViewPlotter() {
    var margin = { top: 10, right: 60, bottom: 30, left: 60 },
        width = 1200 - margin.left - margin.right,
        height = 800 - margin.top - margin.bottom;

    var svgContainer = d3.select("#detailView");

    var svg = svgContainer.append("svg")
        .attr("width", "100%")
        .attr("height", "100%")
        .attr("viewBox", `0 0 ${width} ${height}`);

    var svg_g = svg.append('g');

    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 175) 
        .attr("fill", "none")
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    svg.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white")
        .attr("mask", "url(#circleMask)");
        
    var defs = svg.append("defs");
    var mask = defs.append("mask")
        .attr("id", "circleMask");

    mask.append("rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height)
        .attr("fill", "white");

    mask.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", 175)
        .attr("fill", "black");

    // Read the data
    d3.csv("consumption-co2-per-capita.csv").then(function(data) {
        const groups = ["Asia (excl. China and India)", "United States", "Europe", "India", "China"]

        data.forEach(function(d) {
            d.year = new Date(+d.Year, 0, 1);
            d.co2_emission = +d.Per_capita_consumption_based_CO2_emissions;
            d.country = +d.Entity;
        });

        // Set up scales
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => d.year))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => d.co2_emission)])
            .range([height, 0]);

        // Color scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        // Draw circles
        svg_g.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.year))
            .attr("cy", d => yScale(d.co2_emission))
            .attr("r", 3)
            .attr("fill", d => color(d.Entity))
            .attr("clip-path", "url(#circleMask)");

        // Add axes
        svg_g.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        svg_g.append("g")
            .call(d3.axisLeft(yScale));
    });
}


function miniMapPlotter() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#myDataVis")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    svg.append("defs")
        .append("clipPath")
        .attr("id", "miniCircularMask")
        .append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("r", Math.min(width, height) / 2)
        .attr("stroke", "black")
        .attr("stroke-width", 2);

    // Read the data
    d3.csv("consumption-co2-per-capita.csv").then(function(data) {
        const xScale = d3.scaleTime()
            .domain(d3.extent(data, d => new Date(+d.Year, 0, 1)))
            .range([0, width]);

        const yScale = d3.scaleLinear()
            .domain([0, d3.max(data, d => +d.Per_capita_consumption_based_CO2_emissions)])
            .range([height, 0]);

        // Color scale
        var color = d3.scaleOrdinal(d3.schemeCategory10);

        // Add dots
        svg.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(new Date(+d.Year, 0, 1)))
            .attr("cy", d => yScale(+d.Per_capita_consumption_based_CO2_emissions))
            .attr("r", 2)
            .attr("fill", d => color(d.Entity)); 

        // Add axes
        svg.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(d3.axisBottom(xScale));

        svg.append("g")
            .call(d3.axisLeft(yScale));
    });

    svg.append('rect')
        .attr("id", "zoomRect")
        .attr('x', 0)
        .attr('y', 0)
        .attr('width', width)
        .attr('height', height)
        .attr('stroke', 'black')
        .attr('fill-opacity', 0.1)
        .attr("clip-path", "url(#miniCircularMask)");
}

function contextPlotter() {
    var contextRadius = 10 * focusRadius; 
    var contextResolution = 10;
    var barWidth = 10; 

    var svg = d3.select("#detailView svg");

    var contextData = [];
    var angleIncrement = 360 / contextResolution;
    for (var i = 0; i < contextResolution; i++) {
        var startAngle = i * angleIncrement;
        var endAngle = (i + 1) * angleIncrement;
        contextData.push({
            startAngle: startAngle,
            endAngle: endAngle,
            innerRadius: focusRadius,
            outerRadius: contextRadius,
            value: 0
        });
    }

    svg.selectAll(".contextBar")
        .data(contextData)
        .enter()
        .append("rect")
        .attr("class", "contextBar")
        .attr("x", function(d) {
            return focusX + (d.outerRadius * Math.cos(toRadians(d.startAngle))) - focusRadius;
        })
        .attr("y", function(d) {
            return focusY + (d.outerRadius * Math.sin(toRadians(d.startAngle))) - focusRadius;
        })
        .attr("width", barWidth)
        .attr("height", function(d) {
            return d.value; 
        })
        .attr("fill", "blue")
        .attr("stroke", "black")
        .attr("opacity", 0.5);
}



function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
