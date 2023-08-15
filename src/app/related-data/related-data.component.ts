import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ApiDataService} from '../services/api-data.service';
import * as FileSaver from 'file-saver';
import setting from './related-data.component.setting.json';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Observable, of as observableOf} from 'rxjs';
import { FormControl } from '@angular/forms';

@Component({
  selector: 'app-related-data',
  templateUrl: './related-data.component.html',
  styleUrls: ['./related-data.component.css']
})
export class RelatedDataComponent implements OnInit {
  @Input() dataType: string;
  @Input() data: Array<any>;
  @ViewChild(MatPaginator, {static: true}) paginator: MatPaginator;
  @ViewChild(MatSort, {static: true}) sort: MatSort;
  @ViewChild('availableTemplate', { static: true }) availableTemplate: TemplateRef<any>;

  availabilityFilter = new FormControl('');
  inputSearchFilter = new FormControl('');
  filterValues: any = {
    available_in_portal: '',
    otherFields: ''
  }

  @Input() displayedColumns;
  dataSource: MatTableDataSource<any>;
  emptyData = new MatTableDataSource([{ empty: "row" }]);


  constructor(
    private dataService: ApiDataService,
    private http: HttpClient) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource(this.data);
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
    this.fieldListener();
    this.dataSource.filterPredicate = this.createFilter();
  }

  private fieldListener() {
    this.availabilityFilter.valueChanges
      .subscribe(
        value => {
          this.filterValues.available_in_portal = value === undefined ? "" : value
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
    this.inputSearchFilter.valueChanges
      .subscribe(
        value => {
          this.filterValues['otherFields'] = value;
          this.dataSource.filter = JSON.stringify(this.filterValues);
        }
      )
  }

  private createFilter(): (record, filter: string) => boolean {
    let filterFunction = function (record, filter): boolean {
      let searchTerms = JSON.parse(filter);
      searchTerms.otherFields = searchTerms.otherFields.trim()

      return record.available_in_portal.indexOf(searchTerms.available_in_portal) !== -1
        && (record.accession.indexOf(searchTerms.otherFields) !== -1 ||
            record.alias.indexOf(searchTerms.otherFields) !== -1 ||
            record.submission_date.indexOf(searchTerms.otherFields) !== -1);
    }
    return filterFunction;
  }

  isAvailable(available: any) {
    return available === 'true';
  }

  availableClass(available: any) {
    return available === 'true' ? 'available' : 'notAvailable';
  }
}
