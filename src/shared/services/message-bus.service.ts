import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { filter, map } from 'rxjs/operators';

export interface MessageBusEvent {
  type: string;
  payload: any;
  source: string;
  timestamp: number;
}

@Injectable({
  providedIn: 'root'
})
export class MessageBusService {
  private eventSubject = new Subject<MessageBusEvent>();
  private stateSubject = new BehaviorSubject<any>({});

  constructor() {
    // Make service available globally for MFE components
    (window as any).messageBus = this;
  }

  // Emit events
  emit(type: string, payload: any, source: string = 'host'): void {
    const event: MessageBusEvent = {
      type,
      payload,
      source,
      timestamp: Date.now()
    };
    
    console.log(`MessageBus: Emitting event`, event);
    this.eventSubject.next(event);
  }

  // Listen to specific event types
  on(eventType: string): Observable<MessageBusEvent> {
    return this.eventSubject.pipe(
      filter(event => event.type === eventType)
    );
  }

  // Listen to events from specific source
  fromSource(source: string): Observable<MessageBusEvent> {
    return this.eventSubject.pipe(
      filter(event => event.source === source)
    );
  }

  // Get all events
  getAllEvents(): Observable<MessageBusEvent> {
    return this.eventSubject.asObservable();
  }

  // State management
  setState(key: string, value: any): void {
    const currentState = this.stateSubject.value;
    const newState = { ...currentState, [key]: value };
    this.stateSubject.next(newState);
    
    // Emit state change event
    this.emit('STATE_CHANGED', { key, value }, 'host');
  }

  getState(): Observable<any> {
    return this.stateSubject.asObservable();
  }

  getCurrentState(): any {
    return this.stateSubject.value;
  }

  getStateValue(key: string): any {
    return this.stateSubject.value[key];
  }
}