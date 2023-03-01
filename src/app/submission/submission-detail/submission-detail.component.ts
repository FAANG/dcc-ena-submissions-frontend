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
  relatedExperiments: Array<any>;
  studyId: string;
  submission: any;
  error: any;

  constructor(private dataService: ApiDataService,
              private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private spinner: NgxSpinnerService,) { }

  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.studyId = params['id'];
      console.log(this.studyId);
      this.titleService.setTitle(`${this.studyId} | FAANG dataset`);
    });
    this.dataService.getEnaSubmission(this.studyId).subscribe(
      (data: any) => {
        if (data['hits']['hits'].length === 0) {
          this.spinner.hide();
          this.router.navigate(['404']);
        } else {
          this.submission = data['hits']['hits'][0]['_source'];
          if (this.submission) {
            this.relatedExperiments = data['hits']['hits'][0]['_source']['experiments'];
            console.log(this.submission);
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
