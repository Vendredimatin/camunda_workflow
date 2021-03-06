/**
 * 获取一个扩展的视图范围，把上下左右都扩大一样的像素值。
 * @param {Map} map BMap.Map的实例化对象
 * @param {BMap.Bounds} bounds BMap.Bounds的实例化对象
 * @param {Number} gridSize 要扩大的像素值
 *
 * @return {BMap.Bounds} 返回扩大后的视图范围。
 */
var getExtendedBounds = function(map, bounds, gridSize){
  bounds = cutBoundsInRange(bounds);
  var pixelNE = map.pointToPixel(bounds.getNorthEast());
  var pixelSW = map.pointToPixel(bounds.getSouthWest());
  pixelNE.x += gridSize;
  pixelNE.y -= gridSize;
  pixelSW.x -= gridSize;
  pixelSW.y += gridSize;
  var newNE = map.pixelToPoint(pixelNE);
  var newSW = map.pixelToPoint(pixelSW);
  return new BMap.Bounds(newSW, newNE);
};

/**
 * 按照百度地图支持的世界范围对bounds进行边界处理
 * @param {BMap.Bounds} bounds BMap.Bounds的实例化对象
 *
 * @return {BMap.Bounds} 返回不越界的视图范围
 */
var cutBoundsInRange = function (bounds) {
  var maxX = getRange(bounds.getNorthEast().lng, -180, 180);
  var minX = getRange(bounds.getSouthWest().lng, -180, 180);
  var maxY = getRange(bounds.getNorthEast().lat, -74, 74);
  var minY = getRange(bounds.getSouthWest().lat, -74, 74);
  return new BMap.Bounds(new BMap.Point(minX, minY), new BMap.Point(maxX, maxY));
};

/**
 * 对单个值进行边界处理。
 * @param {Number} i 要处理的数值
 * @param {Number} min 下边界值
 * @param {Number} max 上边界值
 *
 * @return {Number} 返回不越界的数值
 */
var getRange = function (i, mix, max) {
  mix && (i = Math.max(i, mix));
  max && (i = Math.min(i, max));
  return i;
};

/**
 * 判断给定的对象是否为数组
 * @param {Object} source 要测试的对象
 *
 * @return {Boolean} 如果是数组返回true，否则返回false
 */
var isArray = function (source) {
  return '[object Array]' === Object.prototype.toString.call(source);
};

/**
 * 返回item在source中的索引位置
 * @param {Object} item 要测试的对象
 * @param {Array} source 数组
 *
 * @return {Number} 如果在数组内，返回索引，否则返回-1
 */
var indexOf = function(item, source){
  var index = -1;
  if(isArray(source)){
    if (source.indexOf) {
      index = source.indexOf(item);
    } else {
      for (var i = 0, m; m = source[i]; i++) {
        if (m === item) {
          index = i;
          break;
        }
      }
    }
  }
  return index;
};
export default class MarkerClusterer {
  constructor(map, options) {
    if (!map){
      return;
    }
    this._map = map;
    this._markers = [];
    this._clusters = [];

    var opts = options || {};
    this._gridSize = opts["gridSize"] || 60;
    this._maxZoom = opts["maxZoom"] || 18;
    this._minClusterSize = opts["minClusterSize"] || 2;
    this._isAverageCenter = false;
    if (opts['isAverageCenter'] != undefined) {
      this._isAverageCenter = opts['isAverageCenter'];
    }
    this._styles = opts["styles"] || [];

    var that = this;
    this._map.addEventListener("zoomend",function(){
      that._redraw();
    });

    this._map.addEventListener("moveend",function(){
      that._redraw();
    });

    var mkrs = opts["markers"];
    isArray(mkrs) && this.addMarkers(mkrs);
  }
  /**
   * 添加要聚合的标记数组。
   * @param {Array<Marker>} markers 要聚合的标记数组
   *
   * @return 无返回值。
   */
  addMarkers(markers){
    for(var i = 0, len = markers.length; i <len ; i++){
      this._pushMarkerTo(markers[i]);
    }
    this._createClusters();
  };

  /**
   * 把一个标记添加到要聚合的标记数组中
   * @param {BMap.Marker} marker 要添加的标记
   *
   * @return 无返回值。
   */
  _pushMarkerTo(marker){
    var index = indexOf(marker, this._markers);
    if(index === -1){
      marker.isInCluster = false;
      this._markers.push(marker);//Marker拖放后enableDragging不做变化，忽略
    }
  };

  /**
   * 添加一个聚合的标记。
   * @param {BMap.Marker} marker 要聚合的单个标记。
   * @return 无返回值。
   */
  addMarker(marker) {
    this._pushMarkerTo(marker);
    this._createClusters();
  };

  /**
   * 根据所给定的标记，创建聚合点
   * @return 无返回值
   */
  _createClusters(){

    var mapBounds = this._map.getBounds();
    var extendedBounds = getExtendedBounds(this._map, mapBounds, this._gridSize);
    //alert("h3 " + ((tm1-tm0)/1000) );

    var tm0= (new Date()).getTime();
    var tm1,tm2,tmsum=0;
    this.g_tmsum=0;

    var i,imax=this._markers.length,mi;
    var ma= this._markers;
    for(i = 0; i<imax; i++){
      mi = ma[i];
      if(!mi.isInCluster && extendedBounds.containsPoint(mi.getPosition()) ){
        tm1= (new Date()).getTime();
        this._addToClosestCluster(mi);
        tmsum += (new Date()).getTime()-tm1;
      }
    }
    //draw
    /*
    for(i = 0; i<imax; i++){
        mi = ma[i];
        if( mi.bDelayDraw==1 )
        {
            //this._map.addOverlay(mi);
        }
        else if( mi.bDelayDraw==2 )
        {
            //this._map.removeOverlay(mi);
        }
    }
    */

    //draw cluster
    ma= this._clusters;
    imax=ma.length;
    for(i = 0; i<imax; i++){
      mi = ma[i];
      //mi.updateClusterMarker();

      if( mi._clusterMarker.bDelayDraw==1 )
      {
        this._map.addOverlay(mi._clusterMarker);
      }
      else if( mi._clusterMarker.bDelayDraw==2 )
      {
        this._map.removeOverlay(mi._clusterMarker);
      }
      mi.updateClusterMarker();
    }

    tm2= (new Date()).getTime();
    //alert( [(tm2-tm0)/1000, tmsum/1000, this.g_tmsum/1000 ] );
  };


  /**
   * 根据标记的位置，把它添加到最近的聚合中
   * @param {BMap.Marker} marker 要进行聚合的单个标记
   *
   * @return 无返回值。
   */
  _addToClosestCluster(marker){
    //var distance = 4000000;
    var dis2 = 16000000000000,d1,d2,d;

    var clusterToAddTo = null;
    var position = marker.getPosition();
    var ca= this._clusters;
    var i,imax=ca.length,cluster;
    for(i = 0; i<imax; i++){
      cluster = ca[i]
      var center = cluster.getCenter();
      if(center){
        //var d = this._map.getDistance(center, marker.getPosition());
        d1 = center.lng-position.lng;
        d2 = center.lat-position.lat;
        d=d1*d1+d2*d2;
        if(d < dis2){
          dis2 = d;
          clusterToAddTo = cluster;
        }
      }
    }

    if (clusterToAddTo && clusterToAddTo.isMarkerInClusterBounds(marker)){
      //var tm0= (new Date()).getTime();
      clusterToAddTo.addMarker(marker,1);
      //var tm1= (new Date()).getTime();
      //this.g_tmsum += tm1-tm0;
    } else {
      var cluster = new Cluster(this, BMapLib);
      //var tm0= (new Date()).getTime();
      cluster.addMarker(marker,1);
      //var tm1= (new Date()).getTime();
      //this.g_tmsum += tm1-tm0;
      this._clusters.push(cluster);
    }
  };
  /**
   * 清除上一次的聚合的结果
   * @return 无返回值。
   */
  _clearLastClusters(){
    for(var i = 0, cluster; cluster = this._clusters[i]; i++){
      cluster.remove();
    }
    this._clusters = [];//置空Cluster数组
    this._removeMarkersFromCluster();//把Marker的cluster标记设为false
  };

  /**
   * 清除某个聚合中的所有标记
   * @return 无返回值
   */
  _removeMarkersFromCluster(){
    for(var i = 0, marker; marker = this._markers[i]; i++){
      marker.isInCluster = false;
    }
  };

  /**
   * 把所有的标记从地图上清除
   * @return 无返回值
   */
  _removeMarkersFromMap(){
    for(var i = 0, marker; marker = this._markers[i]; i++){
      marker.isInCluster = false;
      this._map.removeOverlay(marker);
    }
  };
  /**
   * 删除单个标记
   * @param {BMap.Marker} marker 需要被删除的marker
   *
   * @return {Boolean} 删除成功返回true，否则返回false
   */
  _removeMarker(marker) {
    var index = indexOf(marker, this._markers);
    if (index === -1) {
      return false;
    }
    this._map.removeOverlay(marker);
    this._markers.splice(index, 1);
    return true;
  };

  /**
   * 删除单个标记
   * @param {BMap.Marker} marker 需要被删除的marker
   *
   * @return {Boolean} 删除成功返回true，否则返回false
   */
  removeMarker(marker) {
    var success = this._removeMarker(marker);
    if (success) {
      this._clearLastClusters();
      this._createClusters();
    }
    return success;
  };

  /**
   * 删除一组标记
   * @param {Array<BMap.Marker>} markers 需要被删除的marker数组
   *
   * @return {Boolean} 删除成功返回true，否则返回false
   */
  removeMarkers(markers) {
    var success = false;
    for (var i = 0; i < markers.length; i++) {
      var r = this._removeMarker(markers[i]);
      success = success || r;
    }

    if (success) {
      this._clearLastClusters();
      this._createClusters();
    }
    return success;
  };

  /**
   * 从地图上彻底清除所有的标记
   * @return 无返回值
   */
  clearMarkers() {
    this._clearLastClusters();
    this._removeMarkersFromMap();
    this._markers = [];
  };
  /**
   * 重新生成，比如改变了属性等
   * @return 无返回值
   */
  _redraw () {
    //alert("h");
    var tm0= (new Date()).getTime();
    this._clearLastClusters();
    var tm1= (new Date()).getTime();
    this._createClusters();
    var tm2= (new Date()).getTime();
    //alert("h2 " + ((tm2-tm0)/1000) + " = " + ((tm1-tm0)/1000) + " + " + ((tm2-tm1)/1000) );
  };

  /**
   * 获取网格大小
   * @return {Number} 网格大小
   */
  getGridSize() {
    return this._gridSize;
  };

  /**
   * 设置网格大小
   * @param {Number} size 网格大小
   * @return 无返回值
   */
  setGridSize(size) {
    this._gridSize = size;
    this._redraw();
  };

  /**
   * 获取聚合的最大缩放级别。
   * @return {Number} 聚合的最大缩放级别。
   */
  getMaxZoom() {
    return this._maxZoom;
  };

  /**
   * 设置聚合的最大缩放级别
   * @param {Number} maxZoom 聚合的最大缩放级别
   * @return 无返回值
   */
  setMaxZoom(maxZoom) {
    this._maxZoom = maxZoom;
    this._redraw();
  };

  /**
   * 获取聚合的样式风格集合
   * @return {Array<IconStyle>} 聚合的样式风格集合
   */
  getStyles() {
    return this._styles;
  };

  /**
   * 设置聚合的样式风格集合
   * @param {Array<IconStyle>} styles 样式风格数组
   * @return 无返回值
   */
  setStyles(styles) {
    this._styles = styles;
    this._redraw();
  };

  /**
   * 获取单个聚合的最小数量。
   * @return {Number} 单个聚合的最小数量。
   */
  getMinClusterSize() {
    return this._minClusterSize;
  };

  /**
   * 设置单个聚合的最小数量。
   * @param {Number} size 单个聚合的最小数量。
   * @return 无返回值。
   */
  setMinClusterSize(size) {
    this._minClusterSize = size;
    this._redraw();
  };

  /**
   * 获取单个聚合的落脚点是否是聚合内所有标记的平均中心。
   * @return {Boolean} true或false。
   */
  isAverageCenter() {
    return this._isAverageCenter;
  };

  /**
   * 获取聚合的Map实例。
   * @return {Map} Map的示例。
   */
  getMap() {
    return this._map;
  };

  /**
   * 获取所有的标记数组。
   * @return {Array<Marker>} 标记数组。
   */
  getMarkers() {
    return this._markers;
  };

  /**
   * 获取聚合的总数量。
   * @return {Number} 聚合的总数量。
   */
  getClustersCount() {
    var count = 0;
    for(var i = 0, cluster; cluster = this._clusters[i]; i++){
      cluster.isReal() && count++;
    }
    return count;
  };

}

/**
 * @ignore
 * Cluster
 * @class 表示一个聚合对象，该聚合，包含有N个标记，这N个标记组成的范围，并有予以显示在Map上的TextIconOverlay等。
 * @constructor
 * @param {MarkerClusterer} markerClusterer 一个标记聚合器示例。
 */

class Cluster {
  constructor(markerClusterer, BMapLib){
    this._markerClusterer = markerClusterer;
    this._map = markerClusterer.getMap();
    this._minClusterSize = markerClusterer.getMinClusterSize();
    this._isAverageCenter = markerClusterer.isAverageCenter();
    this._center = null;//落脚位置
    this._markers = [];//这个Cluster中所包含的markers
    this._gridBounds = null;//以中心点为准，向四边扩大gridSize个像素的范围，也即网格范围
    this._isReal = false; //真的是个聚合

    this._clusterMarker = new BMapLib.TextIconOverlay(this._center, this._markers.length, {"styles":this._markerClusterer.getStyles()});
  }
  /**
   * 向该聚合添加一个标记。
   * @param {Marker} marker 要添加的标记。
   * @return 无返回值。
   */
  addMarker(marker,bDelayDraw){
    if(this.isMarkerInCluster(marker)){
      return false;
    }//也可用marker.isInCluster判断,外面判断OK，这里基本不会命中

    if (!this._center){
      this._center = marker.getPosition();
      this.updateGridBounds();//
    } else {
      if(this._isAverageCenter){
        var l = this._markers.length + 1;
        var lat = (this._center.lat * (l - 1) + marker.getPosition().lat) / l;
        var lng = (this._center.lng * (l - 1) + marker.getPosition().lng) / l;
        this._center = new BMap.Point(lng, lat);
        this.updateGridBounds();
      }//计算新的Center
    }

    marker.isInCluster = true;
    this._markers.push(marker);

    var tm0= (new Date()).getTime();
    var tm1= (new Date()).getTime();
    this.g_tmsum += tm1-tm0;

    var len = this._markers.length;
    if(len < this._minClusterSize ){

      if( bDelayDraw ) marker.bDelayDraw=1;	//1 to add
      else
      {
        this._map.addOverlay(marker);
        marker.bDelayDraw=0;
      }
      //this.updateClusterMarker();
      return true;
    } else if (len === this._minClusterSize) {
      for (var i = 0; i < len; i++) {
        if( this._markers[i].getMap() )
        {
          if( bDelayDraw ) this._markers[i].bDelayDraw=2;	//2 to remove
          else
          {
            this._map.removeOverlay(this._markers[i]);
            this._markers[i].bDelayDraw=0;
          }
        }
      }

    }
    if( bDelayDraw ) this._clusterMarker.bDelayDraw= 1;
    else
    {
      this._map.addOverlay(this._clusterMarker);
      this._clusterMarker=0;
    }

    this._isReal = true;
    if( !bDelayDraw) this.updateClusterMarker();
    return true;
  };

  /**
   * 判断一个标记是否在该聚合中。
   * @param {Marker} marker 要判断的标记。
   * @return {Boolean} true或false。
   */
  isMarkerInCluster= function(marker){
    if (this._markers.indexOf) {
      return this._markers.indexOf(marker) != -1;
    } else {
      for (var i = 0, m; m = this._markers[i]; i++) {
        if (m === marker) {
          return true;
        }
      }
    }
    return false;
  };

  /**
   * 判断一个标记是否在该聚合网格范围中。
   * @param {Marker} marker 要判断的标记。
   * @return {Boolean} true或false。
   */
  isMarkerInClusterBounds(marker) {
    return this._gridBounds.containsPoint(marker.getPosition());
  };

  isReal(marker) {
    return this._isReal;
  };

  /**
   * 更新该聚合的网格范围。
   * @return 无返回值。
   */
  updateGridBounds() {
    var bounds = new BMap.Bounds(this._center, this._center);
    this._gridBounds = getExtendedBounds(this._map, bounds, this._markerClusterer.getGridSize());
  };

  /**
   * 更新该聚合的显示样式，也即TextIconOverlay。
   * @return 无返回值。
   */
  updateClusterMarker (bDelayDraw) {
    if (this._map.getZoom() > this._markerClusterer.getMaxZoom()) {

      if( this._clusterMarker )
      {
        if( bDelayDraw ) this._clusterMarker.bDelayDraw= 2;
        else
        {
          this._map.removeOverlay(this._clusterMarker);
          this._clusterMarker.bDelayDraw=0;
        }
      }

      for (var i = 0, marker; marker = this._markers[i]; i++) {
        if( bDelayDraw ) marker.bDelayDraw=1;
        else
        {
          this._map.addOverlay(marker);
          marker.bDelayDraw=0;
        }
      }
      return;
    }

    if (this._markers.length < this._minClusterSize) {
      this._clusterMarker.hide();
      for (var i = 0, marker; marker = this._markers[i]; i++) {
        if( bDelayDraw ) marker.bDelayDraw=1;
        else
        {
          this._map.addOverlay(marker);
          marker.bDelayDraw=0;
        }
      }
      return;
    }

    this._clusterMarker.setPosition(this._center);

    this._clusterMarker.setText(this._markers.length);

    var thatMap = this._map;
    var thatBounds = this.getBounds();
    this._clusterMarker.addEventListener("click", function(event){
      thatMap.setViewport(thatBounds);
    });

  };

  /**
   * 删除该聚合。
   * @return 无返回值。
   */
  remove(){
    for (var i = 0, m; m = this._markers[i]; i++) {
      this._markers[i].getMap() && this._map.removeOverlay(this._markers[i]);
    }//清除散的标记点
    this._map.removeOverlay(this._clusterMarker);
    this._markers.length = 0;
    delete this._markers;
  }

  /**
   * 获取该聚合所包含的所有标记的最小外接矩形的范围。
   * @return {BMap.Bounds} 计算出的范围。
   */
  getBounds() {
    var bounds = new BMap.Bounds(this._center,this._center);
    for (var i = 0, marker; marker = this._markers[i]; i++) {
      bounds.extend(marker.getPosition());
    }
    return bounds;
  };

  /**
   * 获取该聚合的落脚点。
   * @return {BMap.Point} 该聚合的落脚点。
   */
  getCenter() {
    return this._center;
  };
}
