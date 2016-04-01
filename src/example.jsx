
import LineChart from './line-chart.jsx';
import React from 'react';
import _ from 'lodash';


export default class Example extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      selectedX: 10
    };
  }

  handleSelectedChange(x) {
    this.setState({selectedX: x});
  }

  render() {
    return (
      <div>
        <h3>Example of two small linked line charts</h3>
        <p>Selected: {this.state.selectedX}</p>
        <LineChart
          maxY={10}
          width={200}
          aspectRatio={0.8}
          data={this.data1}
          xFormat={value => value.toFixed(1)}
          onSelectedChange={this.handleSelectedChange.bind(this)}
          selectedX={this.state.selectedX}
          yFormat={value => value.toFixed(2)} />
        <LineChart
          maxY={10}
          width={200}
          aspectRatio={0.8}
          data={this.data2}
          xFormat={value => value.toFixed(1)}
          onSelectedChange={this.handleSelectedChange.bind(this)}
          selectedX={this.state.selectedX}
          yFormat={value => value.toFixed(2)} />
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
    return this.data;
  }

}

Example.prototype.displayName = 'Example';
