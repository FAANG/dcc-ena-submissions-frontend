import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, retry, map} from 'rxjs/operators';
import {HostSetting} from './host-setting';

interface SubmissionTable {
  studyId: string;
  studyAlias: string;
  assayType: string;
  numberOfExperiments: string;
  numberOfRuns: string;
  numberOfFiles: string;
}

interface ExperimentsTable {
  studyId: string;
  studyAlias: string;
  assayType: string;
  numberOfExperiments: string;
  numberOfRuns: string;
  numberOfFiles: string;
}

@Injectable({
  providedIn: 'root'
})

export class ApiDataService {
  hostSetting = new HostSetting;

  constructor(private http: HttpClient) {
  }

  getAllEnaSubmissions(query: any, size: number) {
    // const url = `${this.hostSetting.host}data/submissions/_search/?size=${size}`;
    const url = `http://localhost:8000/data/submissions/_search/?size=${size}`;
    const aggs = {
      'assay_type': 'assay_type'
    };
    const mapping = {
      'studyId': 'study_id',
      'studyAlias': 'study_alias',
      'assayType': 'assay_type',
      'numberOfExperiments': 'experiments',
      'numberOfRuns': 'runs',
      'numberOfFiles': 'files'
    };
    const filters = query['filters'];
    for (const prop of Object.keys(filters)) {
      if (aggs[prop] && (prop !== aggs[prop])) {
        filters[aggs[prop]] = filters[prop];
        delete filters[prop];
      }
    }
    const sortParams = mapping[query['sort'][0]] ? mapping[query['sort'][0]] + ':' + query['sort'][1] : query['sort'][0] + ':' + query[
      'sort'][1];
    let params = new HttpParams().set('_source', query['_source'].toString()).set('filters', JSON.stringify(filters)).set('aggs',
      JSON.stringify(aggs)).set('from_', query['from_']).set('search', query['search']);
    if (query['sort'][0] === 'numberOfExperiments' || query['sort'][0] === 'numberOfSpecimens' || query['sort'][0] === 'numberOfFiles') {
      params = params.set('sort_by_count', sortParams);
    } else {
      params = params.set('sort', sortParams);
    }
    const res = {};
    return this.http.get(url, {params: params}).pipe(
      map((data: any) => {
        res['data'] = data.hits.hits.map(entry => ({
            studyId: entry['_source']['study_id'],
            studyAlias: entry['_source']['study_alias'],
            assayType: entry['_source']['assay_type'],
            numberOfExperiments: entry['_source']['experiments'] ? entry['_source']['experiments']['length'] : 0,
            numberOfRuns: entry['_source']['runs'] ? entry['_source']['runs']['length'] : 0,
            numberOfFiles: entry['_source']['files'] ? entry['_source']['files']['length'] : 0,
            numberOfAnalyses: entry['_source']['analyses'] ? entry['_source']['analyses']['length'] : 0
          } as SubmissionTable)
        );
        console.log(data.hits.hits);
        res['totalHits'] = data.hits.total.value;
        res['aggregations'] = data.aggregations;
        return res;
      }),
      retry(3),
      catchError(this.handleError),
    );
  }

  getEnaSubmission(accession: string) {
    // let url = `${this.hostSetting.host}data/submissions/_search/?q=study_id:${accession}`;
    let url = `http://localhost:8000/data/submissions/_search/?q=study_id:${accession}`;

    return this.http.get<any>(url).pipe(
      retry(3),
      catchError(this.handleError),
    );
  }

  getSubmissionExperiments(studyId: string, sort: string, offset: number, search: string) {
    const res = {};
    const submission_filter = JSON.stringify({
      study_id: [studyId]
    });
    console.log("sort: ", sort)
    // let url = `${this.hostSetting.host}data/submissions/_search/?size=10&filters=${submission_filter}&sort=${sort}&from_=${offset}&search=${search}`;
    let url = `http://localhost:8000/data/submissions/_search/?size=10&_source=experiments.accession,experiments.alias,available_in_portal&filters=${submission_filter}&sort=${sort}&from_=${offset}&search=${search}`;
    console.log(url)

    return this.http.get(url).pipe(
      map((data: any) => {
        res['data'] = data.hits.hits.map(entry => ({
          accession: entry['_source']['study_id'],
          alias: entry['_source']['study_alias'],
          available_in_portal: entry['_source']['available_in_portal'],
          experiments: entry['_source']['experiments']
          // numberOfRuns: entry['_source']['runs'] ? entry['_source']['runs']['length'] : 0,
          // numberOfFiles: entry['_source']['files'] ? entry['_source']['files']['length'] : 0,
          // numberOfAnalyses: entry['_source']['analyses'] ? entry['_source']['analyses']['length'] : 0
          })
        );
        res['totalHits'] = data.hits.total.value;
        return res;
      }),
      retry(3),
      catchError(this.handleError),
    );

  }

  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      console.error('An errorSubject occurred:', error.error.message);
    } else {
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      console.error(error);
    }
    return throwError(
      error);
  }
}
