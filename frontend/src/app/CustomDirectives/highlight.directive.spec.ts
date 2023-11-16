import { ElementRef } from '@angular/core';
import { HighlightDirective } from './highlight.directive';

describe('HighlightDirective', () => {
  it('should create an instance', () => {
    const elementRef = new ElementRef(null); // You can pass null or a mock element
    const renderer = jasmine.createSpyObj('Renderer2', ['addClass', 'removeClass']);

    const directive = new HighlightDirective(elementRef, renderer);
    expect(directive).toBeTruthy();
  });
});
