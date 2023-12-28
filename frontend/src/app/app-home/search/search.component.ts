import {
  Component,
  EventEmitter,
  Output,
  ViewChild,
  ElementRef,
} from "@angular/core";

@Component({
  selector: "app-search",
  templateUrl: "./search.component.html",
  styleUrls: ["./search.component.css"],
})
export class SearchComponent {
  searchText: string[] = [];

  @Output()
  searchTextChanged: EventEmitter<string[]> = new EventEmitter<string[]>();

  @ViewChild("searchInput") searchInputEl: ElementRef;

  updateSearchText() {
    const inputValue = this.searchInputEl.nativeElement.value;
    const words = inputValue
      .split(" ")
      .filter((word: string) => word.trim() !== "");

    this.searchText = Array.from(new Set(words));
    this.searchTextChanged.emit(this.searchText);
  }
  
  cancelSearch(item: string) {
    this.searchText = this.searchText.filter((word: string) => word != item);
    this.searchTextChanged.emit(this.searchText);
  }
}
