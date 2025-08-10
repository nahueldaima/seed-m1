import { z } from 'zod';

// job_status enum from SQL
export const JobStatusEnum = z.enum(['STARTED', 'RUNNING', 'SUCCESS', 'FAIL', 'WARNING']);

export const JOB_STATUS = {
  STARTED: 'STARTED',
  RUNNING: 'RUNNING',
  WARNING: 'WARNING',
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
}; 


export const EventsStatusEnum = z.enum(['ok', 'error', 'warning']);