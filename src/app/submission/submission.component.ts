import {Component, OnDestroy, OnInit, ViewChild, TemplateRef} from '@angular/core';
import {ApiDataService} from '../services/api-data.service';
import {AggregationService} from '../services/aggregation.service';
import {Observable, Subscription} from 'rxjs';
import {Title} from '@angular/platform-browser';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {TableServerSideComponent} from "../table-server-side/table-server-side.component";
import {MatDialog} from '@angular/material/dialog';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-submission',
  templateUrl: './submission.component.html',
  styleUrls: ['./submission.component.css']
})


export class SubmissionComponent implements OnInit, OnDestroy {
  @ViewChild(TableServerSideComponent, { static: true }) tableServerComponent: TableServerSideComponent;
  public loadTableDataFunction: Function;
  displayFields: string[] = ['studyId', 'studyAlias', 'assayType', 'numberOfExperiments', 'numberOfRuns',
    'numberOfFiles', 'numberOfAnalyses', 'secondaryProject', 'availableInPortal', 'submissionDate', 'subscribe'];
  columnNames: string[] = ['Study Id', 'Study Alias', 'Assay Type', 'Number of Experiments',  'Number of runs',
    'Number of Files', 'Number of Analyses', 'Project', 'Available In Portal', 'Submission Date', 'Subscribe'];
  filter_field: {};
  templates: Object;
  aggrSubscription: Subscription;
  data = {};
  subscriberEmail: string;
  dialogRef: any;
  public subscriptionForm: FormGroup;
  @ViewChild('subscriptionTemplate') subscriptionTemplate = {} as TemplateRef<any>;

  query = {
    'sort': ['submission_date','desc'],
    '_source': [
      'study_id',
      'study_alias',
      'assay_type',
      'experiments.accession',
      'runs.accession',
      'files.name',
      'analyses.accession',
      'available_in_portal',
      'submission_date',
      'secondary_project'
    ],
    'search': ''
  };

  defaultSort = ['submission_date','desc'];
  error: string;
  currentFilters: any;
  subscriptionDialogTitle: string;
  indexDetails: {};

  constructor(private dataService: ApiDataService,
              private activatedRoute: ActivatedRoute,
              private router: Router,
              private aggregationService: AggregationService,
              public dialog: MatDialog,
              private titleService: Title) { }

  ngOnInit() {
    this.indexDetails = {index: 'submissions', indexKey: 'study_id', apiKey: 'study_id'}
    this.loadTableDataFunction = this.dataService.getAllEnaSubmissions.bind(this.dataService);
    this.titleService.setTitle('ENA Submissions');
    this.activatedRoute.queryParams.subscribe((params: Params) => {
      this.resetFilter();
      const filters = {};
      console.log("params: ", params)
      for (const key in params) {
        if (Array.isArray(params[key])) { // multiple values chosed for one filter
          filters[key] = params[key];
          for (const value of params[key]) {
            this.aggregationService.currentActiveFilters.push(value);
            this.aggregationService.activeFilters[key].push(value);
          }
        } else {
          filters[key] = [params[key]];
          this.aggregationService.currentActiveFilters.push(params[key]);
          this.aggregationService.activeFilters[key].push(params[key]);
        }
      }
      this.aggregationService.field.next(this.aggregationService.activeFilters);
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
    this.currentFilters = this.aggregationService.activeFilters;

    this.subscriptionForm = new FormGroup({
      subscriberEmail: new FormControl('', [Validators.required, Validators.email]),
    });
  }

  hasActiveFilters() {
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
    for (const key of Object.keys(this.aggregationService.activeFilters)) {
      this.aggregationService.activeFilters[key] = [];
    }
    this.aggregationService.currentActiveFilters = [];
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


  openSubscriptionDialog(currentFilters: { assay_type: string[]; secondary_project: string[] }) {
    this.subscriptionDialogTitle = 'Subscribing to the filtered entries'
    this.dialogRef = this.dialog.open(this.subscriptionTemplate,
      { height: '300px', width: '400px' });
  }

  public displayError = (controlName: string, errorName: string) =>{
    return this.subscriptionForm.controls[controlName].hasError(errorName);
  }

  onCancelDialog() {
    this.dialogRef.close();
  }


  getEmail(event: Event){
    this.subscriberEmail = (<HTMLInputElement>event.target).value;
  }


  onRegister() {
    if (this.subscriptionForm.valid && this.subscriptionForm.touched){
      this.dataService.subscribeFilteredData(this.indexDetails['index'], this.indexDetails['indexKey'], this.subscriberEmail).subscribe(response => {
          console.log("You have now been subscribed!")
          this.dialogRef.close();
        },
        error => {
          console.log(error);
          this.dialogRef.close();
        }
      );
    }
  }

}
