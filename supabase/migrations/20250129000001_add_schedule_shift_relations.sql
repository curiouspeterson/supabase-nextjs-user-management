-- Add foreign key relationship between schedules and shifts
alter table "public"."schedules" add constraint "schedules_shift_id_fkey"
    foreign key ("shift_id") references "public"."shifts"("id") on delete restrict;

-- Add foreign key relationship between shifts and shift_types
alter table "public"."shifts" add constraint "shifts_shift_type_id_fkey"
    foreign key ("shift_type_id") references "public"."shift_types"("id") on delete restrict; 