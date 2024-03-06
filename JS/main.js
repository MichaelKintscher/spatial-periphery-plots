
document.addEventListener('DOMContentLoaded', function () {
    // Loading the dataset.
 
    miniMapPlotter()

    // Make the chart draggable
    const chartContainer = document.getElementById("mini-chart-container");
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
         
 });


 function miniMapPlotter(){
    // set the dimensions and margins of the graph
    // var margin = {top: 10, right: 30, bottom: 30, left: 60},
    //     width = 300 - margin.left - margin.right,
    //     height = 250 - margin.top - margin.bottom;
    
    // append the svg object to the body of the page
    // create svg element:
    var svg = d3.select("#myDataVis").append("svg").attr("width", 2000).attr("height", 2000)

// Add the path using this helper function
    svg.append('circle')
    .attr('cx', 300)
    .attr('cy', 300)
    .attr('r', 150)
    .attr('stroke', 'black')
    .attr('fill', 'white');

    // var svg = d3.select("#myDataVis")
    //   .append("svg")
    //     .attr("width", width + margin.left + margin.right)
    //     .attr("height", height + margin.top + margin.bottom)
    //   .append("g")
    //     .attr("transform",
    //           "translate(" + margin.left + "," + margin.top + ")");
    
    //Read the data
    d3.csv("../spatial-periphery-plots/consumption-co2-per-capita.csv").then(function(data) {
        
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

    
 }