import { Component, OnInit } from '@angular/core';
import {ApiDataService} from '../../services/api-data.service';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {NgxSpinnerService} from 'ngx-spinner';

@Component({
  selector: 'app-submission-detail',
  templateUrl: './submission-detail.component.html',
  styleUrls: ['./submission-detail.component.css']
})
export class SubmissionDetailComponent implements OnInit {
  submittedExperiments: Array<any> = [];
  submittedAnalyses: Array<any> = [];
  studyId: string;
  error: any;
  displayedColumns: string[];
  displayTable: Boolean = false;
  submission: any;
  readonly ena_prefix = 'https://www.ebi.ac.uk/ena/browser/view/';

  constructor(private dataService: ApiDataService,
              private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.studyId = params['id'];
      this.titleService.setTitle(`${this.studyId} | ENA Submission`);
    });
    this.displayedColumns = ['accession', 'alias', 'submission_date', 'available_in_portal'];
    this.dataService.getEnaSubmission(this.studyId).subscribe(
      (data: any) => {
        if (data['hits']['hits'].length === 0) {
          this.spinner.hide();
          this.router.navigate(['404']);
        } else {
          if (data['hits']['hits'].length > 0) {
            this.submission = data['hits']['hits'][0]['_source'];
            const availableInPortal = data['hits']['hits'][0]['_source']['available_in_portal'] || 'false'
            const submissionDate = data['hits']['hits'][0]['_source']['submission_date']
            const relatedExperiments = data['hits']['hits'][0]['_source']['experiments'] || [];
            const relatedRuns = data['hits']['hits'][0]['_source']['runs'] || [];
            const relatedAnalyses = data['hits']['hits'][0]['_source']['analyses'] || [];

            if (relatedExperiments.length > 0){
              relatedExperiments.map(obj => Object.assign(obj, {
                submission_date: submissionDate
              }));
              this.submittedExperiments.push(...relatedExperiments);
            }
            if (relatedAnalyses.length > 0){
              relatedAnalyses.map(obj => Object.assign(obj, {
                submission_date: submissionDate}));
              this.submittedAnalyses.push(...relatedAnalyses);
            }

            this.displayTable = true;
          }
        }
        this.spinner.hide();
      },
      error => {
        this.error = error;
        this.spinner.hide();
      }
    );
  }

}
