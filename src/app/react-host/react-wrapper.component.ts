import { Component, ElementRef, Input, OnChanges, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
import { createRoot, Root } from 'react-dom/client';
import * as React from 'react';

@Component({
  selector: 'app-react-host',
  standalone: true,
  template: `<div #reactContainer class="react-wrapper-container"></div>`,
  styles: [`
    :host { display: block; width: 100%; height: 100%; }
    .react-wrapper-container { width: 100%; height: 100%; }
  `]
})
export class ReactWrapperComponent implements OnChanges, OnDestroy, AfterViewInit {
  @ViewChild('reactContainer', { static: false }) containerRef!: ElementRef;
  
  @Input() reactComponent!: React.ElementType<any>;
  @Input() props: Record<string, any> = {};

  private root: Root | null = null;
  private hasViewInit = false;

  ngAfterViewInit() {
    this.hasViewInit = true;
    this.render();
  }

  ngOnChanges() {
    if (this.hasViewInit) {
      this.render();
    }
  }

  ngOnDestroy() {
    if (this.root) {
      this.root.unmount();
    }
  }

  private render() {
    if (!this.containerRef || !this.reactComponent) return;

    if (!this.root) {
      this.root = createRoot(this.containerRef.nativeElement);
    }

    const reactElement = React.createElement(this.reactComponent, this.props);
    this.root.render(reactElement);
  }
}
