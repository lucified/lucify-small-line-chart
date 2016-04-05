
import LineChart from './line-chart.jsx';
import React from 'react';
import _ from 'lodash';


export default class Example extends React.Component {

  constructor(props) {
    super(props);
    this.handleSelectedChange = this.handleSelectedChange.bind(this);
    this.handleChecked = this.handleChecked.bind(this);
  }


  state = {
    selectedX: 10,
    checked: false,
  }


  componentWillMount() {
    this.data1 = _.range(1, 100).map(index => [index, Math.log(index)]);
    this.data2 = _.range(1, 100).map(index => [index, Math.log(index) * 2]);
  }


  getData() {
    if (this.state.checked) {
      return this.data1;
    }

    return this.data2;
  }

  getCharts() {
    return _.range(0, 40).map(index => (
      <LineChart
        key={index}
        maxY={10}
        width={200}
        aspectRatio={0.8}
        data={this.getData()}
        xFormat={this.xFormat}
        onSelectedChange={this.handleSelectedChange}
        selectedX={this.state.selectedX}
        yFormat={this.yFormat}
      />
    ));
  }


  handleSelectedChange(x) {
    this.setState({ selectedX: x });
  }


  xFormat(value) {
    return value.toFixed(1);
  }


  yFormat(value) {
    return value.toFixed(2);
  }


  handleChecked() {
    this.setState({ checked: !this.state.checked });
  }


  render() {
    return (
      <div>
        <h3>Example of two small linked line charts</h3>
        <div>
          <input type="checkbox"
            checked={this.state.checked}
            onChange={this.handleChecked}
          />
          Alternative data
        </div>
        <p>
          Selected: {this.state.selectedX}
        </p>
        {this.getCharts()}
      </div>
    );
  }

}

Example.prototype.displayName = 'Example';
