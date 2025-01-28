-- Create pattern_shifts table
create table "public"."pattern_shifts" (
    "id" uuid not null default gen_random_uuid(),
    "pattern_id" uuid not null references public.shift_patterns(id) on delete cascade,
    "start_time" time without time zone not null,
    "end_time" time without time zone not null,
    "shift_type_id" uuid not null references public.shift_types(id),
    "duration_hours" integer not null,
    "duration_category" duration_category_enum,
    "employee_role" employee_role not null,
    "created_at" timestamp with time zone not null default now(),
    "updated_at" timestamp with time zone not null default now(),
    constraint "pattern_shifts_pkey" primary key ("id"),
    constraint "pattern_shifts_duration_check" check ((duration_hours > 0) and (duration_hours <= 24))
);

-- Enable RLS
alter table "public"."pattern_shifts" enable row level security;

-- Add foreign key relationship to shift_patterns table
alter table "public"."pattern_shifts" add constraint "pattern_shifts_pattern_id_fkey"
    foreign key ("pattern_id") references "public"."shift_patterns"("id") on delete cascade;

-- Add foreign key relationship to shift_types table
alter table "public"."pattern_shifts" add constraint "pattern_shifts_shift_type_id_fkey"
    foreign key ("shift_type_id") references "public"."shift_types"("id");

-- Add some sample data
insert into public.pattern_shifts (pattern_id, start_time, end_time, shift_type_id, duration_hours, duration_category, employee_role)
select 
    sp.id as pattern_id,
    '08:00'::time as start_time,
    '18:00'::time as end_time,
    (select id from public.shift_types limit 1) as shift_type_id,
    10 as duration_hours,
    '10 hours'::duration_category_enum as duration_category,
    'Dispatcher'::employee_role as employee_role
from public.shift_patterns sp
where sp.pattern_type = '4x10';

insert into public.pattern_shifts (pattern_id, start_time, end_time, shift_type_id, duration_hours, duration_category, employee_role)
select 
    sp.id as pattern_id,
    '07:00'::time as start_time,
    '19:00'::time as end_time,
    (select id from public.shift_types limit 1) as shift_type_id,
    12 as duration_hours,
    '12 hours'::duration_category_enum as duration_category,
    'Shift Supervisor'::employee_role as employee_role
from public.shift_patterns sp
where sp.pattern_type = '3x12_1x4'; 