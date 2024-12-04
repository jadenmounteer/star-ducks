import {
  ApplicationRef,
  ComponentRef,
  createComponent,
  EnvironmentInjector,
  Injectable,
  Type,
} from '@angular/core';
import { ModalComponent } from '../../components/ui-components/modal/modal.component';

@Injectable({
  providedIn: 'root',
})
export class ModalService {
  private modalComponentRef: ComponentRef<ModalComponent> | null = null;
  private contentComponentRef: ComponentRef<any> | null = null;
  private modalContainer: HTMLElement | null = null;
  private modalResult: any;
  private modalClosedResolver: ((value: any) => void) | null = null;

  constructor(
    private applicationRef: ApplicationRef,
    private injector: EnvironmentInjector
  ) {
    this.setupModalContainer();
  }

  open<T, R = any>(component: Type<T>): Promise<R> {
    return new Promise((resolve) => {
      this.modalClosedResolver = resolve;
      this.setupModalContainer();

      // Clean up any existing modal
      if (this.modalComponentRef || this.contentComponentRef) {
        this.close();
      }

      // Create the modal wrapper component
      this.modalComponentRef = createComponent(ModalComponent, {
        environmentInjector: this.injector,
        hostElement: this.modalContainer!,
      });

      // Create the content component
      const modalContentElement =
        this.modalComponentRef.location.nativeElement.querySelector(
          '.modal-content'
        );
      this.contentComponentRef = createComponent(component, {
        environmentInjector: this.injector,
        hostElement: modalContentElement,
      });

      // Enable pointer events when modal is shown
      if (this.modalContainer) {
        this.modalContainer.style.pointerEvents = 'auto';
      }

      // Attach views to the application
      this.applicationRef.attachView(this.modalComponentRef.hostView);
      this.applicationRef.attachView(this.contentComponentRef.hostView);

      // Listen for modal close
      this.modalComponentRef.instance.modalClosed.subscribe(() => {
        this.close();
      });

      return this.contentComponentRef;
    });
  }

  close(result?: any): void {
    if (this.modalClosedResolver) {
      this.modalClosedResolver(result);
      this.modalClosedResolver = null;
    }

    // Detach and destroy modal component
    if (this.modalComponentRef) {
      this.applicationRef.detachView(this.modalComponentRef.hostView);
      this.modalComponentRef.destroy();
      this.modalComponentRef = null;
    }

    // Detach and destroy content component
    if (this.contentComponentRef) {
      this.applicationRef.detachView(this.contentComponentRef.hostView);
      this.contentComponentRef.destroy();
      this.contentComponentRef = null;
    }

    // Remove the modal container from DOM
    if (this.modalContainer && document.body.contains(this.modalContainer)) {
      document.body.removeChild(this.modalContainer);
      this.modalContainer = null;
    }
  }

  private setupModalContainer() {
    // Check if container exists and is in the DOM
    if (!this.modalContainer || !document.body.contains(this.modalContainer)) {
      // Remove old container if it exists but not in DOM
      if (this.modalContainer) {
        this.modalContainer = null;
      }

      // Create new container
      this.modalContainer = document.createElement('div');
      this.modalContainer.className = 'modal-container';

      this.modalContainer.style.position = 'fixed';
      this.modalContainer.style.zIndex = '1000';
      this.modalContainer.style.top = '0';
      this.modalContainer.style.left = '0';
      this.modalContainer.style.width = '100%';
      this.modalContainer.style.height = '100%';
      this.modalContainer.style.pointerEvents = 'none';

      document.body.appendChild(this.modalContainer);
    }
  }
}
