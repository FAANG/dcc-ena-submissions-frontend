import {Injectable} from '@angular/core';
import {Subject} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AggregationService {

  male_values = ['male', 'male genotypic sex', 'intact male', 'M', 'Male'];
  female_values = ['female', 'female genotypic sex', 'intact female', 'F', 'Female'];
  published_article_source = ['AGR', 'CBA', 'CTX', 'MED', 'PMC'];

  active_filters = {
    assay_type: [],
  };


  current_active_filters = [];

  data = new Subject();
  field = new Subject();

  constructor() {
  }


  updateAggregation(aggs: {}, value: string): {} {
    aggs.hasOwnProperty(value) ? aggs[value] += 1 : aggs[value] = 1;
    return aggs;
  }

  updateAggregationCommaSeparated(aggs: {}, value: string): {} {
    let values = value.split(', ');
    values.forEach(val => {
      aggs.hasOwnProperty(val) ? aggs[val] += 1 : aggs[val] = 1;
    })
    return aggs;
  }

  getAggregations(recordList: any) {
    let all_data = {};
    for (const key in recordList) { // recordList contains aggregations from API response
      all_data[key] = {};
      if (recordList[key]['buckets']) {
        recordList[key]['buckets'].forEach(element => {
          all_data[key][element['key']] = element['doc_count'];
        });
      } else {
        all_data[key] = recordList[key]['doc_count'];
      }
    }
    let paperPublishedProcessed = false;
    for (let key in all_data) {
      // process assayType
      if (key == 'assay_type') {
        for (const val in all_data['assay_type']) {
          if (val == 'transcription profiling by high throughput sequencing') {
            all_data['assay_type']['RNA-Seq'] = all_data['assay_type'][val];
            delete all_data['assay_type'][val];
            break;
          }
        }
      }
      all_data[key] = Object.entries(all_data[key]).sort(function (a: any, b: any) {
        return b[1] - a[1];
      })
    }
    this.data.next(all_data);

  }

}
