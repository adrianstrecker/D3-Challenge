  // ------------ //
 // Set up chart //
// ------------ //
var svgWidth = 900;
var svgHeight = 500;

var margin = {
  top: 20,
  right: 40,
  bottom: 80,
  left: 100
};

var width = svgWidth - margin.left - margin.right;
var height = svgHeight - margin.top - margin.bottom;

  // ------------------ //
 // Create SVG wrapper //
// ------------------ //
var svg = d3
  .select("#scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

  // ------------------- //
 // Append an SVG group //
// ------------------- //
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

  // ------------------ //
 // Initial Parameters //
// ------------------ //
var chosenXAxis = "poverty";
var chosenYAxis = "healthcare";

  // ------------------------------------------------------------------------------ //
 // Create function used for updating x-scale variable upon clicking on axis label //
// ------------------------------------------------------------------------------ //
function xScale(dataInfo, chosenXAxis) {
  // Create x-scale
  var xLinearScale = d3.scaleLinear()
    .domain([d3.min(dataInfo, d => d[chosenXAxis]) * 0.8,
      d3.max(dataInfo, d => d[chosenXAxis]) * 1.2
    ])
    .range([0, width]);
  return xLinearScale;
}

  // ------------------------------------------------------------------------------ //
 // Create function used for updating y-scale variable upon clicking on axis label //
// ------------------------------------------------------------------------------ //
function yScale(dataInfo, chosenYAxis) {
  // Create y-scale
  var yLinearScale = d3.scaleLinear()
    .domain([d3.min(dataInfo, d => d[chosenYAxis] - 2), d3.max(dataInfo, d => d[chosenYAxis])+2])
    .range([height, 0]);
  return yLinearScale;
}

  // ------------------------------------------------------------------------- //
 // Create function used for updating xAxis variable upon click on axis label //
// ------------------------------------------------------------------------- //
function renderXAxes(newXScale, xAxis) {
  var bottomAxis = d3.axisBottom(newXScale);
  // Transition xAxis
  xAxis.transition()
    .duration(800)
    .call(bottomAxis);
  return xAxis;
}

  // ------------------------------------------------------------------------- //
 // Create function used for updating yAxis variable upon click on axis label //
// ------------------------------------------------------------------------- //
function renderYAxes(newYScale, yAxis) {
  var leftAxis = d3.axisLeft(newYScale);
  // Transition yAxis
  yAxis.transition()
    .duration(800)
    .call(leftAxis);
  return yAxis;
}

  // ------------------------------------------------------ //
 // Create function to render circles on x-axis transition //
// ------------------------------------------------------ //
function renderXCircles(circlesGroup, newXScale, chosenXAxis) {
  // Transition circles on x-axis
  circlesGroup.transition()
    .duration(800)
    .attr("cx", d => newXScale(d[chosenXAxis]))
  return circlesGroup;
}

  // ------------------------------------------------------ //
 // Create function to render circles on y-axis transition //
// ------------------------------------------------------ //
function renderYCircles(circlesGroup, newYScale, chosenYAxis) {
  // Transition circles on y-axis
  circlesGroup.transition()
    .duration(800)
    .attr("cy", d => newYScale(d[chosenYAxis]))
  return circlesGroup;
}

  // --------------------------------------------------- //
 // Create function to render text on x-axis transition //
// --------------------------------------------------- //
function renderXText(circlesGroup, newXScale, chosenXAxis) {
  // Transition text on x-axis
  circlesGroup.transition()
    .duration(800)
    .attr("dx", d => newXScale(d[chosenXAxis]));
  return circlesGroup;
}

  // --------------------------------------------------- //
 // Create function to render text on y-axis transition //
// --------------------------------------------------- //
function renderYText(circlesGroup, newYScale, chosenYAxis) {
  // Transition text on y-axis
  circlesGroup.transition()
    .duration(800)
    .attr("dy", d => newYScale(d[chosenYAxis])+5);
  return circlesGroup;
}

  // -------------------------------------------------------- //
 // Create function to update circles group with new tooltip //
// -------------------------------------------------------- //
function updatetooltip(chosenXAxis, circles) {
  // Create label variable for axis changes
  var label;
  // 
  if (chosenXAxis === "poverty") {
    label = "poverty";
  }
  else if (chosenXAxis === "income") {
    label = "income";
  }
  else {
    label = "age";
  }
  // Style tooltip
  var tooltip = d3.tip()
    .attr("class", "d3-tip")
    .offset([5, 20])
    .html(function(d) {
      return (`${d.state}<br>Poverty: ${d.poverty}%<br>Obesity: ${d.obesity}%`);
    });
  // Call tooltip on selection
  circles.call(tooltip);
  
  // Show tooltip on hover/mouseover  
  circles.on("mouseover", function(data) {
    tooltip.show(data, this);
  })
    // Hide tooltip on mouseout
    .on("mouseout", function(data) {
      tooltip.hide(data);
    });
  return circles; 
}

  // --------------------------------------------------------------- //
 // Retrieve/read data from the CSV file & execute everything below //
// --------------------------------------------------------------- //
d3.csv("assets/js/data.csv").then(function(dataInfo, err) {
  if (err) throw err;
  

   // Parse data to ensure numbers are read correctly
  dataInfo.forEach(function(data) {
    data.poverty = +data.poverty;
    data.healthcare = +data.healthcare;
    data.age = +data.age;
    data.income = +data.income;
    data.smokes = +data.smokes;
    data.obesity = +data.obesity;
  });


  // LinearScale functions above csv import
  var xLinearScale = xScale(dataInfo, chosenXAxis);
  var yLinearScale = yScale(dataInfo, chosenYAxis)

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // Append x-axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${height})`)
    .call(bottomAxis);

  // Append y-axis
  var yAxis = chartGroup.append("g")
    .call(leftAxis);

  // Append initial circles
  var circlesGroup = chartGroup.selectAll("g circle")
    .data(dataInfo)
    .enter()
    .append("g")

  // Create circles
  var circles = circlesGroup.append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 15)
    .classed("stateCircle", true)
    .attr("opacity", "1")

  // Create text to display in circles
  var circleLabels = circlesGroup.selectAll("text")
    .data(dataInfo)
    .enter()
    .append("text")
    .attr("dx", d => xLinearScale(d[chosenXAxis]))
    .attr("dy", d => yLinearScale(d[chosenYAxis])+5)
    .classed("stateText", true)
    .text(function(d) {
      return d.abbr;
    });
    
  // Create group for x-axis labels
  var xLabelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${width / 2}, ${height + 20})`);

  // Create x-axis labels
  var povertyLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "poverty") // value to grab for event listener
    .classed("active", true)
    .text("In Poverty(%)");

  var ageLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "age") // value to grab for event listener
    .classed("inactive", true)
    .text("Age (Median)");

  var incomeLabel = xLabelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 60)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Household Income (Median)");

  // Create group for y-axis labels
  var yLabelsGroup = chartGroup.append("g");

  // Create y-axis labels
  var healthcareLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+50)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "healthcare")
    .classed("active", true)
    .classed("aText", true)
    .text("Lacks Healthcare (%)");

  var smokesLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left+25)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "smokes")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Smokes (%)");

  var obeseLabel = yLabelsGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (height / 2))
    .attr("dy", "1em")
    .attr("value", "obesity")
    .classed("inactive", true)
    .classed("aText", true)
    .text("Obese (%)");

  // Updatetooltip function above CSV import
  var circles = updatetooltip(chosenXAxis, circles);
  

  // X-axis labels event listener
  xLabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenXAxis) {

        // Replaces chosenXAxis with value
        chosenXAxis = value;

        // console.log(chosenXAxis)

        // Functions here found above CSV import
        // Updates xScale for new data
        xLinearScale = xScale(dataInfo, chosenXAxis);

        // Updates x-axis with transition
        xAxis = renderXAxes(xLinearScale, xAxis);

        // Updates circles with new x values
        circles = renderXCircles(circles, xLinearScale, chosenXAxis);
        circleLabels = renderXText(circleLabels, xLinearScale, chosenXAxis);
        
        // Updates tooltips with new info
        circles = updatetooltip(chosenXAxis, circles);

        // Changes classes to change bold text
        if (chosenXAxis === "age") {
          ageLabel
            .classed("active", true)
            .classed("inactive", false);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenXAxis === "income") {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", false)
            .classed("inactive", true);
          incomeLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          ageLabel
            .classed("active", false)
            .classed("inactive", true);
          povertyLabel
            .classed("active", true)
            .classed("inactive", false);
          incomeLabel
            .classed("active", false)
            .classed("inactive", true)
        }
      }
    });

  // Y-axis labels event listener
  yLabelsGroup.selectAll("text")
    .on("click", function() {
      // Get value of selection
      var value = d3.select(this).attr("value");
      if (value !== chosenYAxis) {

        // Replaces chosenYAxis with value
        chosenYAxis = value;

        // console.log(chosenYAxis)

        // Functions here found above CSV import
        // Updates yScale for new data
        yLinearScale = yScale(dataInfo, chosenYAxis);

        // Updates y-axis with transition
        yAxis = renderYAxes(yLinearScale, yAxis);

        // Updates circles with new y values
        circles = renderYCircles(circles, yLinearScale, chosenYAxis);
        circleLabels = renderYText(circleLabels, yLinearScale, chosenYAxis);
        
        // Updates tooltips with new info
        circles = updatetooltip(chosenYAxis, circles);

        // Changes classes to change bold text
        if (chosenYAxis === "smokes") {
          smokesLabel
            .classed("active", true)
            .classed("inactive", false);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true);
        }
        else if (chosenYAxis === "obesity") {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", false)
            .classed("inactive", true);
          obeseLabel
            .classed("active", true)
            .classed("inactive", false);
        }
        else {
          smokesLabel
            .classed("active", false)
            .classed("inactive", true);
          healthcareLabel
            .classed("active", true)
            .classed("inactive", false);
          obeseLabel
            .classed("active", false)
            .classed("inactive", true)
        }
      }
    });

}).catch(function(error) {
  console.log(error);
});