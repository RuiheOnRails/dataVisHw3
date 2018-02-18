
var width = 1000,
  height = 700;

var projection = d3.geoAlbers()

var path = d3.geoPath()
  .projection(projection);

var svg = d3.select("svg")
  .attr("width", width)
  .attr("height", height);

var path = d3.geoPath();

d3.queue().defer(d3.json, "us.json")
  .defer(d3.csv, "election.csv")
  .await(ready)

var all2004Data = [], all2008Data = [], all2012Data = [];
var forStateAvg2004 = [], forStateAvg2008 = [], forStateAvg2012 = [];
var colorScale = d3.scaleLinear()
  .domain([-0.2, 0, 0.2, 100])
  .range(["red", "white", "blue", "black"]);
var currentData;
var currentDataIndex = 0;
var byCounty = true;
var allStates = [];
function ready(error, us, election) {
  if (error) throw error;
  election.forEach((d) => {
    if (!allStates.includes(d.state)) {
      allStates.push(d.state);
    }

    if (d.year == 2004) {
      all2004Data.push(d);
    } else if (d.year == 2008) {
      all2008Data.push(d)
    } else if (d.year == 2012) {
      all2012Data.push(d)
    }
  });

  forStateAvg2004 = translateToState(all2004Data);
  forStateAvg2008 = translateToState(all2008Data);
  forStateAvg2012 = translateToState(all2012Data);

  currentData = all2004Data;

  svg.append("g")
    .attr("class", "counties")
    .selectAll("path")
    .data(topojson.feature(us, us.objects.counties).features)
    .enter().append("path")
    .attr("d", path)
    .style("fill", function (d) {
      var dem;
      var rep;
      var total;
      currentData.forEach((c) => {
        if (c.fips == d.id) {
          dem = +c.vote_dem
          rep = +c.vote_rep
          total = +c.vote_total
        }
      })
      return colorScale(calcuateRate(dem, rep, total))
    })
    .style("stroke", "grey");

    document.getElementById("btn2004").addEventListener("click",()=> (handle2004()))
    document.getElementById("btn2008").addEventListener("click",()=> (handle2008()))
    document.getElementById("btn2012").addEventListener("click",()=> (handle2012()))
}

//takes in total and dem and rep to calculate rate
function calcuateRate(d, r, t) {
  var dRate = d / t;
  var rRate = r / t;
  if (r == undefined || d == undefined) { //missing data detected
    return 101
  }
  return dRate - rRate;
}


//modifying original data to get state average for each county
function translateToState(yearOfData) {
  var temp = [];
  var tempState = [];
  var tempDem = 0;
  var tempRep = 0;
  var tempTotal = 0;

  allStates.forEach((s) => {
    console.log(s)
    yearOfData.forEach((d) => {
      if (s == d.state) {
        tempDem += +d.vote_dem;
        tempRep += +d.vote_rep;
        tempTotal += +d.vote_total;
      }
    });
    yearOfData.forEach((d) => { //modify each county to have state total
      if (s == d.state) {
        var row = Object.assign({}, d);
        row.vote_rep = tempRep;
        row.vote_dem = tempDem;
        row.vote_total = tempTotal;
        tempState.push(row);
      }
    })
    tempState.forEach((d) => temp.push(d))
    tempState = [];
    tempDem = 0;
    tempRep = 0;
    tempTotal = 0;
  })

  return temp;
}

function handle2004() {
  if (document.getElementById("byCounty").checked) {
    currentData = all2004Data;
    render()
  } else {
    currentData = forStateAvg2004;
    render()
  }
}

function handle2008() {
  if (document.getElementById("byCounty").checked) {
    currentData = all2008Data;
    render()
  } else {
    currentData = forStateAvg2008;
    render()
  }
}

function handle2012() {
  if (document.getElementById("byCounty").checked) {
    currentData = all2012Data;
    render()
  } else {
    currentData = forStateAvg2012;
    render()
  }
}

function render() {
  svg.selectAll("path").style("fill", function (d) {
    var dem;
    var rep;
    var total;
    currentData.forEach((c) => {
      if (c.fips == d.id) {
        dem = +c.vote_dem
        rep = +c.vote_rep
        total = +c.vote_total
      }
    })
    return colorScale(calcuateRate(dem, rep, total))
  })
}

