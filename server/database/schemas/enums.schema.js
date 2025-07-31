import { z } from 'zod';

// job_status enum from SQL
export const JobStatusEnum = z.enum(['STARTED', 'RUNNING', 'SUCCESS', 'FAIL']);

export const JOB_STATUS = {
  STARTED: 'STARTED',
  RUNNING: 'RUNNING', 
  SUCCESS: 'SUCCESS',
  FAIL: 'FAIL'
}; 