
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
    axisTransitionLength: React.PropTypes.number,
    selectedX: React.PropTypes.number,
    onSelectedChange: React.PropTypes.func,
    styles: React.PropTypes.object,
    aspectRatio: React.PropTypes.number,
    locale: React.PropTypes.object,
  }

  static defaultProps = {
    styles,
    margin: {
      top: 15,
      right: 5,
      bottom: 20,
      left: 20,
    },
    width: 150,
    height: null,
    aspectRatio: 1.0,
    transitionLength: 250,
    axisTransitionLength: 0,
    locale: d3.locale({
      decimal: '.',
      thousands: ',',
      grouping: [3],
      currency: ['$', ''],
      dateTime: '%a %b %e %X %Y',
      date: '%m/%d/%Y',
      time: '%H:%M:%S',
      periods: ['AM', 'PM'],
      days: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      shortDays: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      months: ['January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'],
      shortMonths: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
        'Sep', 'Oct', 'Nov', 'Dec'],
    }),
    xFormat: null,
    yFormat: null,
    xTickMargin: 15,
    xTickFormat: null,
    yTickFormat: null,
  }


  constructor(props) {
    super(props);
    this.handleMouseLeave = this.handleMouseLeave.bind(this);
  }


  componentDidMount() {
    d3.select(React.findDOMNode(this))
      .on('mousemove', this.handleMouseMove.bind(this));
    this.update();
  }


  componentDidUpdate(prevProps) {
    if (prevProps.data !== this.props.data
      || prevProps.margin !== this.props.margin
      || prevProps.width !== this.props.width
      || prevProps.height !== this.props.height
      || prevProps.minY !== this.props.minY
      || prevProps.maxY !== this.props.maxY
      || prevProps.xFormat !== this.props.xFormat
      || prevProps.yFormat !== this.props.yFormat
      || prevProps.yTickFormat !== this.props.yTickFormat
      || prevProps.xTickFormat !== this.props.xTickFormat
      || prevProps.aspectRatio !== this.props.aspectRatio
      || prevProps.locale !== this.props.locale) {
      this.update();
    }
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
      return this.props.yTickFormat;
    }
    return this.props.locale.numberFormat('s');
  }


  getWidth() {
    return this.props.width;
  }


  getHeight() {
    if (this.props.height) {
      return this.props.height;
    }
    return this.props.width * this.props.aspectRatio;
  }


  getScaleWidth() {
    return this.props.width - this.props.margin.left - this.props.margin.right;
  }


  getScaleHeight() {
    return this.getHeight() - this.props.margin.top - this.props.margin.bottom;
  }


  getYScale() {
    return d3.scale.linear().range([this.getScaleHeight(), this.props.margin.bottom])
      .domain([this.getMinY(), this.getMaxY()]);
  }


  getXScale() {
    const extentX = d3.extent(this.props.data, d => d[0]);
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


  getSelection() {
    if (!this.props.selectedX) {
      return null;
    }

    const found = _.find(this.props.data, item => item[0] === this.props.selectedX);

    if (!found) {
      console.log('selection not found');
      return <g />;
    }

    const selectedX = this.props.selectedX;
    const xScale = this.getXScale();
    let circleX = xScale(selectedX);
    let circleY = this.getYScale()(found[1]);

    const maxX = this.getScaleWidth();
    const minX = 0;

    let xTick = this.getXFormat()(this.props.selectedX);
    const xTickMove = this.labelPlacement(xTick, circleX, minX, maxX);

    let yTick = this.getYFormat()(found[1]);

    return (
      <g>
        <circle className={this.props.styles.circle}
          r={2.5}
          cx={circleX}
          cy={circleY}
          style={{ pointerEvents: 'none' }}
        />
        <text className={this.props.styles.caption}
          x={circleX}
          y={circleY}
          textAnchor="middle"
          dy={-8}
          style={{ pointerEvents: 'none' }}
        >
          {yTick}
        </text>
        <text className={this.props.styles.xtick}
          x={circleX + xTickMove}
          textAnchor="middle"
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          style={{ pointerEvents: 'none' }}
        >
          {xTick}
        </text>
      </g>
    );
  }


  getXAxisTicks() {
    if (this.props.selectedX) {
      return null;
    }

    const data = this.getData();

    return (
      <g>
        <text className={this.props.styles['static-xtick']}
          textAnchor="start"
          style={{ pointerEvents: 'none' }}
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          x={0}
        >
          {this.getXTickFormat()(data[0][0])}
        </text>
        <text className={this.props.styles['static-xtick']}
          textAnchor="end"
          style={{ pointerEvents: 'none' }}
          dy={this.props.xTickMargin}
          y={this.getScaleHeight()}
          x={this.getScaleWidth()}
        >
          {this.getXTickFormat()(data[data.length - 1][0])}
        </text>
      </g>
    );
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


  handleMouseLeave() {
    if (this.props.onSelectedChange) {
      this.props.onSelectedChange(null);
    }
  }


  update() {
    this.drawYAxis();
    this.updateAreaAndLine();
  }


  drawYAxis() {
    const yScale = this.getYScale();
    const yAxis = d3.svg.axis()
      .scale(yScale)
      .orient('left')
      .ticks(4)
      .outerTickSize(0)
      .tickSubdivide(1)
      .tickSize(-this.getScaleWidth())
      .tickFormat(this.getYTickFormat());

    d3.select(React.findDOMNode(this.refs.yAxis))
      .transition(this.props.axisTransitionLength)
      .call(yAxis);
  }


  updateAreaAndLine() {
    const yScale = this.getYScale();
    const xScale = this.getXScale();

    const area = d3.svg.area()
      .x(d => xScale(d[0]))
      .y0(this.getScaleHeight())
      .y1(d => yScale(d[1]));

    const line = d3.svg.line()
      .x(d => xScale(d[0]))
      .y(d => yScale(d[1]));

    const data = this.getData();

    d3.select(React.findDOMNode(this.refs.area))
        .transition().duration(this.props.transitionLength)
        .attr('d', area(data));

    d3.select(React.findDOMNode(this.refs.line))
        .transition().duration(this.props.transitionLength)
        .attr('d', line(data));
  }


  labelPlacement(label, x, min, max) {
    const perChar = 3;
    const a = -2.5;
    const d = label.length * perChar;
    let move = 0;
    if (x - min < d + a) move = d + a - x;
    if (max - x < d + a) move = max - a - x - d;
    return move;
  }


  render() {
    let transform = `translate(${this.props.margin.left}, ${this.props.margin.top})`;

    return (
      <svg className={this.props.styles.main}
        onMouseLeave={this.handleMouseLeave}
        width={this.props.width} height={this.getHeight()}
      >

        <g transform={transform} ref="mainTransform">

          <g className={this.props.styles.axis} ref="yAxis" />

          <g>
            <path ref="area" className={this.props.styles.area} style={{ pointerEvents: 'none' }} />
            <path ref="line" className={this.props.styles.line} style={{ pointerEvents: 'none' }} />
          </g>

          {this.getXAxisTicks()}
          {this.getSelection()}

        </g>

      </svg>
    );
  }

}


LineChart.prototype.displayName = 'LucifySmallLineChart';
