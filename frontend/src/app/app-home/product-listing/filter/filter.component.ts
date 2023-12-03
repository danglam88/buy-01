import { Component, EventEmitter, Input, Output } from '@angular/core';

@Component({
  selector: 'app-filter',
  templateUrl: './filter.component.html',
  styleUrls: ['./filter.component.css']
})
export class FilterComponent {
  @Input()
  all: number = 0;

  @Input()
  under100: number = 0;

  @Input()
  under200: number = 0;

  @Input()
  under300: number = 0;

  @Input()
  under400: number = 0;

  @Input()
  above400: number = 0;

  @Output()
  selectedFilterRadioButtonChanged: EventEmitter<string> = new EventEmitter<string>();

  selectedFilterRadioButton: string = 'all';

  onSelectedFilterRadioButtonChanged(): void {
    this.selectedFilterRadioButtonChanged.emit(this.selectedFilterRadioButton);
   
  }
}