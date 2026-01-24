const { Worker } = require('worker_threads');
const path = require('path');
const { upload: uploadConfig } = require('../config/config');

class WorkerPool {
  constructor(workerPath, poolSize = 4) {
    this.workerPath = workerPath;
    this.poolSize = poolSize;
    this.workers = [];
    this.availableWorkers = [];
    this.queue = [];

    // Initialize worker pool
    this.initializePool();
  }

  initializePool() {
    for (let i = 0; i < this.poolSize; i++) {
      const worker = new Worker(this.workerPath);
      this.workers.push(worker);
      this.availableWorkers.push(worker);

      // Handle worker errors
      worker.on('error', (error) => {
        console.error('Worker error:', error);
      });

      // Handle worker exit (restart if needed)
      worker.on('exit', (code) => {
        if (code !== 0) {
          console.error(`Worker stopped with exit code ${code}`);
          // Remove dead worker
          this.workers = this.workers.filter((w) => w !== worker);
          this.availableWorkers = this.availableWorkers.filter((w) => w !== worker);
          // Create replacement worker
          const newWorker = new Worker(this.workerPath);
          this.workers.push(newWorker);
          this.availableWorkers.push(newWorker);
        }
      });
    }
  }

  /**
   * Execute a job using an available worker
   */
  async runJob(job) {
    return new Promise((resolve, reject) => {
      const execute = (worker) => {
        // Create one-time message listener
        const messageHandler = (result) => {
          worker.off('message', messageHandler);
          // Return worker to available pool
          this.availableWorkers.push(worker);
          // Process next queued job if any
          this.processQueue();

          if (result.success) {
            resolve(result.result);
          } else {
            reject(new Error(result.error));
          }
        };

        worker.on('message', messageHandler);
        worker.postMessage(job);
      };

      // If worker available, use it immediately
      if (this.availableWorkers.length > 0) {
        const worker = this.availableWorkers.shift();
        execute(worker);
      } else {
        // Queue the job
        this.queue.push({ job, execute });
      }
    });
  }

  /**
   * Process queued jobs when workers become available
   */
  processQueue() {
    if (this.queue.length > 0 && this.availableWorkers.length > 0) {
      const { job, execute } = this.queue.shift();
      const worker = this.availableWorkers.shift();
      execute(worker);
    }
  }

  /**
   * Terminate all workers
   */
  async terminate() {
    await Promise.all(this.workers.map((worker) => worker.terminate()));
    this.workers = [];
    this.availableWorkers = [];
    this.queue = [];
  }
}

// Create singleton worker pool for image processing
const imageProcessorPath = path.join(__dirname, '../workers/imageProcessor.worker.js');
const imageProcessorPool = new WorkerPool(imageProcessorPath, uploadConfig.workerPoolSize);

module.exports = {
  WorkerPool,
  imageProcessorPool,
};
