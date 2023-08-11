import {Component, OnDestroy, OnInit, Input, ChangeDetectorRef} from '@angular/core';
import {Subscription} from 'rxjs';
import {AggregationService} from "../services/aggregation.service";

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})

export class FilterComponent implements OnInit, OnDestroy {
  @Input() title: string;
  @Input() filterSize: number;
  aggregation = [];
  subsription: Subscription;
  isCollapsed = true;
  itemLimit: number;
  currentActiveFilters = this.aggregationService.currentActiveFilters;

  constructor(
    private aggregationService: AggregationService,
    private cdRef: ChangeDetectorRef) {
  }

  ngOnInit() {
    console.log("tile: ", this.title)
    this.itemLimit = this.filterSize;
    this.subsription = this.aggregationService.data.subscribe(
      (data: any) => {
        // data is a map, keys are activeFilters names defined in service/aggregatin_service.ts,
        // values are the corresponding aggregation e.g. { "FAANG":675,"Legacy": 9834}
        if (this.title === 'Assay type') {
          this.aggregation = data['assay_type'];
        }
        else if (this.title === 'Secondary project') {
          this.aggregation = data['secondary_project'];
        }
        else if (this.title === 'Available in Portal') {
          this.aggregation = data['available_in_portal'];
        }
        this.cdRef.detectChanges();
      }
    );
  }

  onButtonClick(filterVal: string, title: string) {
    let aggField: string;
    // the data_key refers to activeFilters defined in service/aggregatin_service.ts
    switch (title) {
      case 'Assay type': {
        aggField = 'assay_type';
        break;
      }
      case 'Secondary project': {
        aggField = 'secondary_project';
        break;
      }
      case 'Available in Portal': {
        aggField = 'available_in_portal';
        break;
      }
    }
    const index = this.aggregationService.activeFilters[aggField].indexOf(filterVal);
    if (index > -1) {
      this.aggregationService.activeFilters[aggField].splice(index, 1);
    } else {
      this.aggregationService.activeFilters[aggField].push(filterVal);
    }

    const currentActiveFilterIndex = this.aggregationService.currentActiveFilters.indexOf(filterVal);
    if (index > -1) {
      this.aggregationService.currentActiveFilters.splice(currentActiveFilterIndex, 1);
    } else {
      this.aggregationService.currentActiveFilters.push(filterVal);
    }

    this.aggregationService.field.next(this.aggregationService.activeFilters);
  }

  toggleCollapse() {
    if (this.isCollapsed) {
      this.itemLimit = 10000;
      this.isCollapsed = false;
    } else {
      this.itemLimit = this.filterSize;
      this.isCollapsed = true;
    }
  }

  ngOnDestroy() {
    this.subsription.unsubscribe();
  }
}
