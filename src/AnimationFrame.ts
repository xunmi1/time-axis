export interface AnimationFrameCallback {
  (pause: AnimationFrame['pause'], gap: number): void;
}

export class AnimationFrame {
  #callback?: AnimationFrameCallback;
  #timestamp: number | undefined;
  #frameId: number | undefined;

  #handler: FrameRequestCallback = timestamp => {
    const gap = this.#timestamp == null ? 0 : timestamp - this.#timestamp;
    this.#timestamp = timestamp;
    this.#frameId = window.requestAnimationFrame(this.#handler);
    this.#callback?.(this.pause.bind(this), gap);
  };

  resume(callback: AnimationFrameCallback) {
    this.pause();
    this.#callback = callback;
    this.#frameId = window.requestAnimationFrame(this.#handler);
  }

  pause() {
    if (!this.#frameId) return;
    window.cancelAnimationFrame(this.#frameId);
    this.#frameId = undefined;
    this.#timestamp = undefined;
    this.#callback = undefined;
  }
}
