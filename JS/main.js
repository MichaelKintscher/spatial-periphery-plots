let focusX = 0; 
let focusY = 0;
let focusRadius = 250;

dataset_path = 'Data/Pokemon.csv';

let xAttribute ;
let yAttribute;
let colorAttribute;

let minimap_xScale, minimap_yScale;

const colorScale = d3.scaleOrdinal(d3.schemeCategory10);

document.addEventListener('DOMContentLoaded', function () {

    initPanel();

    
});

d3.select("#x-attribute-select").on("change", init_graphs);
d3.select("#y-attribute-select").on("change", init_graphs);
d3.select("#color-select").on("change", init_graphs);

function init_graphs(){

    d3.select("#detailView").selectAll("*").remove();
    d3.select("#miniChartContainer").selectAll("*").remove();
    d3.select("#contextView").selectAll("*").remove();

    xAttribute = document.getElementById("x-attribute-select").value;
    yAttribute = document.getElementById("y-attribute-select").value;
    colorAttribute = document.getElementById("color-select").value;

    miniMapPlotter();
    detailViewPlotter();
    contextPlotter();

    initZoom();
}

function initPanel() {

     
    d3.csv(dataset_path).then(data => {

        attributes = Object.keys(data[0]);
        //console.log('Attributes:', attributes);

        attributesFiltered = {
            quantitative : [],
            categorical : []
        }
    
        attributes.forEach(attribute => {

            if(!(['#','Name', 'Type 2'].includes(attribute))){

                const values = data.map(d => d[attribute]);
                const isQuantitative = values.every(value => !isNaN(value));
                if (isQuantitative) {
                    attributesFiltered.quantitative.push(attribute);
                } else {
                    attributesFiltered.categorical.push(attribute);
                }
            }
        });
    
        populateSelectOptions(d3.select("#x-attribute-select"), attributesFiltered.quantitative);
        populateSelectOptions(d3.select("#y-attribute-select"), attributesFiltered.quantitative);
        populateSelectOptions(d3.select("#color-select"), attributesFiltered.categorical);

        init_graphs();


    }).catch(error => {
        console.error('Error loading CSV file:', error);
    });
        
}

function populateSelectOptions(selectElement, options) {
    selectElement.selectAll("option").remove(); 
    options.forEach(option => {
        selectElement.append("option")
            .attr("value", option)
            .text(option);
    });
}

let zoom = d3.zoom()
            .scaleExtent([0.25, 10])
            .on('zoom', handleZoom);


function initZoom() {
    d3.select('#detailView').selectAll("*")
        .call(zoom);
    d3.select('#miniChartContainer').call(zoom);
}

function handleZoom(e) {
    d3.select('#detailView').select('g')
        .attr('transform', e.transform);

    d3.select('#zoomRect')
    //.call(zoom.scaleBy, 1.5)
    .attr('transform', e.transform)
    //.attr("transform", "translate(" + minimap_xScale(-e.transform.x) + "," + minimap_yScale(- e.transform.y)+ ")")
    ;
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
        .attr("r", 250) 
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
        .attr("cy", height / 2 )
        .attr("r", 250)
        .attr("fill", "black");

    // Read the data
    d3.csv(dataset_path).then(function(data) {

        // Compute minimum and maximum values for x and y axes
        const xMin = d3.min(data, d => parseFloat(d[xAttribute])) - 10;
        const xMax = d3.max(data, d => parseFloat(d[xAttribute])) + 10;
        const yMin = d3.min(data, d => parseFloat(d[yAttribute])) - 10;
        const yMax = d3.max(data, d => parseFloat(d[yAttribute])) + 10;

        console.log(xMax);

        xScale = d3.scaleLinear()
                        .domain([xMin, xMax])
                        .range([0, width]);

        yScale = d3.scaleLinear()
                        .domain([yMin, yMax])
                        .range([height, 0]);

        // Add data points
        const circles = svg_g.selectAll(".scatter-point")
                        .data(data)
                        .join(
                            enter => enter.append("circle")
                                        .attr("class", "scatter-point")
                                        .attr("id", (d, i) => "point-" + i)
                                        .attr("cx", 
                                        d => xScale(d[xAttribute]))
                                        .attr("cy", 
                                        d => yScale(d[yAttribute]))
                                        .attr("r", 4)
                                        .style("fill", d => colorScale(d[colorAttribute]))
                                        .style('opacity', 0)
                                        .attr("clip-path", "url(#circleMask)")
                                        .call(enter => enter.transition().duration(1000)
                                            .style('opacity', 1)),

                            update => update.call(update => update.transition().duration(1000)
                            .attr("cx", d => xScale(d[xAttribute]))
                            .attr("cy", d => yScale(d[yAttribute]))
                            .style("fill", '#000'))
                        
                        );

        circles

        // Add x-axis
        svg_g.append("g")
            .attr("transform", "translate(0," + height + ")")
            .transition().duration(750)
            .call(d3.axisBottom(xScale));

        svg_g.append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 20)
            .style("text-anchor", "middle")
            .text(xAttribute);
            
        // Add y-axis
        svg_g.append("g")
            .transition().duration(750)
            .call(d3.axisLeft(yScale));

        svg_g.append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yAttribute);
            

    });
}


function miniMapPlotter() {
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;

    var svg = d3.select("#miniChartContainer")
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
    d3.csv(dataset_path).then(function(data) {
        // Compute minimum and maximum values for x and y axes
        const xMin = d3.min(data, d => parseFloat(d[xAttribute])) - 10;
        const xMax = d3.max(data, d => parseFloat(d[xAttribute])) + 10;
        const yMin = d3.min(data, d => parseFloat(d[yAttribute])) - 10;
        const yMax = d3.max(data, d => parseFloat(d[yAttribute])) + 10;

        console.log(xMax);

        minimap_xScale = d3.scaleLinear()
                        .domain([xMin, xMax])
                        .range([0, width]);

        minimap_yScale = d3.scaleLinear()
                        .domain([yMin, yMax])
                        .range([height, 0]);

        // Add data points
        const circles = svg.selectAll(".scatter-point")
                        .data(data)
                        .join(
                            enter => enter.append("circle")
                                        .attr("class", "scatter-point")
                                        .attr("id", (d, i) => "point-" + i)
                                        .attr("cx", 
                                        d => minimap_xScale(d[xAttribute]))
                                        .attr("cy", 
                                        d => minimap_yScale(d[yAttribute]))
                                        .attr("r", 2)
                                        .style("fill", d => colorScale(d[colorAttribute]))
                                        .style('opacity', 0)
                                        .call(enter => enter.transition().duration(1000)
                                            .style('opacity', 1)),

                            update => update.call(update => update.transition().duration(1000)
                            .attr("cx", d => minimap_xScale(d[xAttribute]))
                            .attr("cy", d => minimap_yScale(d[yAttribute]))
                            .style("fill", '#000'))
                        
                        );

        circles

        // Add x-axis
        svg.append("g")
            .attr("transform", "translate(0," + height + ")")
            .transition().duration(750)
            .call(d3.axisBottom(minimap_xScale));

        svg.append("text")
            .attr("class", "x-axis-title")
            .attr("x", width / 2)
            .attr("y", height + margin.top + 20)
            .style("text-anchor", "middle")
            .text(xAttribute);
            
        // Add y-axis
        svg.append("g")
            .transition().duration(750)
            .call(d3.axisLeft(minimap_yScale));

        svg.append("text")
            .attr("class", "y-axis-title")
            .attr("transform", "rotate(-90)")
            .attr("x", 0 - (height / 2))
            .attr("y", 0 - margin.left)
            .attr("dy", "1em")
            .style("text-anchor", "middle")
            .text(yAttribute);
            
        
    });

    svg.append("circle")
        .attr("cx", width / 2)
        .attr("cy", height / 2)
        .attr("id", "zoomRect")
        .attr("r", Math.min(width, height) / 2)
        .attr('stroke', 'black')
        .attr('fill-opacity', 0.1);
}

function contextPlotter() {
    // set the dimensions and margins of the graph

    var margin = { top: 10, right: 60, bottom: 30, left: 60 },
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom,
    innerRadius = 250,
    outerRadius = 300;   // the outerRadius goes from the middle of the SVG area to the border

    // append the svg object to the body of the page
    var svg = d3.select("#detailView").select('svg')
    //.append("svg")
    //.attr("width", width + margin.left + margin.right)
    //.attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + width / 2 + "," + ( height/2)+ ")"); // Add 100 on Y translation, cause upper bars are longer

    d3.csv('Data/test_data.csv').then(function(data) {

        // X scale
        var x = d3.scaleBand()
        .range([0, 2 * Math.PI])    // X axis goes from 0 to 2pi = all around the circle. If I stop at 1Pi, it will be around a half circle
        .align(0)                  // This does nothing ?
        .domain( data.map(function(d) { return d.Country; }) ); // The domain of the X axis is the list of states.

        // Y scale
        var y = d3.scaleRadial()
        .range([innerRadius, outerRadius])   // Domain will be define later.
        .domain([0, 10000]); // Domain of Y is from 0 to the max seen in the data

        // Add bars
        svg.append("g")
        .selectAll("path")
        .data(data)
        .enter()
        .append("path")
        .attr("fill", "#69b3a2")
        .attr("d", d3.arc()     // imagine your doing a part of a donut plot
            .innerRadius(innerRadius)
            .outerRadius(function(d) { return y(d['Value']); })
            .startAngle(function(d) { return x(d.Country); })
            .endAngle(function(d) { return x(d.Country) + x.bandwidth(); })
            .padAngle(0.01)
            .padRadius(innerRadius))

    });
}



function toRadians(degrees) {
    return degrees * (Math.PI / 180);
}
