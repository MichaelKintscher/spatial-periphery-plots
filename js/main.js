// Setting up the dimensions of the map container
const width = 1000;
const height = 1000;

// Setting up magnifier dimensions and radius
const magnifierRadius = 80;

// Creating an SVG container within the #control-map div
const svg = d3
  .select("#control-map")
  .append("svg")
  .attr("width", width)
  .attr("height", height);
const zoomedin = d3
  .select("#right-corner")
  .append("svg")
  .attr("width", 200)
  .attr("height", 200);

zoomedin
  .append("rect")
  .attr("width", "100%")
  .attr("height", "100%")
  .attr("fill", "black")
  .attr("stroke", "grey")
  .attr("stroke-width", 2);

// Loading the GeoJSON data and creating a US Map Projection
d3.json("data/us_states.json")
  .then(function (usMapData) {

    const projection = d3.geoAlbersUsa().fitSize([width, height], usMapData);
    const path = d3.geoPath().projection(projection);
    const mapGroup = svg.append("g");

    mapGroup
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("stroke", "grey")
      .attr("fill", "black")
      
    // Loading the CSV data
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

    // Creating a path generator using the zoomed-in projection
    const zoomedPath = d3.geoPath().projection(zoomedProjection);

    // Drawing the map in the zoomed-in rectangle
    const zoomedMapGroup = zoomedin.append("g");

    zoomedMapGroup
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", zoomedPath)
      .attr("stroke", "grey")
      .attr("fill", "black");

      d3.csv("data/filtered_data.csv")
      .then(function (loadedData) {
        // Assigning the loaded data to the global variable
        globalData = loadedData;
      })


    // Loading the CSV data for the zoomed-in map
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

  const initialradius = 30;

  initialradius;
  const redCircle = svg
  .append("circle")
  .attr("cx", width / 2)
  .attr("cy", height / 2)
  .attr("r", initialradius)
  .style("fill", "transparent")
  .style("stroke", "red")
  .style("cursor", "grab");

// Enabling dragging and zooming on the red circle
redCircle.call(d3.drag()
  .on("start", dragstarted)
  .on("drag", dragged)
  .on("end", dragended));

let zoomScale = 1;
redCircle.call(
  d3.zoom()
    .scaleExtent([1, 10])
    .on("zoom", function (event) {
      handleZoom(event);
      handleRedCircleDrag(redCircle.attr("cx"), redCircle.attr("cy"));
    })
);

// Drag handlers
function dragstarted(event) {
  d3.select(this).raise().classed("active", true);
}

function dragged(event) {
  const [x, y] = d3.pointer(event, svg.node());
  const transform = d3.zoomTransform(redCircle.node());
  const [scaledX, scaledY] = transform.invert([x, y]);
  d3.select(this).attr("cx", scaledX).attr("cy", scaledY);

  handleRedCircleDrag(scaledX, scaledY);
}

function dragended(event) {
  d3.select(this).classed("active", false);
}

//Zoom handlers
function handleZoom(event) {
  const transform = event.transform;
  redCircle.attr("transform", transform);
  zoomScale = transform.k;
  const scalingFactor = transform.k;
  currentradius = initialradius * scalingFactor;
}

function handleZoomz(event) {
  const transform = event.transform;
  zoomedMapGroup.attr("transform", transform);

}
const zoommap = d3.zoom().on("zoom", handleZoomz);

// Angle of a sector (e.g., 45 degrees)
// Can be made dynamic and allow user to select sector angle from
const sectorAngle = 180; 

// Haversine Formula to calculate distance and angle
function haversine(lat1, lon1, lat2, lon2, sectorAngle) {
// Radius of the Earth in kilometers
  const R = 6371;

// Convert latitude and longitude from degrees to radians
  const lat1Rad = (lat1 * Math.PI) / 180;
  const lon1Rad = (lon1 * Math.PI) / 180;
  const lat2Rad = (lat2 * Math.PI) / 180;
  const lon2Rad = (lon2 * Math.PI) / 180;

// Calculate differences in latitude and longitude
  const dLat = lat2Rad - lat1Rad;
  const dLon = lon2Rad - lon1Rad;

// Haversine formula
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1Rad) * Math.cos(lat2Rad) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

// Calculate distance
  const distance = R * c;

// Calculate the angle in degrees
  const angle = Math.atan2(dLon, dLat) * (180 / Math.PI);

  return { distance, angle };
}

// Function to calculate sector counts
function calculateSectorCounts(cx, cy,data, sectorAngle) {

  // Parse each attribute as float type
  const clickedY = parseFloat(cx);
  const clickedX = parseFloat(cy);

  console.log("---")
  console.log({clickedY}, {clickedX})
  console.log("---")

  const sectorCounts = {};

  // Calculate total number of sectors
  const totalSectors = Math.ceil(360 / sectorAngle);

  // Initialize counts for all sectors to 0
  for (let i = 1; i <= totalSectors; i++) {
    sectorCounts[i] = 0;
  }

  for (let i = 0; i < data.length; i++) {
    const point = data[i];

    // Parse each attribute as float type
    const dataY = parseFloat(point.Y)
    const dataX = parseFloat(point.X)
    const result = haversine(clickedY, clickedX, dataY, dataX, sectorAngle);

    // Normalize the angle to the range [0, 360)
    const normalizedAngle = (result.angle + 360) % 360
    
    // Determine the sector based on the normalized angle
    const sector = Math.floor(normalizedAngle / sectorAngle) + 1;

    // Count points in each sector
    sectorCounts[sector]++;
  }

  console.log('Intermediate sector counts:', sectorCounts);
  return sectorCounts;
}


// Function to handle red circle drag
function handleRedCircleDrag(cx, cy) {
  const projection = d3.geoAlbersUsa().fitSize([width, height], usMapData);
  const [mapLng, mapLat] = projection.invert([cx, cy]);
  
  // Get the center of the zoomed-in rectangle
  const zoomedinRect = zoomedin.node().getBoundingClientRect();
  const zoomedinCenterX = zoomedinRect.width / 2;
  const zoomedinCenterY = zoomedinRect.height / 2;

  // Calculate the translation values
  const translateX = zoomedinCenterX - cx;
  const translateY = zoomedinCenterY - cy;

  // Calculating the updated scaling factor based on the current and initial radius
  scale = 10-zoomScale

  // Updating the zoomed-in map to center on the red circle with the updated scaling factor
  const zoomedTransform = d3.zoomIdentity.translate(translateX, translateY).scale(scale);
  zoomedin.transition().duration(500).call(zoommap.transform, zoomedTransform);

  // Selecting and update the circles in the zoomed-in map
  zoomedin
    .selectAll("circle")
    .transition()
    .duration(500)
    .attr("transform", `translate(${translateX},${translateY}) scale(${scale})`)
    .attr("r", 0.5 / 2);

    calculateSectorCounts(mapLat, mapLng, globalData, sectorAngle);
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
    .style("fill", "white");
  })
  .catch(function (error) {
    console.log("Error loading GeoJSON data:", error);
  });