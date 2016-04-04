
import LineChart from './line-chart.jsx';
import React from 'react';
import _ from 'lodash';


export default class Example extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedX: 10,
      checked: false
    };
  }

  handleSelectedChange(x) {
    this.setState({selectedX: x});
  }


  xFormat(value) {
    return value.toFixed(1);
  }


  yFormat(value) {
    return value.toFixed(2);
  }


  getCharts() {
    return _.range(0, 40).map(index => {
      return (<LineChart
        key={index}
        maxY={10}
        width={200}
        aspectRatio={0.8}
        data={this.getData()}
        xFormat={this.xFormat}
        onSelectedChange={this.handleSelectedChange.bind(this)}
        selectedX={this.state.selectedX}
        yFormat={this.yFormat} />);
    });

  }


  handleChecked() {
    this.setState({checked: !this.state.checked});
  }


  render() {
    return (
      <div>
        <h3>Example of two small linked line charts</h3>
        <div><input type="checkbox"
          checked={this.state.checked}
          onChange={this.handleChecked.bind(this)} /> Alternative data</div>
        <p>Selected: {this.state.selectedX}</p>
        {this.getCharts()}
      </div>
    );
  }


  componentWillMount() {
    this.data1 = _.range(1, 100).map(index => {
      return [index, Math.log(index)];
    });
    this.data2 = _.range(1, 100).map(index => {
      return [index, Math.log(index)*2];
    });
  }


  getData() {
    if (this.state.checked) {
      return this.data1;
    } else {
      return this.data2;
    }
  }

}

Example.prototype.displayName = 'Example';
