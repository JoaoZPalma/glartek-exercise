import { Request, Response } from "express";
import CronJobModel from "../models/CronJob";
import { scheduleCron, stopCron } from "../config/scheduler";

export async function createCron(req: Request, res: Response) {
  try {
    const cronJob = await CronJobModel.create(req.body);

    // Only schedule if enabled
    if (cronJob.enabled) {
      scheduleCron(cronJob);
    }

    res.status(201).json(cronJob);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function listCrons(req: Request, res: Response) {
  try {
    const crons = await CronJobModel.find();
    res.json(crons);
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}

export async function updateCron(req: Request, res: Response) {
  try {
    // First, stop the existing job to prevent race conditions
    await stopCron(req.params.id as string);

    // Update the job in database
    const cronJob = await CronJobModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );

    if (!cronJob) {
      return res.status(404).json({ error: "Cron job not found" });
    }

    // Schedule the updated job if enabled
    if (cronJob.enabled) {
      scheduleCron(cronJob);
    }

    res.json(cronJob);
  } catch (err) {
    res.status(400).json({ error: (err as Error).message });
  }
}

export async function deleteCron(req: Request, res: Response) {
  try {
    // Stop the job first
    await stopCron(req.params.id as string);

    // Then delete from database
    const deleted = await CronJobModel.findByIdAndDelete(req.params.id);

    if (!deleted) {
      return res.status(404).json({ error: "Cron job not found" });
    }

    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
}
