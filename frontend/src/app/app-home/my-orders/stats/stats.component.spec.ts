import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { AngularMaterialModule } from 'src/app/angular-material.module';

import { StatsComponent } from './stats.component';
import { OrderService } from 'src/app/services/order.service';

describe('StatsComponent', () => {
  let component: StatsComponent;
  let fixture: ComponentFixture<StatsComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [OrderService],
      declarations: [StatsComponent],
      imports: [HttpClientTestingModule, AngularMaterialModule]
    });
    fixture = TestBed.createComponent(StatsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
