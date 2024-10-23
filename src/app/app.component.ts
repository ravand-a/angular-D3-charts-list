import { Component, AfterViewChecked, ChangeDetectorRef } from '@angular/core';
import * as d3 from 'd3';
import { multiYearData } from './data';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent implements AfterViewChecked {
  data = multiYearData;
  selectedCategory = 'germanCars';
  categories = [
    { name: 'German Cars', key: 'germanCars' },
    { name: 'Japanese Cars', key: 'japaneseCars' },
    { name: 'American Cars', key: 'americanCars' },
  ];
  filteredData = this.data[this.selectedCategory];
  chartRendered = false;
  showModal = false;
  modalCar = null;
  menuOpen = false; // Property to track the menu state

  constructor(private cdr: ChangeDetectorRef) {}

  ngAfterViewChecked() {
    if (!this.chartRendered) {
      this.renderCharts();
      this.chartRendered = true;
    }
  }

  onCategoryChange() {
    this.chartRendered = false;
    this.clearCharts();
    this.filteredData = this.data[this.selectedCategory];
    setTimeout(() => {
      this.renderCharts();
      this.chartRendered = true;
      this.cdr.detectChanges();
    }, 0);
  }

  renderCharts() {
    this.filteredData.forEach((car, index) => {
      this.createLineChart(`#chart-${index}`, car.series, car);
    });
  }

  createLineChart(chartContainer: string, seriesData: any[], car: any) {
    const margin = { top: 10, right: 20, bottom: 30, left: 60 };
    const width = 180 - margin.left - margin.right;
    const height = 75 - margin.top - margin.bottom;

    const svg = d3
      .select(chartContainer)
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .on('click', () => this.openModal(car))
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xExtent = d3.extent(seriesData, (d: any) => d.year);
    const x = d3.scaleLinear().domain([xExtent[0], xExtent[1]]).range([0, width]);

    const yExtent = d3.extent(seriesData, (d: any) => d.value);
    const y = d3.scaleLinear().domain([yExtent[0], yExtent[1]]).range([height, 0]);

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

  clearCharts() {
    d3.selectAll('.chart-container svg').remove();
  }

  // Function to toggle the menu
  toggleMenu() {
    this.menuOpen = !this.menuOpen;
  }

  openModal(car: any) {
    this.showModal = true;
    this.modalCar = car;

    setTimeout(() => {
      this.createModalChart(car.series);
    }, 0);
  }

  createModalChart(seriesData: any[]) {
    this.clearModalChart();

    const margin = { top: 10, right: 20, bottom: 50, left: 60 };
    const width = 600 - margin.left - margin.right;
    const height = 300 - margin.top - margin.bottom;

    const svg = d3
      .select('#modal-chart')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`);

    const xExtent = d3.extent(seriesData, (d: any) => d.year);
    const x = d3.scaleLinear().domain([xExtent[0], xExtent[1]]).range([0, width]);
    svg.append('g').attr('transform', `translate(0, ${height})`).call(d3.axisBottom(x).tickFormat(d3.format('d')));

    const yExtent = d3.extent(seriesData, (d: any) => d.value);
    const y = d3.scaleLinear().domain([yExtent[0], yExtent[1]]).range([height, 0]);
    svg.append('g').call(d3.axisLeft(y));

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
      .attr('d', line);
  }

  closeModal() {
    this.showModal = false;
    this.clearModalChart();
  }

  clearModalChart() {
    d3.selectAll('#modal-chart svg').remove();
  }
}
