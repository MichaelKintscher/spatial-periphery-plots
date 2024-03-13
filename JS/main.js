
document.addEventListener('DOMContentLoaded', function () {
    // Loading the dataset.
 
    miniMapPlotter();

    detailViewPlotter();

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

function detailViewPlotter(){

    var margin = {top: 10, right: 60, bottom: 30, left: 60},
    width = 1200 - margin.left - margin.right,
    height = 800 - margin.top - margin.bottom;

    var svgContainer = d3.select("#detailView");
    
    svgContainer.append("defs")
      .append("clipPath")
      .attr("id", "rectangularMask")
      .append("rect")
      .attr("x", 150) // Adjust as needed
      .attr("y", 150) // Adjust as needed
      .attr("width", 100) // Adjust as needed
      .attr("height", 100); // Adjust as needed


    var svg = d3.select("#detailView")
                .append("svg")
                .attr("width", 1600)
                .attr("height", 800)
                .attr("transform", "translate(" + margin.left + "," + margin.top + ")")
                .attr("clip-path", "url(#circularMask)")
                ;

    var svg_g = svg.append('g');

    // Adding a movable svg under a clipping mask
    

    //Read the data
    d3.csv("consumption-co2-per-capita.csv").then(function(data) {
        
        const groups = ["Asia (excl. China and India)", "United States", "Europe", "India", "China"]

        data.forEach(function(d) {
            //if(groups.includes(d.Entity)){
            d.year = new Date(+d.Year, 0, 1);
            d.co2_emission = +d.Per_capita_consumption_based_CO2_emissions;
            d.country = +d.Entity;//}
        });

        console.log(data)

        // Add X axis
        // Set up scales
        const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

        const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.co2_emission)])
        .range([height, 0]);
        
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        
        // Add dots
        // Draw circles
        svg_g.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => 
        xScale(d.year))
        .attr("cy", d => yScale(d.co2_emission))
        .attr("r", 3)
        .attr("fill", d => 
          color(d.Entity));

        // Add axes
        svg_g.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

        svg_g.append("g")
        .call(d3.axisLeft(yScale));
        }) 



}

 function miniMapPlotter(){
    // set the dimensions and margins of the graph
    var margin = {top: 10, right: 30, bottom: 30, left: 60},
        width = 400 - margin.left - margin.right,
        height = 300 - margin.top - margin.bottom;
    

    var svg = d3.select("#myDataVis")
      .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
      .append("g")
        .attr("transform",
              "translate(" + margin.left + "," + margin.top + ")");

    
    //Read the data
    d3.csv("consumption-co2-per-capita.csv").then(function(data) {
        
        const groups = ["Asia (excl. China and India)", "United States", "Europe", "India", "China"]

        data.forEach(function(d) {
            //if(groups.includes(d.Entity)){
            d.year = new Date(+d.Year, 0, 1);
            d.co2_emission = +d.Per_capita_consumption_based_CO2_emissions;
            d.country = +d.Entity;//}
        });

        console.log(data)

        // Add X axis
        // Set up scales
        const xScale = d3.scaleTime()
        .domain(d3.extent(data, d => d.year))
        .range([0, width]);

        const yScale = d3.scaleLinear()
        .domain([0, d3.max(data, d => d.co2_emission)])
        .range([height, 0]);
        
        // Color scale: give me a specie name, I return a color
        var color = d3.scaleOrdinal(d3.schemeCategory10)
        
        // Add dots
        // Draw circles
        svg.selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("cx", d => 
        xScale(d.year))
        .attr("cy", d => yScale(d.co2_emission))
        .attr("r", 2)
        .attr("fill", d => 
          color(d.Entity));

        // Add axes
        svg.append("g")
        .attr("transform", `translate(0, ${height})`)
        .call(d3.axisBottom(xScale));

        svg.append("g")
        .call(d3.axisLeft(yScale));
        }) 

        svg.append('rect')
            .attr("id", "zoomRect")
            .attr('x', 0)
            .attr('y', 0)
            .attr('width', 310)
            .attr('height', 260)
            .attr('stroke', 'black')
            .attr('fill-opacity', 0.1);

    
 }
// //this is the funtion for the detail view
//  function detailview(){
    // create svg element:
    

// //I cannot make the zoom function with out the data but this link:
// //https://www.d3indepth.com/zoom-and-pan/
// //it should help make it, go to the last example and press "edit in codepen" as it will say how it got it to work

    
//  }