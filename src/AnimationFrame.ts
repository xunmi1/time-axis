export interface AnimationFrameCallback {
  (this: AnimationFrame, pause: AnimationFrame['pause'], gap: number): void;
}

export class AnimationFrame {
  #callback?: AnimationFrameCallback;

  #timeStamp?: number;

  #frameId?: number;

  get isActive() {
    return this.#frameId != null;
  }

  resume(callback: AnimationFrameCallback) {
    this.#callback = callback;
    if (!this.isActive) this.#request();
  }

  pause() {
    this.#cancel();
    this.#callback = undefined;
  }

  #handler: FrameRequestCallback = timeStamp => {
    const gap = this.#timeStamp == null ? 0 : timeStamp - this.#timeStamp;
    this.#timeStamp = timeStamp;
    this.#request();
    this.#callback?.(this.pause.bind(this), gap);
  };

  #request() {
    this.#frameId = window.requestAnimationFrame(this.#handler);
  }

  #cancel() {
    if (this.#frameId == null) return;
    window.cancelAnimationFrame(this.#frameId);
    this.#frameId = undefined;
    this.#timeStamp = undefined;
  }
}
