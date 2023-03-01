import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {SubmissionComponent} from "./submission/submission.component";
import {SubmissionDetailComponent} from './submission/submission-detail/submission-detail.component';
import {PageNotFoundComponent} from "./page-not-found/page-not-found.component";

const routes: Routes = [
  {path: '', component: SubmissionComponent},
  {path: 'submissions', component: SubmissionComponent},
  {path: 'submissions/:id', component: SubmissionDetailComponent},
  {path: '404', component: PageNotFoundComponent},
  {path: '**', component: PageNotFoundComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
