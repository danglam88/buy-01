import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SearchComponent } from './search.component';

describe('SearchComponent', () => {
  let component: SearchComponent;
  let fixture: ComponentFixture<SearchComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [SearchComponent]
    });

    fixture = TestBed.createComponent(SearchComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit searchTextChanged on updateSearchText', () => {
    spyOn(component.searchTextChanged, 'emit');
    const inputText = 'test search';

    // Assuming you have a nativeElement on your mock
    component.searchInputEl = {
      nativeElement: {
        value: inputText
      }
    };

    component.updateSearchText();

    expect(component.searchTextChanged.emit).toHaveBeenCalledWith(['test', 'search']);
  });

  it('should emit searchTextChanged on cancelSearch', () => {
    spyOn(component.searchTextChanged, 'emit');
    component.searchText = ['test', 'search'];

    component.cancelSearch('search');

    expect(component.searchTextChanged.emit).toHaveBeenCalledWith(['test']);
  });
});
