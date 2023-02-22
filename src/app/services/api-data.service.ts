import { Injectable } from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpParams} from '@angular/common/http';
import {throwError} from 'rxjs';
import {catchError, retry, map} from 'rxjs/operators';

interface DatasetTable {
  datasetAccession: string;
  title: string;
  species: string;
  archive: string;
  assayType: string;
  numberOfExperiments: string;
  numberOfSpecimens: string;
  numberOfFiles: string;
  standard: string;
  paperPublished: string;
  private: boolean;
  submitterEmail: string;
}

@Injectable({
  providedIn: 'root'
})

export class ApiDataService {
  constructor(private http: HttpClient) { }




  downloadRecords(index: string, mapping: any, query: any) {
    const url = `http://localhost:8000/data/${index}/download/`;
    const filters = query['filters'];
    for (const prop of Object.keys(filters)) {
      if (mapping[prop] && (prop !== mapping[prop])) {
        filters[mapping[prop]] = filters[prop];
        delete filters[prop];
      }
    }
    const sortParams = mapping[query['sort'][0]] ? mapping[query['sort'][0]] + ':' + query['sort'][1] : query['sort'][0] + ':' + query[
      'sort'][1];
    const params = new HttpParams().set('_source', query['_source'].toString()).set('sort', sortParams).set('filters',
      JSON.stringify(filters)).set('columns', JSON.stringify(query['columns'])).set('file_format', query['file_format']);
    const fullURL = `${url}?${params.toString()}`;
    return this.http.get(fullURL, {responseType: 'blob' as 'blob'}).pipe(
      map((data: any) => {
        return data;
      }),
      catchError(this.handleError),
    );
  }







  getSpeciesStr(dataset: any): string {
    const species: any[] = dataset['_source']['species'];
    let value = '';
    for (let i = species.length - 1; i >= 0; i--) {
      value += species[i]['text'] + ',';
    }
    return value.substring(0, value.length - 1);
  }





  getAllDatasets(query: any, size: number) {
    const url = `http://localhost:8000/data/dataset/_search/?size=${size}`;
    const aggs = {
      'archive': 'archive',
      'species': 'species.text',
      'assay_type': 'assayType',
      'standard': 'standardMet',
      'paper_published': 'paperPublished',
      'project': 'secondaryProject'
    };
    const mapping = {
      'datasetAccession': 'accession',
      'title': 'title',
      'species': 'species.text',
      'archive': 'archive',
      'assayType': 'assayType',
      'numberOfExperiments': 'experiment',
      'numberOfSpecimens': 'specimen',
      'numberOfFiles': 'file',
      'standard': 'standardMet',
      'paper_published': 'paperPublished',
    };
    const filters = query['filters'];
    for (const prop of Object.keys(filters)) {
      // @ts-ignore
      if (aggs[prop] && (prop !== aggs[prop])) {
        // @ts-ignore
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
        res['data'] = data.hits.hits.map( entry => ({
            datasetAccession: entry['_source']['accession'],
            title: entry['_source']['title'],
            species: this.getSpeciesStr(entry),
            archive: entry['_source']['archive'].toString(),
            assayType: entry['_source']['assayType'].toString(),
            numberOfExperiments: entry['_source']['experiment']['length'],
            numberOfSpecimens: entry['_source']['specimen']['length'],
            numberOfFiles: entry['_source']['file']['length'],
            standard: entry['_source']['standardMet'],
            paperPublished: entry['_source']['paperPublished'],
            submitterEmail: entry['_source']['submitterEmail']
          } as DatasetTable)
        );

        res['totalHits'] = data.hits.total.value;
        res['aggregations'] = data.aggregations;
        return res;
      }),
      retry(3),
      catchError(this.handleError),
    );
  }











  private handleError(error: HttpErrorResponse) {
    if (error.error instanceof ErrorEvent) {
      // A client-side or network errorSubject occurred. Handle it accordingly.
      console.error('An errorSubject occurred:', error.error.message);
    } else {
      // The backend returned an unsuccessful response code.
      // The response body may contain clues as to what went wrong,
      console.error(
        `Backend returned code ${error.status}, ` +
        `body was: ${error.error}`);
      console.error(error);
    }
    // return an observable with a user-facing errorSubject message
    return throwError(
      error);
  }
}
