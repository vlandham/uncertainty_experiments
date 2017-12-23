

var basedir = '../../../src/data/icons';

function createMorphIcon() {

  var values = [{ id: 'battle', time: 0.5}, {id: 'riot', time: 0.5 }];

  var timeScale = d3.scaleLinear()
    .domain([0, 1])
    .range([0, 5 * 1000])

  var curIndex = 0;

  var rootDiv = null;
  var allIcons = null;

  function addIcon(selection, icons, iconId) {
    selection.selectAll('svg')
      // .transition()
      // .duration(50)
      // .attr('opacity',0)
      .remove();


    selection.node().appendChild(icons[iconId].cloneNode(true));

    selection.select('svg')
      .attr('width', 30)
      .attr('height', 30)
      .attr('opacity', 0)
      .transition()
        .duration(50)
        .attr('opacity', 1.0);
    // selection.each(function(d) {
    //   d3.select(this).selectAll('svg')
    //     // .transition(20)
    //     // .opacity(0)
    //     .remove();
    //
    //
    //
    // });
  }

  const chart = function wrapper(selection, icons) {
    allIcons = icons;
    rootDiv = d3.select(selection).append('div')
      .attr('class', 'micon');
    addIcon(rootDiv, allIcons, values[curIndex].id);
    repeat();
  }

  function repeat() {
    rootDiv.select('svg')
      .transition()
      .duration(timeScale(values[curIndex].time))
      .ease(d3.easeExpOut)
      .attr('opacity', 1)
      .on('end', function() {
        curIndex = (curIndex + 1) % values.length
        addIcon(rootDiv, allIcons, values[curIndex].id);
        repeat();
      })
  }

  chart.values = function setValues(_) {
    if (!arguments.length) {
      return values;
    }

    values = _;
    return this;
  };


  return chart;
}

var icon1 = createMorphIcon();
var icon2 = createMorphIcon().values([
  { id: 'battle', time: 0.7 },
  { id: 'strategic', time: 0.2 },
  { id: 'civilians', time: 0.1 }]);

var icon3 = createMorphIcon().values([
  { id: 'remote', time: 0.4 },
  { id: 'strategic', time: 0.3 },
  { id: 'civilians', time: 0.3 }]);

var icon4 = createMorphIcon().values([
  { id: 'battle', time: 0.6 },
  { id: 'civilians', time: 0.4 }
  ]);

var icon5 = createMorphIcon().values([
  { id: 'riot', time: 0.5 },
  { id: 'battle', time: 0.3 },
  { id: 'civilians', time: 0.2 }]);

function showIcons(selection, icons) {
  var iconE = d3.select(selection).selectAll('.icon')
    .data(Object.keys(icons))
    .enter()
    .append('div')
    .classed('micon', true);
  iconE.each(function(d) {
    d3.select(this).node().appendChild(icons[d].cloneNode(true));
    d3.select(this).select('svg')
      .attr('width', 30)
      .attr('height',30);
  });
  iconE.append('p')
    .text(function(d) { return d; });
}

function loadVis(error, battle, remote, riot, strategic, civilians) {
  console.log(civilians)
  var icons = {
    battle: battle.getElementsByTagName('svg')[0],
    remote: remote.getElementsByTagName('svg')[0],
    riot: riot.getElementsByTagName('svg')[0],
    strategic: strategic.getElementsByTagName('svg')[0],
    civilians: civilians.getElementsByTagName('svg')[0],
  };

  showIcons('#iconsall', icons);

  icon1('#icon1', icons);
  icon2('#icon2', icons);

  icon3('#icon3', icons);
  icon4('#icon4', icons);
  icon5('#icon5', icons);

}

d3.queue()
  .defer(d3.xml, basedir + '/battle.svg')
  .defer(d3.xml, basedir + '/remote.svg')
  .defer(d3.xml, basedir + '/riot.svg')
  .defer(d3.xml, basedir + '/strategic.svg')
  .defer(d3.xml, basedir + '/civilians.svg')
  .await(loadVis);
