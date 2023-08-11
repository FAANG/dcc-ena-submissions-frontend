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
  @Input() filter_values: Observable<Object>;
  @Output() dataUpdate = new EventEmitter<any>();
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
    this.dataSource.filterPredicate = this.createFilter();
    this.dataSource.filter = JSON.stringify(this.filter_values);
  }
  
  // apply filter when component input "filter_values" is changed
  ngOnChanges() {
    if (this.dataSource) {
      this.dataSource.data = this.data;
      this.dataSource.filter = JSON.stringify(this.filter_values);
      if (this.filter_values) {
        this.dataUpdate.emit(this.dataSource.filteredData); // emit data update event
      }
    }
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

  // custom filter function to override angular material tables default filter behaviour
  createFilter() {
    let filterFunction = function (data: any, filter: string): boolean {
      let searchTerms = JSON.parse(filter);
      let isFilterSet = false;
      for (const col in searchTerms) {
        if (searchTerms[col].length > 0) {
          isFilterSet = true;
        } else {
          delete searchTerms[col];
        }
      }
      if (isFilterSet) {
        for (const col in searchTerms) {
          // handling search filter (should behave similar to angular material default filter)
          if (col === 'search') {
            if (!searchTerms['search'][0]) {
              return true;
            }
            for (let column in data) {
              let colData = data[column].toString().trim().toLowerCase();
              if (colData.search(searchTerms[col][0]) !== -1) {
                return true;
              }
            }
            return false;
          }
          else {
            if (!data[col] || searchTerms[col].indexOf(data[col]) == -1) {
                return false;
            }
          }
        }
        return true;
      } 
      return true;
    }
    return filterFunction;
  }

}
