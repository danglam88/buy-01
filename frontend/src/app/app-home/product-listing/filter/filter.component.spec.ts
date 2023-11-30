import { ComponentFixture, TestBed } from '@angular/core/testing';
import { FilterComponent } from './filter.component';

describe('FilterComponent', () => {
  let component: FilterComponent;
  let fixture: ComponentFixture<FilterComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FilterComponent]
    });

    fixture = TestBed.createComponent(FilterComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit selectedFilterRadioButton on change', () => {
    spyOn(component.selectedFilterRadioButtonChanged, 'emit');
    const newFilter = 'under100';

    component.selectedFilterRadioButton = newFilter;
    component.onSelectedFilterRadioButtonChanged();

    expect(component.selectedFilterRadioButtonChanged.emit).toHaveBeenCalledWith(newFilter);
  });
});
