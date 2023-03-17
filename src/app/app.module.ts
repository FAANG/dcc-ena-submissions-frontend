import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import  {FlexLayoutModule} from "@angular/flex-layout";
import { MaterialModule } from "./material.module";
import {HttpClientModule} from '@angular/common/http';
import {NgxSpinnerModule} from 'ngx-spinner';
import { AppRoutingModule } from './app-routing.module';
import {FormsModule} from '@angular/forms';
import { ReactiveFormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { SubmissionComponent } from './submission/submission.component';
import { PageNotFoundComponent } from './page-not-found/page-not-found.component';
import { HeaderComponent } from './navigation/header/header.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { TableServerSideComponent } from './table-server-side/table-server-side.component';
import { FilterComponent } from './filter/filter.component';
import { ActiveFilterComponent } from './active-filter/active-filter.component';
import { SubmissionDetailComponent } from './submission/submission-detail/submission-detail.component';
import { RelatedDataComponent } from './related-data/related-data.component';
import { UnsubscribeComponent } from './submission/unsubscribe/unsubscribe.component';

@NgModule({
  declarations: [
    AppComponent,
    SubmissionComponent,
    PageNotFoundComponent,
    HeaderComponent,
    TableServerSideComponent,
    FilterComponent,
    ActiveFilterComponent,
    SubmissionDetailComponent,
    RelatedDataComponent,
    UnsubscribeComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    MaterialModule,
    HttpClientModule,
    FlexLayoutModule,
    BrowserAnimationsModule,
    NgxSpinnerModule,
    FormsModule,
    ReactiveFormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
