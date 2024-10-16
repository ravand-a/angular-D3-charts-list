import { Component, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { multiYearData } from './data'; 

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewChecked {
  data = multiYearData; // Original data containing all categories
  selectedCategory = 'germanCars'; // Default selected category
  categories = [
    { name: 'German Cars', key: 'germanCars' },
    { name: 'Japanese Cars', key: 'japaneseCars' },
    { name: 'American Cars', key: 'americanCars' },
  ];
  filteredData = this.data[this.selectedCategory]; // Filtered data based on selected category
  chartRendered = false; // Flag to track if the charts are already rendered

  constructor(private cdr: ChangeDetectorRef) {}

  // Lifecycle hook to render charts when the view is checked
  ngAfterViewChecked() {
    if (!this.chartRendered) {
      this.renderCharts();
      this.chartRendered = true; // Mark charts as rendered to prevent re-rendering
    }
  }

  // Function to handle category change
  onCategoryChange() {
    this.chartRendered = false; // Reset flag to re-render charts
    this.clearCharts(); // Clear previous charts
    this.filteredData = this.data[this.selectedCategory]; // Update filtered data based on selected category
    setTimeout(() => {
      this.renderCharts();
      this.chartRendered = true;
      this.cdr.detectChanges(); // Ensure Angular detects changes
    }, 0);
  }

  // Function to render charts for the current filtered data
  renderCharts() {
    this.filteredData.forEach((car, index) => {
      this.createLineChart(`#chart-${index}`, car.series); // Draw chart for each car
    });
  }

  // Function to create and render the line chart using D3.js
  createLineChart(chartContainer: string, seriesData: any[]) {
    const margin = { top: 10, right: 20, bottom: 30, left: 60 };
    const width = 180 - margin.left - margin.right;
    const height = 75 - margin.top - margin.bottom;

    const svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xExtent = d3.extent(seriesData, (d: any) => d.year);
    const x = d3
      .scaleLinear()
      .domain([xExtent[0], xExtent[1]])
      .range([0, width]);

    const yExtent = d3.extent(seriesData, (d: any) => d.value);
    const y = d3
      .scaleLinear()
      .domain([yExtent[0], yExtent[1]])
      .range([height, 0]);

    const line = d3
      .line()
      .x((d: any) => x(d.year))
      .y((d: any) => y(d.value));

    svg
      .append('path')
      .datum(seriesData)
      .attr('fill', 'none')
      .attr('stroke', 'orange')
      .attr('stroke-width', 4)
      .attr('d', line)
      .attr('stroke-dasharray', function () {
        return this.getTotalLength();
      })
      .attr('stroke-dashoffset', function () {
        return this.getTotalLength();
      })
      .transition()
      .duration(1400)
      .attr('stroke-dashoffset', 0);
  }

  // Clear charts before re-rendering (for switching categories)
  clearCharts() {
    d3.selectAll('.chart-container svg').remove();
  }
}
