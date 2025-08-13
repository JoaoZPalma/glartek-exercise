import cron, { ScheduledTask } from "node-cron";
import axios from "axios";
import CronJobModel, { ICronJob } from "../models/CronJob";
import CronRunModel from "../models/CronRun";

const jobs = new Map<string, ScheduledTask>();

export async function loadCrons() {
  const crons = await CronJobModel.find({ enabled: true });
  crons.forEach(scheduleCron);
}

export function scheduleCron(cronJob: ICronJob) {
  // Stop and remove existing job first to prevent race conditions
  stopCronJob(cronJob.id);

  const task = cron.schedule(
    cronJob.schedule,
    async () => {
      await executeJobWithLock(cronJob);
    },
    { timezone: cronJob.timeZone }
  );

  jobs.set(cronJob.id, task);
  if (cronJob.enabled) {
    task.start();
  }
}

export async function stopCron(id: string) {
  stopCronJob(id);
  // Clear any existing locks when stopping
  await releaseLock(id);
}

// Helper function to stop job without database operations
function stopCronJob(id: string) {
  const existingTask = jobs.get(id);
  if (existingTask) {
    existingTask.stop();
    jobs.delete(id);
  }
}

async function executeJobWithLock(cronJob: ICronJob) {
  const jobId = cronJob.id;
  let lockAcquired = false;

  try {
    // Try to acquire lock with timeout
    lockAcquired = await tryLockWithRetry(jobId, 3, 100); // 3 retries, 100ms delay

    if (!lockAcquired) {
      console.log(`Job ${cronJob._id} is already running on another instance`);
      return;
    }

    await executeJob(cronJob);

  } catch (error) {
    console.error(`Error executing job ${jobId}:`, error);
  } finally {
    // Always release lock, even if job failed
    if (lockAcquired) {
      await releaseLock(jobId);
    }
  }
}

async function executeJob(cronJob: ICronJob) {
  const scheduledFor = new Date();

  const run = await CronRunModel.create({
    cronId: cronJob._id,
    scheduledFor,
    status: "pending"
  });

  try {
    // Update status to running
    await CronRunModel.findByIdAndUpdate(run._id, { status: "running" });

    const res = await axios({
      method: cronJob.httpMethod as any,
      url: cronJob.uri,
      timeout: 30000, // 30 second timeout
      ...(cronJob.body !== undefined ? { data: JSON.parse(cronJob.body) } : {})
    });

    await CronRunModel.findByIdAndUpdate(run._id, {
      executedAt: new Date(),
      status: "success",
      responseStatus: res.status,
      responseBody: typeof res.data === "string" ? res.data : JSON.stringify(res.data)
    });

  } catch (err: any) {
    await CronRunModel.findByIdAndUpdate(run._id, {
      executedAt: new Date(),
      status: "failed",
      responseBody: err.message
    });
  }
}

async function tryLockWithRetry(cronId: string, maxRetries: number = 3, delayMs: number = 100): Promise<boolean> {
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const locked = await tryLock(cronId);
    if (locked) {
      return true;
    }

    // Wait before retry (except on last attempt)
    if (attempt < maxRetries - 1) {
      await new Promise(resolve => setTimeout(resolve, delayMs * Math.pow(2, attempt))); // Exponential backoff
    }
  }

  return false;
}

async function tryLock(cronId: string, lockDurationMs = 300000): Promise<boolean> { // 5 minute lock
  const now = new Date();
  const lockUntil = new Date(now.getTime() + lockDurationMs);

  try {
    // Use findOneAndUpdate with upsert to handle race conditions atomically
    const result = await CronJobModel.findOneAndUpdate(
      {
        _id: cronId,
        $or: [
          { lockedUntil: { $exists: false } },
          { lockedUntil: null },
          { lockedUntil: { $lt: now } }
        ]
      },
      {
        lockedUntil: lockUntil,
        $setOnInsert: { _id: cronId } // Only set _id if inserting new document
      },
      {
        new: true,
        upsert: false // Don't create if doesn't exist
      }
    );

    return !!result; // Return true if we got the lock, false otherwise
  } catch (error) {
    console.error(`Error acquiring lock for job ${cronId}:`, error);
    return false;
  }
}

async function releaseLock(cronId: string): Promise<void> {
  try {
    await CronJobModel.findByIdAndUpdate(
      cronId,
      {
        $unset: { lockedUntil: 1 } // Remove the field entirely
      }
    );
  } catch (error) {
    console.error(`Error releasing lock for job ${cronId}:`, error);
    // Don't throw - we don't want to break the application if lock release fails
  }
}

// Cleanup function to release all locks on shutdown
export async function cleanupLocks(): Promise<void> {
  try {
    await CronJobModel.updateMany(
      {},
      { $unset: { lockedUntil: 1 } }
    );
    console.log('All locks released on shutdown');
  } catch (error) {
    console.error('Error cleaning up locks:', error);
  }
}

// Graceful shutdown handlers
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, cleaning up...');
  await cleanupLocks();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('Received SIGINT, cleaning up...');
  await cleanupLocks();
  process.exit(0);
});
