-- Function to update process run status based on events
-- Optimized for high-frequency event insertion with minimal lock contention

CREATE OR REPLACE FUNCTION update_process_run_status(p_process_run_id uuid)
RETURNS void AS $$
DECLARE
    v_process_run_created_at timestamptz;
    v_last_event_status process_events_status;
    v_last_event_created_at timestamptz;
    v_has_warnings_or_errors boolean;
    v_new_status process_run_status;
    v_last_event_exists boolean;
BEGIN
    -- Use advisory lock to prevent concurrent updates for the same process_run_id
    -- This ensures only one instance of this function runs per process_run_id at a time
    IF NOT pg_try_advisory_xact_lock(hashtext(p_process_run_id::text)) THEN
        -- If we can't get the lock, another instance is already processing this process_run
        -- We can safely return as the other instance will handle the update
        RETURN;
    END IF;

    -- Get process run created_at timestamp
    SELECT created_at 
    INTO v_process_run_created_at
    FROM processes_runs 
    WHERE id = p_process_run_id;
    
    -- If process run doesn't exist, exit early
    IF v_process_run_created_at IS NULL THEN
        RETURN;
    END IF;

    -- Check if there are any events for this process run and get aggregated data
    SELECT 
        EXISTS(SELECT 1 FROM processes_events WHERE process_run_id = p_process_run_id AND last_event = true),
        COALESCE(
            (SELECT status FROM processes_events 
             WHERE process_run_id = p_process_run_id AND last_event = true 
             ORDER BY created_at DESC LIMIT 1), 
            NULL
        ),
        COALESCE(
            (SELECT created_at FROM processes_events 
             WHERE process_run_id = p_process_run_id AND last_event = true 
             ORDER BY created_at DESC LIMIT 1), 
            NULL
        ),
        EXISTS(
            SELECT 1 FROM processes_events 
            WHERE process_run_id = p_process_run_id 
            AND status IN ('WARNING', 'FAIL')
        )
    INTO v_last_event_exists, v_last_event_status, v_last_event_created_at, v_has_warnings_or_errors;

    -- Determine the new status based on the logic
    IF v_last_event_exists AND v_last_event_status IS NOT NULL THEN
        -- Process is finished - map the event status to process run status
        CASE v_last_event_status
            WHEN 'SUCCESS' THEN v_new_status := 'SUCCESS';
            WHEN 'FAIL' THEN v_new_status := 'FAIL';
            WHEN 'WARNING' THEN v_new_status := 'WARNING';
        END CASE;
        
        -- Update status, set finished=true, and update timestamp for completed processes
        UPDATE processes_runs 
        SET 
            status = v_new_status,
            finished = true,
            updated_at = NOW()
        WHERE 
            id = p_process_run_id 
            AND (status != v_new_status OR finished != true);
            
    ELSE
        -- Process is still running
        IF v_has_warnings_or_errors THEN
            v_new_status := 'WARNING';
        ELSE
            v_new_status := 'RUNNING';
        END IF;
        
        -- Update status and timestamp for running processes (finished stays false)
        UPDATE processes_runs 
        SET 
            status = v_new_status,
            updated_at = NOW()
        WHERE 
            id = p_process_run_id 
            AND status != v_new_status;
    END IF;

END;
$$ LANGUAGE plpgsql;

-- Create a trigger function that calls the update function
CREATE OR REPLACE FUNCTION trigger_update_process_run_status()
RETURNS trigger AS $$
BEGIN
    -- Call the update function for the affected process_run_id
    -- Only on INSERT operations
    PERFORM update_process_run_status(NEW.process_run_id);
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create the trigger on processes_events table (only for INSERT)
DROP TRIGGER IF EXISTS trigger_process_events_status_update ON processes_events;
CREATE TRIGGER trigger_process_events_status_update
    AFTER INSERT ON processes_events
    FOR EACH ROW
    EXECUTE FUNCTION trigger_update_process_run_status();

-- Create an index to optimize the queries in the function
CREATE INDEX IF NOT EXISTS idx_processes_events_process_run_status 
ON processes_events(process_run_id, status) 
WHERE status IN ('WARNING', 'FAIL');

-- Create an index for last_event queries
CREATE INDEX IF NOT EXISTS idx_processes_events_last_event_created_at 
ON processes_events(process_run_id, created_at DESC) 
WHERE last_event = true;

-- Add a comment explaining the optimization strategy
COMMENT ON FUNCTION update_process_run_status(uuid) IS 
'Updates process run status based on associated events. 
Optimized for high-frequency event insertion using:
1. Advisory locks to prevent concurrent updates on same process_run_id
2. Single aggregated query to get all needed event data
3. Conditional updates to minimize unnecessary writes
4. Specialized indexes for fast event lookups';
