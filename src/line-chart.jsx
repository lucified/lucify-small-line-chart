
import React from 'react';
import d3 from 'd3';
import _ from 'lodash';

import styles from './line-chart.scss';


export default class LineChart extends React.Component {

  static propTypes = {
    data: React.PropTypes.arrayOf(React.PropTypes.array),
    margin: React.PropTypes.objectOf(React.PropTypes.number),
    width: React.PropTypes.number,
    height: React.PropTypes.number,
    minY: React.PropTypes.number,
    maxY: React.PropTypes.number,
    xFormat: React.PropTypes.func,
    yFormat: React.PropTypes.func,
    yTickFormat: React.PropTypes.func,
    xTickMargin: React.PropTypes.number,
    xTickFormat: React.PropTypes.func,
    transitionLength: React.PropTypes.number,
    selectedX: React.PropTypes.number,
    onSelectedChange: React.PropTypes.func,
    styles: React.PropTypes.object
    //locale: React.PropTypes.object
  }

  static defaultProps = {
    margin: {
      top: 15,
      right: 5,
      bottom: 20,
      left: 20
    },
    width: 150,
    height: 150,
    transitionLength: 250,
    locale: d3.locale({
      'decimal': '.',
      'thousands': ',',
      'grouping': [3],
      'currency': ['$', ''],
      'dateTime': '%a %b %e %X %Y',
      'date': '%m/%d/%Y',
      'time': '%H:%M:%S',
      'periods': ['AM', 'PM'],
      'days': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      'shortDays': ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      'months': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
      'shortMonths': ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
    }),
    xFormat: null,
    yFormat: null,
    xTickMargin: 15,
    xTickFormat: null,
    yTickFormat: null,
    styles: styles
  }

  getXFormat() {
    if (this.props.xFormat) {
      return this.props.xFormat;
    }
    return this.props.locale.numberFormat('n');
  }

  getYFormat() {
    if (this.props.yFormat) {
      return this.props.yFormat;
    }
    return this.props.locale.numberFormat('n');
  }

  getXTickFormat() {
    if (this.props.xTickFormat) {
      return this.props.xTickFormat;
    }
    return this.props.locale.numberFormat('n');
  }

  getYTickFormat() {
    if (this.props.yTickFormat) {
      console.log("using custom ytickFormat");
      return this.props.yTickFormat;
    }
    return this.props.locale.numberFormat('s');
  }

  getWidth() {
    return this.props.width;
  }


  getHeight() {
    return this.props.height;
  }


  getScaleWidth() {
    return this.props.width - this.props.margin.left - this.props.margin.right;
  }


  getScaleHeight() {
    return this.props.height - this.props.margin.top - this.props.margin.bottom;
  }


  getYScale() {
    return d3.scale.linear().range([this.getScaleHeight(), this.props.margin.bottom])
      .domain([this.getMinY(), this.getMaxY()]);
  }


  getXScale() {
    let extentX = d3.extent(this.props.data, d => d[0]);
    return d3.scale.linear().range([0, this.getScaleWidth()])
      .domain(extentX);
  }


  getMinY() {
    if (!this.props.minY && this.props.minY !== 0) {
      return d3.min(this.props.data, d => d[1]);
    }
    return this.props.minY;
  }


  getMaxY() {
    if (!this.props.maxY) {
      return d3.max(this.props.data, d => d[1]);
    }
    return this.props.maxY;
  }


  getData() {
    return this.props.data;
  }


  findClosestX(value) {
    let smallestDiff = 99999;
    let closest = null;
    this.getData().forEach(item => {
      const diff = Math.abs(value - item[0]);
      if (smallestDiff > diff) {
        smallestDiff = diff;
        closest = item[0];
      }
    });
    return closest;
  }


  handleMouseMove() {
    if (this.props.onSelectedChange) {
      const mousePos = d3.mouse(React.findDOMNode(this));
      const x = this.getXScale().invert(mousePos[0] - this.props.margin.left);
      const closest = this.findClosestX(x);

      this.props.onSelectedChange(+closest);
    }
  }


  componentDidMount() {
    d3.select(React.findDOMNode(this))
      .on('mousemove', this.handleMouseMove.bind(this));
    this.update();
  }


  handleMouseLeave() {
    if (this.props.onSelectedChange) {
      this.props.onSelectedChange(null);
    }
  }


  componentDidUpdate() {
    this.update();
  }


  update() {
    this.drawYAxis();
    this.updateAreaAndLine();
  }


  drawYAxis() {
    let yScale = this.getYScale();
    let yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)
      .outerTickSize(0)
      .tickSubdivide(1)
      .tickSize(-this.getScaleWidth())
      .tickFormat(this.getYTickFormat());

    d3.select(React.findDOMNode(this.refs.yAxis))
      .transition(this.props.transitionLength)
      .call(yAxis);
  }


  updateAreaAndLine() {
    let yScale = this.getYScale();
    let xScale = this.getXScale();

    let area = d3.svg.area()
      .x(d => xScale(d[0]))
      .y0(this.getScaleHeight())
      .y1(d => yScale(d[1]));

    let line = d3.svg.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

    let data = this.getData();

    d3.select(React.findDOMNode(this.refs.area))
        .transition().duration(this.props.transitionLength)
        .attr('d', area(data));

    d3.select(React.findDOMNode(this.refs.line))
        .transition().duration(this.props.transitionLength)
        .attr('d', line(data));
  }


  labelPlacement(label, x, min, max) {
    let perChar = 3;
    let a = -2.5;
    let d = label.length*perChar;
    let move = 0;
    if(x - min < d + a)
      move = d + a - x;
    if(max - x < d + a)
      move = max - a - x - d;
    return move;
  }

  getSelection() {

    if (!this.props.selectedX) {
      return;
    }

    let found = _.find(this.props.data, item => item[0] == this.props.selectedX);

    if (!found) {
      console.log('selection not found');
      return <g />;
    }

    let selectedX = this.props.selectedX;
    let xScale = this.getXScale();
    let circleX = xScale(selectedX);
    let circleY = this.getYScale()(found[1]);

    let maxX = this.getScaleWidth();
    let minX = 0;

    let xTick = this.getXFormat()(this.props.selectedX);
    let xTickMove = this.labelPlacement(xTick, circleX, minX, maxX);

    let yTick = this.getYFormat()(found[1]);

    return (
      <g>
        <circle className={this.props.styles['circle']}
          r={2.5}
          cx={circleX}
          cy={circleY}
          style={{pointerEvents: 'none'}} />
        <text className={this.props.styles['caption']}
          x={circleX}
          y={circleY}
          textAnchor="middle"
          dy={-8}
          style={{pointerEvents: 'none'}}>
          {yTick}
        </text>
        <text className={this.props.styles['xtick']}
          x={circleX + xTickMove}
          textAnchor="middle"
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          style={{pointerEvents: 'none'}}>
          {xTick}
        </text>
      </g>
    );
  }


  getXAxisTicks() {
    if (this.props.selectedX) {
      return null;
    }

    let data = this.getData();

    return (
      <g>
        <text className={this.props.styles['static-xtick']}
          textAnchor="start"
          style={{pointerEvents: 'none'}}
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          x={0}>
          {this.getXFormat()(data[0][0])}
        </text>
        <text className={this.props.styles['static-xtick']}
          textAnchor="end"
          style={{pointerEvents: 'none'}}
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          x={this.getScaleWidth()}>
          {this.getXFormat()(data[data.length - 1][0])}
        </text>
      </g>
    );
  }


  render(){

    let transform = `translate(${this.props.margin.left}, ${this.props.margin.top})`;

    return (
      <svg className={this.props.styles['main']}
        onMouseLeave={this.handleMouseLeave.bind(this)}
        width={this.props.width} height={this.props.height}>

        <g transform={transform} ref='mainTransform'>

          <g className={this.props.styles['axis']} ref='yAxis' />

          <g>
            <path ref='area' className={this.props.styles['area']} style={{pointerEvents: 'none'}} />
            <path ref='line' className={this.props.styles['line']} style={{pointerEvents: 'none'}} />
          </g>

          {this.getXAxisTicks()}
          {this.getSelection()}

        </g>

      </svg>
    );
  }

}


LineChart.prototype.displayName = 'LucifySmallLineChart';
