import { Component, OnInit, OnDestroy, ChangeDetectorRef, NgZone, ViewChild, ElementRef, Renderer2 } from '@angular/core';
import { MessageBusService } from '../shared/services/message-bus.service';
import { MfeLoaderService } from '../shared/services/mfe-loader.service';
import { Subscription, takeUntil, Subject } from 'rxjs';
import { ApiService } from '../services/api.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'Host Application';
  messages: any[] = [];
  userInfo = { name: 'Kumar Shan', role: 'Admin' };
  private subscriptions: Subscription[] = [];
  @ViewChild('mfeContainer', { static: true }) mfeContainer!: ElementRef;
  isLoader: boolean = true;
  isSendMessageToMFE: boolean = true;
  isDisableMFELoad: boolean = false;
  selectedApp: string = 'test';
  isEdit: boolean = true;
  toggleMFE: boolean = true;
  updatedValue :any = {firstName:"Jason",lastName:"Gillespie",gender:"Male",dob:"2025-10-22"};
  notUpdated: boolean = true;
  storedData:any;
  private destroy$ = new Subject<void>();
  public errorMsg:any;



  constructor(
    private messageBus: MessageBusService, 
    private cdr: ChangeDetectorRef, 
    private mfeLoader: MfeLoaderService, 
    private renderer: Renderer2,
    private ngZone: NgZone,
    private apiService: ApiService) {}

  ngOnInit() {
     this.getUserDataFromAPI();
    // Set initial shared state
    this.messageBus.setState('userInfo', this.userInfo);
    this.messageBus.setState('theme', 'light');

    // Listen to all MFE events
    const allEventsSubscription = this.messageBus.getAllEvents().subscribe(event => {
      this.messages.unshift({
        ...event,
        timeString: new Date(event.timestamp).toLocaleTimeString()
      });
      
      // Keep only last 10 messages for display
      if (this.messages.length > 10) {
        this.messages = this.messages.slice(0, 10);
      }
      if(event.type === 'TEST_USER_UPDATED') {
        //  this.isEdit = true;
        //  this.notUpdated = false;
        //  this.updatedValue = event.payload.user; // putting this on success of API
         this.submitForm(event.payload.user);
      }

       if(event.type === 'API_SUCCESS') {
        this.errorMsg = null;
        this.updatedValue = event.payload.user; // putting this on success of API
        this.storedData = event.payload.user;
         this.isEdit = true;
         this.unloadMfe()

      }

       if(event.type === 'API_FAILURE') {
        this.errorMsg = 'API Failed. Please try again.';
        this.updatedValue = null; // putting this on success of API
         this.isEdit = false;
      }

      this.cdr.detectChanges();
    });

    // Listen to specific events from MFEs
    const mfeEventsSubscription = this.messageBus.on('MFE_LOADED').subscribe(event => {
      console.log('MFE Loaded:', event.payload);
      this.cdr.detectChanges();
    });

    const dataRequestSubscription = this.messageBus.on('REQUEST_DATA').subscribe(event => {
      if(event.payload.requestId === 'test-user-list') {
        this.messageBus.emit('DATA_RESPONSE', {
        requestId: event.payload.requestId,
        data: this.storedData ? this.storedData : {firstName:"Jason",lastName:"Gillespie",gender:"Male",dob:"2025-10-22"}
      });
      } else {
        // Respond to data requests from MFEs
      this.messageBus.emit('DATA_RESPONSE', {
        requestId: event.payload.requestId,
        data: this.getUserData()
      });
      }
      
      this.cdr.detectChanges();
    });

    this.subscriptions.push(allEventsSubscription, mfeEventsSubscription, dataRequestSubscription);
  }

  ngOnDestroy() {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  private getUserData() {
    return {
      users: [
        { id: 1, name: 'Alice Johnson', department: 'Engineering' },
        { id: 2, name: 'Bob Smith', department: 'Marketing' },
        { id: 3, name: 'Carol Davis', department: 'HR' }
      ]
    };
  }

  
  getUserDataFromAPI() {
   const obs$ = this.apiService.getUserData(1);
  console.log('Returned from API service:', obs$); // should log "Observable"
  
  obs$
    .subscribe({
      next: (response: any) => {
        console.log('response',response);
        this.storedData = response;
         this.updatedValue = this.storedData;
      },
      error: (error:any) => console.error("Error loading saved form state:", error),
    });
  }

  sendMessageToMFE() {
    this.messageBus.emit('HOST_MESSAGE', {
      message: 'Hello from Host!',
      timestamp: new Date().toISOString()
    });
  }

  updateTheme(theme: string) {
    this.messageBus.setState('theme', theme);
  }

  clearMessages() {
    this.messages = [];
  }

  addLoader() {
    const div = this.renderer.createElement('div');
    this.renderer.addClass(div, 'mfe-loading');
    this.renderer.appendChild(this.mfeContainer.nativeElement, div);
  }

  async loadMfe(value: string): Promise<void> {
    this.selectedApp = value;
     value === 'test' ? this.isEdit = false : this.isEdit = false 
      try {
        this.isLoader = true;
        this.isSendMessageToMFE = true; // prevent sending until loaded

        const tagname = `${value}-management-mfe`;
        const scriptPath = `./assets/user-management-mfe/${value}-management-mfe.js`;
        const stylePath = `./assets/user-management-mfe/${value}-management-mfe-style.css`;

        // 1️⃣ Load JS + CSS assets for MFE
        await this.mfeLoader.loadAssets(tagname, scriptPath, stylePath);

        // 2️⃣ Show loader while assets are bootstrapping
        this.addLoader();

        setTimeout(() => {
        // 3️⃣ Create the custom element once assets are available
        const mfeElement = document.createElement(tagname);

        // Clear container & inject new MFE element
        const container = this.mfeContainer.nativeElement;
        container.innerHTML = '';
        container.appendChild(mfeElement);

        // 4️⃣ Mark as loaded (Angular can use this to hide loader)
        this.isLoader = false;
        this.isSendMessageToMFE = false;
        this.isDisableMFELoad = true;
        },1500)
      

      } catch (error) {
        console.error('❌ Failed to load MFE:', error);
        this.isLoader = false;
      }
  }

  unloadMfe(): void {
  const container = this.mfeContainer.nativeElement;

  if (container) {
    container.innerHTML = ''; // removes all child nodes
  }

  // Reset internal flags if needed
  this.isLoader = false;
  this.isSendMessageToMFE = false;
  this.isDisableMFELoad = false;

  console.log('✅ MFE unloaded successfully');
}

  selectMFEApp(value: string) {
    console.log(value);
    this.selectedApp = value;
    this.loadMfe(value);
  }


  saveFormData(formValue:any) {
   let tempForm = formValue;
    this.apiService
      .saveUserData(tempForm)
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (savedData) => {
          console.log('form submitted successfully!',savedData);
           this.messageBus.emit(
            'API_SUCCESS',
            { user: savedData },
            'mfe'
          );
        },
        error: (error) => {
          console.error("Error submitting form:", error);
           this.messageBus.emit(
            'API_FAILURE',
            { user: null },
            'mfe'
          );
        },
      });
}

updateFormData(formValue:any) {
   let tempForm = formValue;
    this.apiService
      .updateUserData(tempForm, 1)
      .pipe(
        takeUntil(this.destroy$),
      )
      .subscribe({
        next: (savedData) => {
          console.log('form submitted successfully!',savedData);
           this.messageBus.emit(
            'API_SUCCESS',
            { user: savedData },
            'mfe'
          );

        },
        error: (error) => {
          console.error("Error submitting form:", error);
           this.messageBus.emit(
            'API_FAILURE',
            { user: null },
            'mfe'
          );
        },
      });
}


 private submitForm(formValue:any): void {
    this.apiService
      .checkIfFormExists()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: any) => {
          console.log(response);
          if (response.length > 0) {
            this.updateFormData(formValue);
          } else {
            this.saveFormData(formValue);
          }
        },
        error: (error) => {
          console.error("Error loading saved form state:", error);
        },
      });
  }
}