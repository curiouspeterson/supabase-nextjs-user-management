drop trigger if exists "update_time_off_requests_updated_at" on "public"."time_off_requests";

drop function if exists "public"."get_time_off_requests"();

drop function if exists "public"."get_users_by_ids"(user_ids uuid[]);

drop function if exists "public"."update_time_off_updated_at"();

CREATE TRIGGER update_time_off_trigger BEFORE UPDATE ON public.time_off_requests FOR EACH ROW EXECUTE FUNCTION update_time_off_update();


