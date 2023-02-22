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
  current_active_filters = this.aggregationService.current_active_filters;

  constructor(
    private aggregationService: AggregationService,
    private cdRef: ChangeDetectorRef) { }

  ngOnInit() {
    console.log("tile: ", this.title)
    this.itemLimit = this.filterSize;
    this.subsription = this.aggregationService.data.subscribe(
      (data: any) => {
        // data is a map, keys are active_filters names defined in service/aggregatin_service.ts,
        // values are the corresponding aggregation e.g. { "FAANG":675,"Legacy": 9834}
        if (this.title === 'Assay type') {
          this.aggregation = data['assay_type'];
        }
        this.cdRef.detectChanges();
      }
    );
  }

  onButtonClick(key: string, title: string) {
    let data_key: string;
    // the data_key refers to active_filters defined in service/aggregatin_service.ts
    switch (title) {
      case 'Assay type': {
        data_key = 'assay_type';
        break;
      }
    }
    const index = this.aggregationService.active_filters[data_key].indexOf(key);
    if (index > -1) {
      this.aggregationService.active_filters[data_key].splice(index, 1);
    } else {
      this.aggregationService.active_filters[data_key].push(key);
    }

    const active_filter_index = this.aggregationService.current_active_filters.indexOf(key);
    if (index > -1) {
      this.aggregationService.current_active_filters.splice(active_filter_index, 1);
    } else {
      this.aggregationService.current_active_filters.push(key);
    }

    this.aggregationService.field.next(this.aggregationService.active_filters);
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

