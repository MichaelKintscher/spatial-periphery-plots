// Set up the dimensions of the map container
const width = 1000;
const height = 1000;

// Set up magnifier dimensions and radius
const magnifierRadius = 80;

// Create an SVG container within the #control-map div
const svg = d3
  .select("#control-map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
const zoomedin = d3
  .select("#right-corner")
  .append("svg")
  .attr("width", 200) // Adjust the width as needed
  .attr("height", 200); // Adjust the height as needed;

zoomedin
  .append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "black")
  .attr("stroke", "grey")
  .attr("stroke-width", 2);

// Load the GeoJSON data
d3.json("data/us_states.json")
  .then(function (usMapData) {
    // Create a projection for the US map
    const projection = d3.geoAlbersUsa().fitSize([width, height], usMapData);

    // Create a path generator using the projection
    const path = d3.geoPath().projection(projection);

    // Draw the map
    const mapGroup = svg.append("g"); // Create a group for the map
    const map = mapGroup
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "grey")
      .attr("fill", "black") // You can customize the fill color
      .on("click", handleMapClick);
    // Load your CSV data
    d3.csv("data/filtered_data.csv")
      .then(function (data) {
        svg
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => {
            const projected = projection([d.X, d.Y]);
            return projected ? projected[0] : null;
          })
          .attr("cy", (d) => {
            const projected = projection([d.X, d.Y]);
            return projected ? projected[1] : null;
          })
          .attr("r", 0.5)
          .style("fill", (d) => getCircleColor(d.SUBTYPE));
      })
      .catch(function (error) {
        console.log("Error loading CSV data:", error);
      });

    const zoomedProjection = d3.geoAlbersUsa().fitSize([200, 200], usMapData);

    // Create a path generator using the zoomed-in projection
    const zoomedPath = d3.geoPath().projection(zoomedProjection);

    // Draw the map in the zoomed-in rectangle
    const zoomedMapGroup = zoomedin.append("g");
    const zoomedMap = zoomedMapGroup
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", zoomedPath)
      .attr("stroke", "grey")
      .attr("fill", "black");

    // Load your CSV data for the zoomed-in map
    d3.csv("data/filtered_data.csv")
      .then(function (data) {
        zoomedin
          .selectAll("circle")
          .data(data)
          .enter()
          .append("circle")
          .attr("cx", (d) => {
            const projected = zoomedProjection([d.X, d.Y]);
            return projected ? projected[0] : null;
          })
          .attr("cy", (d) => {
            const projected = zoomedProjection([d.X, d.Y]);
            return projected ? projected[1] : null;
          })
          .attr("r", 0.5)
          .style("fill", (d) => getCircleColor(d.SUBTYPE));
      })
      .catch(function (error) {
        console.log("Error loading CSV data:", error);
      });

    // Define the zoom behavior
    const zoom = d3.zoom().on("zoom", handleZoom);

    // Apply zoom to the SVG element
    svg.call(zoom);

    // Append the magnifier circle
    const magnifier = svg
      .append("circle")
      .attr("cx", width / 2)
      .attr("cy", height / 2)
      .attr("r", magnifierRadius)
      .style("fill", "none")
      .style("stroke", "red")
      .style("stroke-width", 2)
      .call(d3.drag().on("drag", handleMagnifierDrag))
      .on("click", handleMapClick);

    // Zoom handler function
    function handleZoom(event) {
      // Get the current transform state
      const transform = event.transform;

      // Apply the zoom transformation to the magnifier
      magnifier.attr("transform", transform);
    }

    // Magnifier drag handler function
    function handleMagnifierDrag(event) {
      // Get the position of the mouse relative to the circle's center
      const [mouseX, mouseY] = d3.pointer(event, this);
      const circleCenterX = parseFloat(magnifier.attr("cx"));
      const circleCenterY = parseFloat(magnifier.attr("cy"));
      const offsetX = mouseX - circleCenterX;
      const offsetY = mouseY - circleCenterY;

      // Update the magnifier position
      magnifier.attr("cx", mouseX).attr("cy", mouseY);
    }

    function handleZoomz(event) {
      // Get the current transform state
      const transform = event.transform;

      // Apply the zoom transformation to the magnifier
      zoomedMapGroup.attr("transform", transform);
    }
    const zoommap = d3.zoom().on("zoom", handleZoomz);


    function handleMapClick(event) {
      // Get the coordinates of the clicked point on the main map
      const [clickedX, clickedY] = d3.pointer(event, svg.node());
    
      // Convert the clicked coordinates to the map projection coordinates
      const projection = d3.geoAlbersUsa().fitSize([width, height], usMapData);
      const [mapLng, mapLat] = projection.invert([clickedX, clickedY]);
    
      // Get the center of the zoomedin rectangle
      const zoomedinRect = zoomedin.node().getBoundingClientRect();
      const zoomedinCenterX = zoomedinRect.width / 2;
      const zoomedinCenterY = zoomedinRect.height / 2;
    
      // Calculate the translation values
      const translateX = zoomedinCenterX - clickedX;
      const translateY = zoomedinCenterY - clickedY;
    
      console.log("TranslateX:", translateX);
      console.log("TranslateY:", translateY);
    
      // Update the zoomed-in map to center on the clicked point
      const zoomedTransform = d3.zoomIdentity.translate(translateX, translateY).scale(4); // You can adjust the scale factor as needed
    
      // Apply the zoom transformation to the zoomed-in map
      zoomedin.transition().duration(500).call(zoommap.transform, zoomedTransform);
    
      // Select and update the circles in the zoomed-in map
      zoomedMapGroup
        .selectAll("circle")
        .transition()
        .duration(500)
        .attr("transform", `translate(${translateX},${translateY}) scale(4)`)
        .attr("r", 0.5 * 4); // Scale the radius to match the zoom level
    }
    
    
    
    

    function getCircleColor(subtype) {
      switch (subtype) {
        case "BUDDHIST":
          return "blue";
        case "CHRISTIAN":
          return "green";
        case "HINDU":
          return "red";
        case "JUDAIC":
          return "yellow";
        case "MUSLIM":
          return "pink";
        case "OTHER":
          return "brown";
        default:
          return "black";
      }
    }

    const legend = svg
    .append("g")
    .attr("class", "legend")
    .attr("transform", "translate(30, 30)");

  const legendData = [
    "BUDDHIST",
    "CHRISTIAN",
    "HINDU",
    "JUDAIC",
    "MUSLIM",
    "OTHER",
  ];

  legend
    .selectAll("rect")
    .data(legendData)
    .enter()
    .append("rect")
    .attr("x", 0)
    .attr("y", (d, i) => i * 20)
    .attr("width", 15)
    .attr("height", 15)
    .attr("transform", `translate(${395}, 0)`)
    .style("fill", (d) => {
      if (d === "BUDDHIST") return "blue";
      if (d === "CHRISTIAN") return "green";
      if (d === "HINDU") return "red";
      if (d === "JUDAIC") return "yellow";
      if (d === "MUSLIM") return "pink";
      if (d === "OTHER") return "brown";
    });

    legend
    .selectAll("text")
    .data(legendData)
    .enter()
    .append("text")
    .attr("x", 20)
    .attr("y", (d, i) => i * 20 + 12)
    .attr("transform", `translate(${400}, 0)`)
    .text((d) => d)
    .style("fill", "white"); // Set text color to white
  })
  .catch(function (error) {
    console.log("Error loading GeoJSON data:", error);
  });
