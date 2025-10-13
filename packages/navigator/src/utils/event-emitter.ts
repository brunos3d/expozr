/**
 * Utility functions for event handling in the Navigator package
 */

import type { EventEmitter, ExpozrEvents } from "../types";

/**
 * Simple event emitter implementation for Navigator
 * Provides a lightweight event system for navigator events
 */
export class SimpleEventEmitter implements EventEmitter {
  private listeners = new Map<keyof ExpozrEvents, Array<(data: any) => void>>();

  /**
   * Add an event listener
   * @param event - Event name to listen for
   * @param listener - Callback function to execute when event is emitted
   */
  on<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event)!.push(listener);
  }

  /**
   * Remove an event listener
   * @param event - Event name to stop listening for
   * @param listener - Callback function to remove
   */
  off<K extends keyof ExpozrEvents>(
    event: K,
    listener: (data: ExpozrEvents[K]) => void
  ): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      const index = eventListeners.indexOf(listener);
      if (index > -1) {
        eventListeners.splice(index, 1);
      }
    }
  }

  /**
   * Emit an event to all registered listeners
   * @param event - Event name to emit
   * @param data - Data to pass to listeners
   */
  emit<K extends keyof ExpozrEvents>(event: K, data: ExpozrEvents[K]): void {
    const eventListeners = this.listeners.get(event);
    if (eventListeners) {
      eventListeners.forEach((listener) => listener(data));
    }
  }

  /**
   * Remove all listeners for a specific event or all events
   * @param event - Optional event name to clear. If not provided, clears all listeners
   */
  clear(event?: keyof ExpozrEvents): void {
    if (event) {
      this.listeners.delete(event);
    } else {
      this.listeners.clear();
    }
  }

  /**
   * Get the number of listeners for a specific event
   * @param event - Event name to count listeners for
   * @returns Number of listeners for the event
   */
  listenerCount(event: keyof ExpozrEvents): number {
    const eventListeners = this.listeners.get(event);
    return eventListeners ? eventListeners.length : 0;
  }

  /**
   * Get all event names that have listeners
   * @returns Array of event names with registered listeners
   */
  getEventNames(): (keyof ExpozrEvents)[] {
    return Array.from(this.listeners.keys());
  }
}
