import {Component, EventEmitter, Input, OnInit, Output, ViewChild} from '@angular/core';
import {ApiDataService} from '../services/api-data.service';
import * as FileSaver from 'file-saver';
import setting from './related-data.component.setting.json';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { HttpClient, HttpEventType} from '@angular/common/http';
import { Observable, of as observableOf } from 'rxjs';

@Component({
  selector: 'app-related-data',
  templateUrl: './related-data.component.html',
  styleUrls: ['./related-data.component.css']
})
export class RelatedDataComponent implements OnInit {
  @Input() record_id: string; // the record id used to retrieve particular record
  @Input() dataType: string; //
  @Input() data: Array<any>; // Array data to be populated in the table

  @Input() source_type: string; // equal to the type of detail page, e.g. to list files in the dataset detail page, set to be dataset
  @Input() target_type: string; // the related entities, e.g. to list files in the dataset detail page, set to be file

  @Output() fetchedRecords = new EventEmitter<any>();
  @ViewChild(MatPaginator, { static: true }) paginator: MatPaginator;
  @ViewChild(MatSort, { static: true }) sort: MatSort;
  dataSource: MatTableDataSource<any>;
  display_fields: Array<string> = [];
  totalHits = 0;
  client_side = ['project-pipeline', 'publication-dataset', 'analysis-file',
    'file-paper', 'dataset-specimen', 'submission-experiment'];
  relationship_type;
  records: any;
  urls: string[] = [];
  checked = false;
  timer: any;
  delaySearch: boolean = true;
  search = '';

  p = 1; // page number for html template


  constructor(
    private dataService: ApiDataService,
    private http: HttpClient) {
  }

  ngOnInit() {
    this.dataSource = new MatTableDataSource([]);
    for (const column of setting[this.source_type][this.target_type]['display']) {
      this.display_fields.push(column);
    }

    // random delay for concurrent requests
    setTimeout(() => {
      this.fetchData();
    }, Math.floor(Math.random() * 200));
    this.relationship_type = `${this.source_type}-${this.target_type}`;
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      if (!this.client_side.includes(this.relationship_type)) {
        console.log("nu p sort")
        this.fetchData();
      }
    });
    this.paginator.page.subscribe(() => {
      if (!this.client_side.includes(this.relationship_type)) {
        this.fetchData();
      }
    });
  }

  fetchData() {
    const relationship_type = `${this.source_type}-${this.target_type}`;
    if (relationship_type === 'submission-experiment') {
      this.dataService.getSubmissionExperiments(
        this.record_id, this.getSort(), this.paginator.pageIndex * 10, this.search).subscribe(
        (res: any) => {
          const mappedData = []
          res['data'].forEach((item, index) => {
            if (item['experiments']){
              item['experiments'].map(obj => Object.assign(obj, {available_in_portal: item['available_in_portal']}));
              mappedData.push(...item['experiments']);
            }
          });
          this.dataSource.data = this.getDataSource(mappedData);
          this.totalHits = res['totalHits'];
        }
      );
    }
  }

  getSort() {
    const defaults = {
      'organism' : 'BioSamples ID',
      'specimen' : 'BioSamples ID',
      'experiment' : 'Accession'
    };
    if (this.sort.active && this.sort.direction) {
      return setting[this.source_type][this.target_type]['fields'][this.sort.active]['source'] + ':' + this.sort.direction;
    } else {
      return setting[this.source_type][this.target_type]['fields'][defaults[this.target_type]]['source'] + ':asc';
    }
  }

  getDataSource(records) {
    const tableData = [];
    const fields = setting[this.source_type][this.target_type]['fields'];
    if (records) {
      for (const index of Object.keys(records)) {
        const rowObj = {};
        for (const field of Object.keys(fields)) {
          const prop = fields[field]['value'].split('.');
          rowObj[field] = records[index];
          while (prop.length && rowObj[field] && rowObj[field].hasOwnProperty(prop[0])) {
            rowObj[field] = rowObj[field][prop[0]];
            prop.shift();
          }
        }
        tableData.push(rowObj);
      }
    }
    return tableData;
  }


  // the behaviour of the checkbox in the table under Download column
  onCheckboxClick(url: string) {
    url = `https://${url}`;
    const index = this.urls.indexOf(url);
    if (index !== -1) {
      this.urls.splice(index, 1);
    } else {
      this.urls.push(url);
    }
  }

  // the checked conversion_status of the checkbox in the table under Download column
  CheckboxChecked(url: string) {
    url = `https://${url}`;
    return this.urls.indexOf(url) !== -1;
  }

  // determine the checked conversion_status of the checkbox in the table header
  // return 2 means all files selected (checkbox checked conversion_status),
  // 1 means partially files selected (checkbox indeterminate conversion_status)
  // and 0 means none selected
  mainCheckboxChecked() {
    if (this.dataSource.data) {
      if (this.urls.length === this.dataSource.data.length) {
        this.checked = true;
        return 2;
      } else {
        this.checked = false;
        if (this.urls.length > 0) {
          return 1;
        } else {
          return 0;
        }
      }
    } else {
      return 0;
    }
  }

  // the behaviour of the checkbox in the table header
  mainCheckboxClicked() {
    if (this.checked === true) {
      this.urls = [];
    } else {
      for (const record of this.dataSource.data) {
        const url = `https://${record['Download']}`;
        const idx = this.urls.indexOf(url);
        if (idx === -1) {
          this.urls.push(url);
        }
      }
    }
    this.checked = !this.checked;
  }

  capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  searchChanged(event: any){
    const searchFilterValue = (event.target as HTMLInputElement).value.trim().toLowerCase();
    if (this.delaySearch){
      if (this.timer){
        clearTimeout(this.timer);
      }
      this.timer = setTimeout(this.applySearchFilter.bind(this), 500, searchFilterValue);
    } else {
      this.applySearchFilter(searchFilterValue);
    }
  }

  applySearchFilter(value: string) {
    this.paginator.pageIndex = 0;
    this.search = value;
    if (!this.client_side.includes(this.relationship_type)) {
      this.fetchData();
    } else {
      this.dataSource.filter = value;
    }
  }

  displayTitle(targetType: string) {
    const titles = {
      'analysis' : 'Analyses',
      'experiment' : 'Experiments',
    };
    if (titles.hasOwnProperty(targetType)) {
      return titles[targetType];
    } else {
      return this.capitalizeFirstLetter(targetType) + 's';
    }
  }
}
