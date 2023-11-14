d3.json("data/us_states.json").then(function (usMapData) {
  d3.csv("data/All_Places_of_Worship.csv").then(function (data) {
    const svg = d3
      .select("#detail-view")
      .append("svg")
      .attr("width", 800)
      .attr("height", 600);
    const projection = d3.geoAlbersUsa().fitSize([2400, 1800], usMapData);
    const path = d3.geoPath().projection(projection);

    svg
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#fffacd")
      .attr("stroke", "black");

    svg
      .selectAll("circle")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const projected = projection([d.X, d.Y]);
        if (projected) {
          return projected[0];
        } else {
          return;
        }
      })
      .attr("cy", (d) => {
        const projected = projection([d.X, d.Y]);
        if (projected) {
          return projected[1];
        } else {
          return;
        }
      })
      .attr("r", 0.9)
      .style("fill", (d) => {
        if (d.SUBTYPE === "BUDDHIST") return "blue";
        if (d.SUBTYPE === "CHRISTIAN") return "green";
        if (d.SUBTYPE === "HINDU") return "red";
        if (d.SUBTYPE === "JUDAIC") return "yellow";
        if (d.SUBTYPE === "MUSLIM") return "pink";
        if (d.SUBTYPE === "OTHER") return "brown";
      });
  });
});

// Load US map data
d3.json("data/us_states.json").then(function (usMapData) {
  // Load Places of Worship data
  d3.csv("data/All_Places_of_Worship.csv").then(function (data) {
    const svg = d3
      .select("#control-map")
      .append("svg")
      .attr("width", 530)
      .attr("height", 280);

    const projection = d3.geoAlbersUsa().fitSize([400, 280], usMapData);
    const path = d3.geoPath().projection(projection);

    svg
      .selectAll("path")
      .data(usMapData.features)
      .enter()
      .append("path")
      .attr("d", path)
      .attr("fill", "#d3d3d3")
      .attr("stroke", "black");

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

    // Add the Focus Control Circle
    const focusControl = svg
      .append("circle")
      .attr("cx", 200) // Initial X position
      .attr("cy", 140) // Initial Y position
      .attr("r", 4) // Fixed radius for now
      .attr("fill", "rgba(255, 0, 0, 0.3)")
      .attr("stroke", "red")
      .attr("stroke-width", 2)
      .style("pointer-events", "none");

    // Add a transparent overlay for detecting mouse events
    const overlay = svg
      .append("rect")
      .attr("width", 530)
      .attr("height", 280)
      .attr("fill", "transparent")
      .on("mousemove", function (event) {
        // Get mouse coordinates
        const [mouseX, mouseY] = d3.pointer(event);

        // Reverse the projection to get latitude and longitude
        const [longitude, latitude] = projection.invert([mouseX, mouseY]);

        // Update the position of the Focus Control circle based on mouse position
        focusControl.attr("cx", mouseX).attr("cy", mouseY);

        // Print the coordinates to the console
        console.log("Original Coordinates:", latitude, longitude);
      });

    // Function to get circle color based on SUBTYPE
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

    // ... (rest of your code for legend and other elements)

    const legend = svg
      .append("g")
      .attr("class", "legend")
      .attr("transform", "translate(10, 10)");

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
      .text((d) => d);
  });
});
