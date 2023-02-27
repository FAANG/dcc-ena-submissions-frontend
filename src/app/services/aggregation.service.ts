import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  activeFilters = {
    assay_type: [],
  };

  currentActiveFilters = [];

  data = new Subject();
  field = new Subject();

  constructor() {
  }
  
  getAggregations(recordList: any) {
    let all_data = {};
    for (const aggField in recordList) { // recordList contains aggregations from API response
      all_data[aggField] = {};
      if (recordList[aggField]['buckets']) {
        recordList[aggField]['buckets'].forEach(bucket => {
          all_data[aggField][bucket['key']] = bucket['doc_count'];
        });
      } else {
        all_data[aggField] = recordList[aggField]['doc_count'];
      }
    }
    for (let key in all_data) {
      all_data[key] = Object.entries(all_data[key]).sort(function (a: any, b: any) {
        return b[1] - a[1];
      })
    }
    this.data.next(all_data);
  }

}
