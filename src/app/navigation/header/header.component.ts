import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import {IsActiveMatchOptions, Router} from "@angular/router";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
  @Output() public sidenavToggle = new EventEmitter();

  readonly myMatchOptions: IsActiveMatchOptions = {
    queryParams: 'subset',
    matrixParams: 'ignored',
    paths: 'subset',
    fragment: 'ignored',
  };

  constructor(private  router: Router) { }

  ngOnInit(): void {
  }

  public onToggleSidenav = () => {
    this.sidenavToggle.emit();
  }

  isProjectSelected() {
    return this.router.isActive('projects', this.myMatchOptions);
  }

}
