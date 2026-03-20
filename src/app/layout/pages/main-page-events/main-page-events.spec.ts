import { ComponentFixture, TestBed } from '@angular/core/testing';

import { MainPageEvents } from './main-page-events';

describe('MainPageEvents', () => {
  let component: MainPageEvents;
  let fixture: ComponentFixture<MainPageEvents>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MainPageEvents]
    })
    .compileComponents();

    fixture = TestBed.createComponent(MainPageEvents);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
