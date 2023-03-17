import { Component, OnInit } from '@angular/core';
import {ActivatedRoute, Params, Router} from '@angular/router';
import {Title} from '@angular/platform-browser';
import {ApiDataService} from '../../services/api-data.service';

@Component({
  selector: 'app-unsubscribe',
  templateUrl: './unsubscribe.component.html',
  styleUrls: ['./unsubscribe.component.css']
})
export class UnsubscribeComponent implements OnInit {
  studyId: string;
  email: string;
  dialogRef: any;

  constructor(private route: ActivatedRoute,
              private router: Router,
              private titleService: Title,
              private dataService: ApiDataService) { }


  ngOnInit(): void {
    this.route.params.subscribe((params: Params) => {
      this.studyId = params['studyId'];
      this.email = params['subscriberEmail']
      this.titleService.setTitle(`Unsubscribe from ${this.studyId} | Unsubscribe`);
    });
  }

  cancelUnsubscribe(){
    this.router.navigate(['/submissions'])
  }

  unsubscribeEmail(email){
    this.dataService.unsubscribeUser(this.studyId, this.email).subscribe(response => {
        console.log(response)
        console.log("You have now been unsubscribed!")
        this.router.navigate(['/submissions'])
      },
      error => {
        console.log(error);
      }
    );

  }

}
