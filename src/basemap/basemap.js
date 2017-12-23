function Map(options) {
  options = options || {};

  // dimensions
  this.width = options.width || 800;
  this.height = options.height || 800;
  this.margin = options.margins || { top: 20, right: 20, bottom: 20, left: 20 };
  
  // map
  this.element = options.element || '#map';
  this.borderFile = options.borderFile || '../../../src/basemap/southsudan_admin.json';
  this.cityFile = options.cityFile || '../../../src/basemap/sudan_towns.json'

  // data container
  this.data = [];
};

Map.prototype.data = function(data) {
  if (data) this.data = data;
  return this.data;
};

Map.prototype.render = function() {
  var self = this;
  var g = null;

  // Create a unit projection.
  this.projection = d3.geoMercator()
    .scale(1)
    .translate([0, 0]);

  // Create a path generator.
  this.path = d3.geoPath()
      .projection(this.projection);

  d3.queue()
    .defer(d3.json, this.borderFile)
    .defer(d3.json, this.cityFile)
    .await(function(error, borders, cities) {
      
      // auto figure out projection scale and transform from:
      // http://stackoverflow.com/a/14691788
      var b = self.path.bounds(borders),
        s = .95 / Math.max((b[1][0] - b[0][0]) / self.width, (b[1][1] - b[0][1]) / self.height),
        t = [(self.width - s * (b[1][0] + b[0][0])) / 2, (self.height - s * (b[1][1] + b[0][1])) / 2];

      // Update the projection to use computed scale & translate.
      self.projection
        .scale(s)
        .translate(t);

      var svg = self.svg = d3.select(self.element).append('svg');

      svg.attr('width', self.width + self.margin.left + self.margin.right)
        .attr('height', self.height + self.margin.top + self.margin.bottom);

      g = self.chart = svg.append('g')
        .classed('chart', true)
        .attr('transform', `translate(${self.margin.left},${self.margin.top})`);

      const EXCLUDE = [
        'El Fasher',
        'Zalingei',
        'Nyala',
        'Ed Daein',
        'Heglig',
        'Geneina (Al Junaynah)',
        'El Fula',
        'El Obeid (Al-Ubayyid)',
        'Kadugli',
        'Rabak',
        'Sennar',
        'Al Qadarif',
        'Ed Damazin'
      ]

      var citiesFiltered = cities.features.filter(function(d) {
        return !EXCLUDE.includes(d.properties['Town_Name']);
      });

      g.append('g')
        .attr('class', 'states')
        .selectAll('path')
          .data(borders.features)
        .enter()
        .append('path')
          .attr('d', self.path)
          .attr('class', 'state')
          .attr('fill-opacity', 0.5)
          .attr('stroke', '#222')

      self.path.pointRadius(2)
      g.append('g')
        .attr('class', 'pois')
        .selectAll('path')
          .data(citiesFiltered)
          .enter()
          .append('path')
        .attr('d', self.path)
        .attr('class', 'place');

      g.append('g')
        .attr('class', 'poi-labels')
        .selectAll(".place-label")
        .data(citiesFiltered)
        .enter()
        .append("text")
        .attr("class", "place-label")
        .attr("transform", function(d) { return "translate(" + self.projection(d.geometry.coordinates) + ")"; })
        .attr("dy", ".35em")
        .attr("dx", ".35em")
        .text(function(d) { return d.properties['Town_Name']; });
    });

};

var map = new Map();
map.render();
