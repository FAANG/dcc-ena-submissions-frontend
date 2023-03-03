import {Component, EventEmitter, Input, OnInit, Output, TemplateRef, ViewChild} from '@angular/core';
import {ApiDataService} from '../services/api-data.service';
import * as FileSaver from 'file-saver';
import setting from './related-data.component.setting.json';
import {MatPaginator} from '@angular/material/paginator';
import {MatSort} from '@angular/material/sort';
import {MatTableDataSource} from '@angular/material/table';
import {HttpClient, HttpEventType} from '@angular/common/http';
import {Observable, of as observableOf} from 'rxjs';

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

  timer: any;
  delaySearch: boolean = true;
  search = '';

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
  }

  searchChanged(event: any) {
    const searchFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.delaySearch) {
      if (this.timer) {
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.applySearchFilter.bind(this), 500, searchFilterValue);
    } else {
      this.applySearchFilter(searchFilterValue);
    }
  }

  applySearchFilter(value: string) {
    this.dataSource.filter = value;
  }

  isAvailable(available: any) {
    return available === 'true';
  }

  availableClass(available: any) {
    return available === 'true' ? 'available' : 'notAvailable';
  }
}
