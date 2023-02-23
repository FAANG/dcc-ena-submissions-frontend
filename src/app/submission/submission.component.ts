import {Component, OnDestroy, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {ApiDataService} from '../services/api-data.service';
import {AggregationService} from '../services/aggregation.service';
import {Observable, Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TableServerSideComponent} from "../table-server-side/table-server-side.component";

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})


export class SubmissionComponent implements OnInit, OnDestroy {
  @ViewChild(TableServerSideComponent, { static: true }) tableServerComponent: TableServerSideComponent;
  public loadTableDataFunction: Function;
  displayFields: string[] = ['studyId', 'studyAlias', 'assayType', 'numberOfExperiments', 'numberOfRuns', 'numberOfFiles'];
  columnNames: string[] = ['Study Id', 'Study Alias', 'Assay Type', 'Number of Experiments',  'Number of runs', 'Number of Files'];
  filter_field: {};
  templates: Object;
  aggrSubscription: Subscription;
  data = {};

  query = {
    'sort': ['study_id','desc'],
    '_source': [
      'study_id',
      'study_alias',
      'assay_type',
      'experiments.accession',
      'runs.accession',
      'files.name'],
    'search': ''
  };

  defaultSort = ['study_id','desc'];
  error: string;

  constructor(private dataService: ApiDataService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private aggregationService: AggregationService,
              private titleService: Title) { }

  ngOnInit() {
    this.loadTableDataFunction = this.dataService.getAllEnaSubmissions.bind(this.dataService);
    this.titleService.setTitle('ENA Submissions');
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.resetFilter();
      const filters = {};
      for (const key in params) {
        if (Array.isArray(params[key])) { // multiple values chosed for one filter
          filters[key] = params[key];
          for (const value of params[key]) {
            this.aggregationService.current_active_filters.push(value);
            this.aggregationService.active_filters[key].push(value);
          }
        } else {
          filters[key] = [params[key]];
          this.aggregationService.current_active_filters.push(params[key]);
          this.aggregationService.active_filters[key].push(params[key]);
        }
      }
      this.aggregationService.field.next(this.aggregationService.active_filters);
      this.filter_field = filters;
      this.query['filters'] = filters;
      this.filter_field = Object.assign({}, this.filter_field);
    });
    this.tableServerComponent.dataUpdate.subscribe((data) => {
      this.aggregationService.getAggregations(data.aggregations);
    });
    this.tableServerComponent.sortUpdate.subscribe((sortParams) => {
    });
    this.aggrSubscription = this.aggregationService.field.subscribe((data) => {
      const params = {};
      for (const key of Object.keys(data)) {
        if (data[key].length !== 0) {
          params[key] = data[key];
        }
      }
      this.router.navigate(['submissions'], {queryParams: params});
    });
  }

  hasActiveFilters() {
    console.log("this.filter_field: ", this.filter_field)
    if (typeof this.filter_field === 'undefined') {
      return false;
    }
    for (const key of Object.keys(this.filter_field)) {
      if (this.filter_field[key].length !== 0) {
        return true;
      }
    }
    return false;
  }

  resetFilter() {
    for (const key of Object.keys(this.aggregationService.active_filters)) {
      this.aggregationService.active_filters[key] = [];
    }
    this.aggregationService.current_active_filters = [];
    this.filter_field = Object.assign({}, this.filter_field);
  }

  removeFilter() {
    this.resetFilter();
    this.router.navigate(['submissions'], {queryParams: {}});
  }

  ngOnDestroy() {
    if (typeof this.filter_field !== 'undefined') {
      this.resetFilter();
    }
    this.aggrSubscription.unsubscribe();
  }
}
