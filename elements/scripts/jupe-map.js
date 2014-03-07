'use strict';

Polymer('jupe-map', {

  basemap: null,
  extent: '-130,25,-65,50',
  wkId: 4326,
  map: null,

  ready: function() {
    var me = this;
    require(['esri/map', 'esri/geometry/Extent', 'esri/renderers/SimpleRenderer', 'esri/layers/FeatureLayer', 'esri/symbols/SimpleLineSymbol','esri/symbols/SimpleFillSymbol', 'dojo/_base/Color', 'esri/dijit/Legend'], 
      function(Map, Extent, SimpleRenderer, FeatureLayer, SimpleLineSymbol, SimpleFillSymbol, Color, Legend) {
      //gather map parameters from element attributes
      var mapOptions = {
        basemap: me.basemap
      };

      if (me.extent) {
        var ext = me.extent.split(',');
        mapOptions.extent = new Extent(+ext[0], +ext[1], +ext[2], +ext[3], new esri.SpatialReference({ wkid: me.wkId }));
      }

      //create the map! - me.$ is a dom selector scoped to this element
      me.map = new Map(me.$.map, mapOptions);

      me.fl = new FeatureLayer('http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3', {
        maxAllowableOffset: me.map.extent.getWidth() / me.map.width,
        mode: FeatureLayer.MODE_SNAPSHOT,
        outFields: ['STATE_NAME'],
        visible: true
      });

      // override default renderer so that states aren't drawn
      // until the gas price data has been loaded and is joined
      me.fl.setRenderer(new SimpleRenderer(null));

      me.updateEndHandler = me.fl.on('update-end', me.onUpdateEnd.bind(me));

      me.map.addLayer(me.fl);
    });
  },

  onUpdateEnd: function () {
    // get gas price data
    if (this.updateEndHandler) {
      this.updateEndHandler.remove();
    }
    
    this.$.gasPrices.addEventListener('got-prices', this.drawFeatureLayer.bind(this));
    this.$.gasPrices.go();
  },

  drawFeatureLayer: function () {
    var gasMin = this.$.gasPrices.getMin();
    var gasMax = this.$.gasPrices.getMax();

    // add an attribute to each graphic so gas price is displayed
    // on mouse over below the legend
    var displayValue;
    _.each(this.fl.graphics, function(g) {
      displayValue = this.$.gasPrices.findGasPrice(g.attributes.STATE_NAME);
      g.attributes.GAS_DISPLAY = displayValue;
    }, this);

    // create a class breaks renderer
    var breaks = this.calcBreaks(gasMin, gasMax, 4);
    var SFS = esri.symbol.SimpleFillSymbol;
    var SLS = esri.symbol.SimpleLineSymbol;
    var outline = SLS('solid', new dojo.Color('#444'), 1);
    var br = new esri.renderer.ClassBreaksRenderer(null, this.findGasPrice);
    br.setMaxInclusive(true);
    br.addBreak(breaks[0], breaks[1], new SFS('solid', outline, new dojo.Color([255, 255, 178, 0.75])));
    br.addBreak(breaks[1], breaks[2], new SFS('solid', outline, new dojo.Color([254, 204, 92, 0.75])));
    br.addBreak(breaks[2], breaks[3], new SFS('solid', outline, new dojo.Color([253, 141, 60, 0.75])));
    br.addBreak(breaks[3], gasMax, new SFS('solid', outline, new dojo.Color([227, 26, 28, 0.75])));

    this.fl.setRenderer(br);
    this.fl.redraw();

    // this.legend = new backboneDemoDs2014.LegendView({ map: this.map, fl: this.fl });
    this.$.legend.init(this.map, this.fl);

    //remove the loading div
    document.querySelector('#loading').remove();
  },

  findGasPrice: function (graphic) {
    return graphic.attributes.GAS_DISPLAY;
  },

  calcBreaks: function (min, max, numberOfClasses) {
    var range = (max - min) / numberOfClasses;
    var breakValues = [];
    for ( var i = 0; i < numberOfClasses; i++ ) {
      breakValues.push(this.formatDollars(min + ( range * i )));
    }
    return breakValues;
  },

  formatDollars: function (num) {
    return dojo.number.format(num, { 'places': 2 });
  }

});
