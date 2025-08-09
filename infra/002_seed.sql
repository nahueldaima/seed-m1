-- Insert default permissions
INSERT INTO permissions (code, description) VALUES
  ('PROCESS_READ', 'Can view processes and their configurations'),
  ('PROCESS_WRITE', 'Can create and modify processes'),
  ('JOB_READ', 'Can view job runs and events'),
  ('JOB_WRITE', 'Can create job runs and events'),
  ('ADMIN', 'Administrative access to users, groups, and permissions'),
  ('MONGO_ADMIN', 'Can manage MongoDB collection mappings');

-- Insert default groups
INSERT INTO groups (id, name, description, filters) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Operators', 'Basic operators with read-only access', ARRAY['center_A', 'center_B']),
  ('22222222-2222-2222-2222-222222222222', 'Admins', 'System administrators with full access', null),
  ('33333333-3333-3333-3333-333333333333', 'SuperAdmins', 'Super administrators with unrestricted access', null);

-- Assign permissions to groups
INSERT INTO group_permissions (group_id, perm_id) VALUES
  -- Operators: Read-only access
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM permissions WHERE code = 'PROCESS_READ')),
  ('11111111-1111-1111-1111-111111111111', (SELECT id FROM permissions WHERE code = 'JOB_READ')),
  
  -- Admins: Full access except super admin functions
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM permissions WHERE code = 'PROCESS_READ')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM permissions WHERE code = 'PROCESS_WRITE')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM permissions WHERE code = 'JOB_READ')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM permissions WHERE code = 'JOB_WRITE')),
  ('22222222-2222-2222-2222-222222222222', (SELECT id FROM permissions WHERE code = 'ADMIN')),
  
  -- SuperAdmins: All permissions
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'PROCESS_READ')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'PROCESS_WRITE')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'JOB_READ')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'JOB_WRITE')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'ADMIN')),
  ('33333333-3333-3333-3333-333333333333', (SELECT id FROM permissions WHERE code = 'MONGO_ADMIN'));

-- Default MongoDB collection mappings
INSERT INTO mongo_collections (collection_key, mongo_collection_name, description, search_fields, display_field) VALUES
  ('centers', 'physical_locations', 'Physical locations/centers', '["name", "code"]', 'name'),
  ('departments', 'organizational_units', 'Organizational departments', '["name", "code", "abbreviation"]', 'name'),
  ('categories', 'process_categories', 'Process categories', '["name", "type"]', 'name'),
  ('regions', 'geographical_regions', 'Geographical regions', '["name", "code", "country"]', 'name'),
  ('teams', 'operational_teams', 'Operational teams', '["name", "code", "manager"]', 'name');

-- Sample processes with MongoDB filter references
INSERT INTO processes (id, name, description, default_meta, account, mongo_filters) VALUES
  ('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', 'Daily Sales Report', 'Generate daily sales report for specified centers', 
   '{"report_type": "sales", "frequency": "daily"}', 'corporate',
   '{"centers": [], "departments": []}'),
   
  ('bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', 'Inventory Sync', 'Synchronize inventory data across systems',
   '{"sync_type": "inventory", "batch_size": 1000}', 'operations',
   '{"centers": [], "categories": []}'),
   
  ('cccccccc-cccc-cccc-cccc-cccccccccccc', 'Customer Analytics', 'Process customer behavior analytics',
   '{"analytics_type": "customer", "time_window": "7d"}', 'analytics',
   '{"regions": [], "teams": []}');

-- Sample job runs with matching timestamps
INSERT INTO processes_runs (id, uuid, environment, account, process_id, filters, status, meta, created_by, created_at, updated_at) VALUES
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 'sales-report-001', 'production', 'corporate',
   'aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa', '["center_A", "dept_sales"]', 'SUCCESS',
   '{"execution_time": 45000, "records_processed": 15000}', null,
   '2024-01-27 10:00:00+00', '2024-01-27 10:00:45+00'),
   
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 'inventory-sync-002', 'staging', 'operations',
   'bbbbbbbb-bbbb-bbbb-bbbb-bbbbbbbbbbbb', '["center_B", "category_electronics"]', 'RUNNING',
   '{"execution_time": null, "records_processed": 8500}', null,
   '2024-01-27 11:00:00+00', '2024-01-27 11:05:00+00'),
   
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 'analytics-003', 'development', 'analytics',
   'cccccccc-cccc-cccc-cccc-cccccccccccc', '["region_north", "team_analytics"]', 'FAIL',
   '{"execution_time": 12000, "error": "Connection timeout"}', null,
   '2024-01-27 09:00:00+00', '2024-01-27 09:00:30+00');

-- Sample job events
INSERT INTO processes_events (job_id, seq, message, status, details) VALUES
  -- Events for successful job
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 1, 'Job started', 'STARTED', '{"timestamp": "2024-01-27T10:00:00Z"}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 2, 'Fetching data from database', 'RUNNING', '{"step": "data_fetch", "progress": 25}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 3, 'Processing sales records', 'RUNNING', '{"step": "processing", "progress": 75}'),
  ('dddddddd-dddd-dddd-dddd-dddddddddddd', 4, 'Report generated successfully', 'SUCCESS', '{"step": "completion", "output_file": "sales_report_2024-01-27.pdf"}'),
  
  -- Events for running job
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 1, 'Inventory sync started', 'STARTED', '{"timestamp": "2024-01-27T11:00:00Z"}'),
  ('eeeeeeee-eeee-eeee-eeee-eeeeeeeeeeee', 2, 'Syncing category: Electronics', 'RUNNING', '{"step": "sync_category", "category": "electronics", "progress": 60}'),
  
  -- Events for failed job
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 1, 'Analytics job started', 'STARTED', '{"timestamp": "2024-01-27T09:00:00Z"}'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 2, 'Connecting to analytics service', 'RUNNING', '{"step": "connection", "service": "analytics_api"}'),
  ('ffffffff-ffff-ffff-ffff-ffffffffffff', 3, 'Connection failed - timeout after 30s', 'FAIL', '{"step": "connection", "error": "timeout", "duration": 30000}');

-- Duration will be automatically calculated by the generated column:
-- dddddddd job: 45 seconds (45,000 ms)
-- eeeeeeee job: 5 minutes (300,000 ms) 
-- ffffffff job: 30 seconds (30,000 ms)

-- Create a sample superadmin user profile (will be linked when user signs up)
-- Note: This will need to be updated with actual user ID after Supabase Auth signup
-- INSERT INTO user_profiles (id, display_name, is_superadmin, mongo_filters) VALUES
--   ('USER_ID_FROM_SUPABASE_AUTH', 'Super Admin', true, '{}');

-- Function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_profiles (id, display_name, is_superadmin, mongo_filters)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), false, '{}');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create profile on user signup
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user(); 