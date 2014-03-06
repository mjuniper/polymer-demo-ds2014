'use strict';

Polymer('jupe-map', {
  basemap: null,
  webMapId: '',
  extent: '-130,25,-65,50',
  wkId: 4326,
  map: null,
  ready: function() {
    var me = this;
    require(['esri/map', 'esri/arcgis/utils', 'esri/geometry/Extent', 'esri/renderers/SimpleRenderer', 'esri/layers/FeatureLayer', 'esri/layers/GraphicsLayer', 'esri/tasks/GeometryService', 'esri/tasks/BufferParameters', 'esri/symbols/SimpleLineSymbol','esri/symbols/SimpleFillSymbol', 'esri/symbols/SimpleMarkerSymbol', 'dojo/_base/Color', 'esri/graphic', 'dojo/domReady!'], 
      function(Map, arcgisUtils, Extent, SimpleRenderer, FeatureLayer, GraphicsLayer, GeometryService, BufferParameters, SimpleLineSymbol, SimpleFillSymbol, SimpleMarkerSymbol, Color, Graphic) {
      me.BufferParameters = BufferParameters;
      me.SimpleLineSymbol = SimpleLineSymbol;
      me.SimpleFillSymbol = SimpleFillSymbol;
      me.SimpleMarkerSymbol = SimpleMarkerSymbol;
      me.Color = Color;
      me.Graphic = Graphic;
      
      var mapOptions= {
        basemap: me.basemap
      };

      if (me.extent) {
        var ext = me.extent.split(',');
        mapOptions.extent = new Extent(+ext[0], +ext[1], +ext[2], +ext[3], new esri.SpatialReference({ wkid: me.wkId }));
      }

      me.map = new Map(me.$.map, mapOptions);

      me.fl = new esri.layers.FeatureLayer('http://sampleserver6.arcgisonline.com/arcgis/rest/services/Census/MapServer/3', {
        maxAllowableOffset: me.map.extent.getWidth() / me.map.width,
        mode: esri.layers.FeatureLayer.MODE_SNAPSHOT,
        outFields: ['STATE_NAME'],
        visible: true
      });

      // override default renderer so that states aren't drawn
      // until the gas price data has been loaded and is joined
      //me.fl.setRenderer(new esri.renderer.SimpleRenderer(null));

      //me.updateEndHandler = me.fl.on('update-end', me.onUpdateEnd);

      me.map.addLayer(me.fl);

      //me.gasPricesCollection = new backboneDemoDs2014.GasPricesCollection();

      // //raise event to outside world
      // me.map.on('extent-change', function (e) { me.fire('extent-change', e); });
      // me.map.on('layer-add', function (e) { me.fire('layer-added', e); });
      // window.Woot = {};
      // window.Woot.map = me.map;
    });
  }

});
