SET session_replication_role = replica;

--
-- PostgreSQL database dump
--

-- Dumped from database version 15.8
-- Dumped by pg_dump version 15.8

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Data for Name: audit_log_entries; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '88e36666-a465-4865-983b-bf11533d308d', 'authenticated', 'authenticated', 'manager1@example.com', '$2a$06$pFgxfOjA5hUiuvTm9RO7/.TuyF62FDeG44U4d2h77yT0IVOo4dyQO', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manager 1", "user_role": "Manager", "employee_role": "Management", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '58e6399e-e881-4b03-8946-2cb7f2ea32dd', 'authenticated', 'authenticated', 'manager2@example.com', '$2a$06$RVjhQ.MV/8MRGwfciiuvXuSGKANJl5VmREBg6P.Jzuoaqp9nY1qwq', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manager 2", "user_role": "Manager", "employee_role": "Management", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ea3ffafe-f9a4-4374-bf2a-731acd5e476e', 'authenticated', 'authenticated', 'manager3@example.com', '$2a$06$n3B//mbbmNvLzHYQ10GxUO4dlNQh5FRi/rt8Yskib.90qsiMPVLCi', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manager 3", "user_role": "Manager", "employee_role": "Management", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b21fc993-ffe8-47e3-9b54-729affa5907d', 'authenticated', 'authenticated', 'manager4@example.com', '$2a$06$q8zsE4CqZQbJDKVh6T1tzeO5t1362BCTSogEWk07LfGhI25iED/Xu', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manager 4", "user_role": "Manager", "employee_role": "Management", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f3d38766-63e9-4d68-ba89-1a751ece2ed8', 'authenticated', 'authenticated', 'manager5@example.com', '$2a$06$gHFHJAPFNGJOuxxeSLj0Ou9LNPnhiiMmLLVIs2mkXKGF42Vz3co3C', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Manager 5", "user_role": "Manager", "employee_role": "Management", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8305ddc4-7ffe-44cd-b0b2-6e416414313c', 'authenticated', 'authenticated', 'supervisor1@example.com', '$2a$06$/34n94RnKQ5CrDNBpFm2yOr8JqX0AJvXVTaWB.4II7fpSD3UVdcUW', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 1", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'db7901ec-5f52-4d15-8594-a108a411b2ff', 'authenticated', 'authenticated', 'supervisor2@example.com', '$2a$06$sz5gBKmG9mNhvZhiJP8STudEBGG7O0AvfQBSf1icesoskg/zY9zeu', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 2", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '06a6b20d-7e34-43f4-b157-95a61334ecd5', 'authenticated', 'authenticated', 'supervisor3@example.com', '$2a$06$7SlhyM.Q0H6WGO8OGsiLMOyTObTGaBed60bvbL6MCRh5R4TPSatpO', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 3", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a90bb78a-fe75-4ec9-8b95-4c1c044237ba', 'authenticated', 'authenticated', 'supervisor4@example.com', '$2a$06$d4vtZDbnO7cObHCrrZWwq.5/wQzEsYCUQG5PxP52txHCNa6HEDnVS', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 4", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '15de29ce-373d-48e6-9925-be7a57f2f38b', 'authenticated', 'authenticated', 'supervisor5@example.com', '$2a$06$Hg4Ax9ZFJ1g.lxTNmSeagOvZJE0CVRLtfp6gePMjFg5KmTod8Ctcu', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 5", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2cfb3560-0668-46b1-8671-32d8961d1d9e', 'authenticated', 'authenticated', 'supervisor6@example.com', '$2a$06$yiQ4QybfUyH7XFXuYtXAmuRDDIE9kWbKGNYCkgIFNCqsorgiFUDfS', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 6", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9658f65a-64a7-4538-b80c-64c4198a4517', 'authenticated', 'authenticated', 'supervisor7@example.com', '$2a$06$QOzEGwxiBmbfUU3/g9ZvKOe6cymg7EPbT4AAd4VZjjrMaET1uFTyK', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 7", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b96d2078-3af7-4bab-b112-8b0e0892e33f', 'authenticated', 'authenticated', 'supervisor8@example.com', '$2a$06$8a1CS3MZWu5Dx9HM7Vb6AuaPGg2DT3ZrYyPOci0zMb4XuQruInNOu', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 8", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '228f8208-3c80-446e-8fc2-4d229df85030', 'authenticated', 'authenticated', 'supervisor9@example.com', '$2a$06$0jpw0Q0C0kE9tx.MtyKyEuaV87ScPfD0xc4gyrgBrX97UK9ej3A5S', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 9", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f15d591a-6bbe-407e-a295-d288a26141b1', 'authenticated', 'authenticated', 'supervisor10@example.com', '$2a$06$aHvT/o1Pjh1NOnKrV5I7ie/9woVPTNWJDUws57oZuHHkPfa8KjDoS', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Supervisor 10", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ba2eb797-a295-4373-95ee-c22eeef99efd', 'authenticated', 'authenticated', 'dispatcher1@example.com', '$2a$06$DhazICCl3ix4qO25p17xFuY7VL.Ia0M71.lRJN2uclwJsy1L1tk6u', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 1", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'df238850-9d79-4716-8863-38f99f1caa02', 'authenticated', 'authenticated', 'dispatcher2@example.com', '$2a$06$x69vpNy93lrt7ixUsL6mVOb82YWGUlPokxUoJ6xvdKaCugilnck.i', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 2", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '38f5416a-e72c-47e8-92d5-37022274dac1', 'authenticated', 'authenticated', 'dispatcher3@example.com', '$2a$06$57NvJpq0.XWudVL2H1g3We1Dr4eeUu0mkF6398SnUaa6AcFW4vJci', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 3", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c504a092-4883-4b9f-b270-a7259ccb0980', 'authenticated', 'authenticated', 'dispatcher4@example.com', '$2a$06$lETrU.nD39bBEMqqiWF.Req4xzHByNeQVwae1UUI/Ej49x5nTHp9a', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 4", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '51643b51-9603-4151-bbae-1c44037773ba', 'authenticated', 'authenticated', 'dispatcher5@example.com', '$2a$06$9sQvuSqok5t3OEd/BIOWJe./bMFyBAyMgU5Iwr6.so7un3.Do5ilm', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 5", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '11a0b8cd-0c43-46c3-881a-de863307e028', 'authenticated', 'authenticated', 'dispatcher6@example.com', '$2a$06$/q21I2icy16VsOwEHoZjK.zusDeC6VD6TRiQN0jrFuar.uETgP9J2', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 6", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4f2c808e-133d-4347-8b23-7bbf93ce4076', 'authenticated', 'authenticated', 'dispatcher7@example.com', '$2a$06$yK0D.nu3NsHH8kJ./gGpde3Iw7Y2HvWPvxuFOFoRZgGxbAlD0XnDW', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 7", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4210a367-8419-4f94-960b-62f5ed88987b', 'authenticated', 'authenticated', 'dispatcher8@example.com', '$2a$06$E5X8ZfnNL2f83dhCJHYSxOV/x3fonrsydtVVmI09ce8bFnfWoKQ3C', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 8", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4122eb97-61e1-4a6f-b881-0ed17be5afaa', 'authenticated', 'authenticated', 'dispatcher9@example.com', '$2a$06$oT4/Shp1umxPG5kzAPwh7evYSEujLM.1doHwOa1Tp2xNwWL7uNaS6', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 9", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'e9496599-2f81-47d6-b25c-022f35415e88', 'authenticated', 'authenticated', 'dispatcher10@example.com', '$2a$06$h4uP6rqCZAY1R.FDLPcSHeE/U27HdSKUb16WtUOfHjtvcUcgsGHfy', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 10", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1930302a-ef3a-41e4-aef3-ec2df1a5ca56', 'authenticated', 'authenticated', 'dispatcher11@example.com', '$2a$06$YcpojmOsE16pr3fJQ4rhe.iFGMCT5NchPJtpLWmF8cNufRzanRzM6', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 11", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '86be5b58-c870-4caf-b2f6-e02792299b3f', 'authenticated', 'authenticated', 'dispatcher12@example.com', '$2a$06$KgAGsYJrj51DY7ng6K5l3eCvNLfIMXUA72YEkKbzdNK8JamrRQT0C', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 12", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b4407d9b-b746-4574-bbf6-c45ce91c0957', 'authenticated', 'authenticated', 'dispatcher13@example.com', '$2a$06$87WgD6STMGnuu7QxlklhRO8tMYl6ZDw4RfrHmMbfilUP6x5EfEXFa', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 13", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2a3f190c-1444-4d66-994a-1ef37afcdf40', 'authenticated', 'authenticated', 'dispatcher14@example.com', '$2a$06$fsdgmuR8b3kpXjU4Mpbpce2innz.IZ3nb/RunuWGt4dfztOsemelC', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 14", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1ec91bbc-c74e-4f25-ac5d-4906e72ebf62', 'authenticated', 'authenticated', 'dispatcher15@example.com', '$2a$06$9A17zrYjHj289/Ri2uo26OwEEreaDgw7TW9VaxoCO8KgomyE1a8.C', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 15", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3af5c418-417b-4876-94fb-cd293c48d028', 'authenticated', 'authenticated', 'dispatcher16@example.com', '$2a$06$p8p4vGyLbPc94IMzveYOTu9uzFUb8j2k5c4YD87ndPBF87jwrrbRy', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 16", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '18ac8eca-1087-4674-99e0-96835e8c4c56', 'authenticated', 'authenticated', 'dispatcher17@example.com', '$2a$06$VleMHvsNGzGE8jzXnpkv9OZ7rOACx0j2rUwJIrW8eP6HN45QPEwmG', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 17", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7c9ff09b-e811-425f-a13f-7056d96c175f', 'authenticated', 'authenticated', 'dispatcher18@example.com', '$2a$06$39HHwpCa5xA3uYkriakFgO.HuR0cvQu4uKl8rFLI8NyE7ZmRsEdaW', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 18", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '1a1e42ef-8d31-4965-9114-46179164615b', 'authenticated', 'authenticated', 'dispatcher19@example.com', '$2a$06$KRvlBasW1mz4L.4VMv9.zetTCwYdgbv.8J60cz8SiQzgrFYKX2/9W', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 19", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4d448dc3-9fa9-46bd-acde-2ffbfebc128d', 'authenticated', 'authenticated', 'dispatcher20@example.com', '$2a$06$Ey4eDOT4nfLVv3G8fU.dauq0sDk.VAofMOb211KGAQJ.Eaan/LWGe', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 20", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '39ff2b08-d0e2-4dd6-9052-a5ba40e9c22b', 'authenticated', 'authenticated', 'dispatcher21@example.com', '$2a$06$KF88b.1.fk.0xfCU4WJl2.iOBGbGSBYCT.//MRRTixpQ.HGCj1R/m', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 21", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cbee2dd0-6f00-4673-9269-d12ba921e385', 'authenticated', 'authenticated', 'dispatcher22@example.com', '$2a$06$wSYC.W7BMDE7vqPRPXhOWuLWp1YgHWIX7eLhOlG2zTGOdxpgrHUdO', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 22", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8be98b01-f612-4b57-807e-ce346d5e5002', 'authenticated', 'authenticated', 'dispatcher23@example.com', '$2a$06$B9Xnos53ak1gi8Feo6tvOem2qhTBa1uKncgnEeIoqN7pS8ZsoIepa', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 23", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5555999f-23b4-4f07-a621-7aa6b8993742', 'authenticated', 'authenticated', 'dispatcher24@example.com', '$2a$06$7QJeshY3anvRe9KjR/aHx..4y29LTl2VMOYOAWJdkYiqQ2OKMKhKe', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 24", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3f5eea44-cc8f-4871-9e8a-b98915ff17d6', 'authenticated', 'authenticated', 'dispatcher25@example.com', '$2a$06$WfOYxr0TLSpv0ihGCqgme.brhaPAq31ao7tKmnYCO5dveRHloXheW', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 25", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a28ed60e-fde5-451f-bdd8-23d9a30653e4', 'authenticated', 'authenticated', 'dispatcher26@example.com', '$2a$06$Vb11QqAKKYmGYLI7Vh4BSOT5yDnpRlFklNfSkqvvrvfPHv5terPpq', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 26", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b899a9d1-0ebd-4ea5-85e7-a01776fa1a2a', 'authenticated', 'authenticated', 'dispatcher27@example.com', '$2a$06$m8lol3U1Fg6aplzRF1foTuA5LcLK./WQ..g1D/EzTOc5agapQDlCG', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 27", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2120e2e7-b818-44f0-addb-16624f687986', 'authenticated', 'authenticated', 'dispatcher28@example.com', '$2a$06$F2zKPRht6LQkIfEx0YGtw.Uw8t/CtEKrBdhtF/J2JrhEd4XKyHxnC', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 28", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'a7f2a27b-c54c-4712-a157-3d6cd4c374f6', 'authenticated', 'authenticated', 'dispatcher29@example.com', '$2a$06$CzEvzBUYoSN7qRA5WDmrLO1E6EwBv5GYzWm9MkqKHHnynx01tW4X2', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 29", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8d121956-4177-4391-88bd-ca311494e422', 'authenticated', 'authenticated', 'dispatcher30@example.com', '$2a$06$Pwesqhjtlk8Ca6OmNALP2epdUZcKnkCeM5HwHvePR7msAm3UXQQz.', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 30", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '46ae2d59-6917-4cc6-af18-bc64f4e3dc54', 'authenticated', 'authenticated', 'dispatcher31@example.com', '$2a$06$SqvCoqlSj1KFIgiGmgYEauJf/0hFThUQ1qDX0ue7.H.dRhDVdd0t6', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 31", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f41f1123-97b3-455b-a008-0d97aaee549d', 'authenticated', 'authenticated', 'dispatcher32@example.com', '$2a$06$V.gXgycyvz3qtwKfPkpWee2xuEO07UyaZZz1y0cxhK0vrh/0z71Ri', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 32", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b83a9d47-38bd-4f75-a998-023fc57a2b61', 'authenticated', 'authenticated', 'dispatcher33@example.com', '$2a$06$RMoasnWK0Y4.oIBEZywriud3KbwTdiyE.YPX5ERCCQZnB1OdsgWhW', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 33", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '15784d00-9805-4455-bb65-49924de4f395', 'authenticated', 'authenticated', 'dispatcher34@example.com', '$2a$06$xMz/td/FhlAMCSUaFuyoAOfR.Gb4jib5c6zic7lRT1P8mlfP9GVJ6', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 34", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '671fe4eb-7c98-4e20-8c45-b9f518089d60', 'authenticated', 'authenticated', 'dispatcher35@example.com', '$2a$06$0auYnvwDHy..GmmyBCfTAORmxBPU.9lsKhnxmflWOqARm.yjAXPFO', '2025-01-26 23:02:39.000517+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"full_name": "Dispatcher 35", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true}', false, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_factors; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: mfa_challenges; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: one_time_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: refresh_tokens; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_providers; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: saml_relay_states; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sso_domains; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: key; Type: TABLE DATA; Schema: pgsodium; Owner: supabase_admin
--



--
-- Data for Name: staffing_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."staffing_requirements" ("id", "period_name", "start_time", "end_time", "minimum_employees", "shift_supervisor_required", "created_at", "updated_at") VALUES
	('f21b660d-5932-4b84-85a2-e653a4eaeff8', 'Morning', '05:00:00', '09:00:00', 6, true, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('92fb3bbe-1698-467d-8ac8-323f5d0d535e', 'Daytime', '09:00:00', '21:00:00', 8, true, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('ec72fa33-b50a-4db9-accd-8a338f68e9eb', 'Evening', '21:00:00', '01:00:00', 7, true, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1d6e3074-7bda-48df-bc05-6fc0f4a4ba68', 'Night', '01:00:00', '05:00:00', 6, true, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: daily_coverage; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "updated_at", "username", "full_name", "avatar_url", "website", "role") VALUES
	('88e36666-a465-4865-983b-bf11533d308d', '2025-01-26 23:02:39.000517+00', 'manager.1', 'Manager 1', NULL, NULL, 'user'),
	('58e6399e-e881-4b03-8946-2cb7f2ea32dd', '2025-01-26 23:02:39.000517+00', 'manager.2', 'Manager 2', NULL, NULL, 'user'),
	('ea3ffafe-f9a4-4374-bf2a-731acd5e476e', '2025-01-26 23:02:39.000517+00', 'manager.3', 'Manager 3', NULL, NULL, 'user'),
	('b21fc993-ffe8-47e3-9b54-729affa5907d', '2025-01-26 23:02:39.000517+00', 'manager.4', 'Manager 4', NULL, NULL, 'user'),
	('f3d38766-63e9-4d68-ba89-1a751ece2ed8', '2025-01-26 23:02:39.000517+00', 'manager.5', 'Manager 5', NULL, NULL, 'user'),
	('8305ddc4-7ffe-44cd-b0b2-6e416414313c', '2025-01-26 23:02:39.000517+00', 'supervisor.1', 'Supervisor 1', NULL, NULL, 'user'),
	('db7901ec-5f52-4d15-8594-a108a411b2ff', '2025-01-26 23:02:39.000517+00', 'supervisor.2', 'Supervisor 2', NULL, NULL, 'user'),
	('06a6b20d-7e34-43f4-b157-95a61334ecd5', '2025-01-26 23:02:39.000517+00', 'supervisor.3', 'Supervisor 3', NULL, NULL, 'user'),
	('a90bb78a-fe75-4ec9-8b95-4c1c044237ba', '2025-01-26 23:02:39.000517+00', 'supervisor.4', 'Supervisor 4', NULL, NULL, 'user'),
	('15de29ce-373d-48e6-9925-be7a57f2f38b', '2025-01-26 23:02:39.000517+00', 'supervisor.5', 'Supervisor 5', NULL, NULL, 'user'),
	('2cfb3560-0668-46b1-8671-32d8961d1d9e', '2025-01-26 23:02:39.000517+00', 'supervisor.6', 'Supervisor 6', NULL, NULL, 'user'),
	('9658f65a-64a7-4538-b80c-64c4198a4517', '2025-01-26 23:02:39.000517+00', 'supervisor.7', 'Supervisor 7', NULL, NULL, 'user'),
	('b96d2078-3af7-4bab-b112-8b0e0892e33f', '2025-01-26 23:02:39.000517+00', 'supervisor.8', 'Supervisor 8', NULL, NULL, 'user'),
	('228f8208-3c80-446e-8fc2-4d229df85030', '2025-01-26 23:02:39.000517+00', 'supervisor.9', 'Supervisor 9', NULL, NULL, 'user'),
	('f15d591a-6bbe-407e-a295-d288a26141b1', '2025-01-26 23:02:39.000517+00', 'supervisor.10', 'Supervisor 10', NULL, NULL, 'user'),
	('ba2eb797-a295-4373-95ee-c22eeef99efd', '2025-01-26 23:02:39.000517+00', 'dispatcher.1', 'Dispatcher 1', NULL, NULL, 'user'),
	('df238850-9d79-4716-8863-38f99f1caa02', '2025-01-26 23:02:39.000517+00', 'dispatcher.2', 'Dispatcher 2', NULL, NULL, 'user'),
	('38f5416a-e72c-47e8-92d5-37022274dac1', '2025-01-26 23:02:39.000517+00', 'dispatcher.3', 'Dispatcher 3', NULL, NULL, 'user'),
	('c504a092-4883-4b9f-b270-a7259ccb0980', '2025-01-26 23:02:39.000517+00', 'dispatcher.4', 'Dispatcher 4', NULL, NULL, 'user'),
	('51643b51-9603-4151-bbae-1c44037773ba', '2025-01-26 23:02:39.000517+00', 'dispatcher.5', 'Dispatcher 5', NULL, NULL, 'user'),
	('11a0b8cd-0c43-46c3-881a-de863307e028', '2025-01-26 23:02:39.000517+00', 'dispatcher.6', 'Dispatcher 6', NULL, NULL, 'user'),
	('4f2c808e-133d-4347-8b23-7bbf93ce4076', '2025-01-26 23:02:39.000517+00', 'dispatcher.7', 'Dispatcher 7', NULL, NULL, 'user'),
	('4210a367-8419-4f94-960b-62f5ed88987b', '2025-01-26 23:02:39.000517+00', 'dispatcher.8', 'Dispatcher 8', NULL, NULL, 'user'),
	('4122eb97-61e1-4a6f-b881-0ed17be5afaa', '2025-01-26 23:02:39.000517+00', 'dispatcher.9', 'Dispatcher 9', NULL, NULL, 'user'),
	('e9496599-2f81-47d6-b25c-022f35415e88', '2025-01-26 23:02:39.000517+00', 'dispatcher.10', 'Dispatcher 10', NULL, NULL, 'user'),
	('1930302a-ef3a-41e4-aef3-ec2df1a5ca56', '2025-01-26 23:02:39.000517+00', 'dispatcher.11', 'Dispatcher 11', NULL, NULL, 'user'),
	('86be5b58-c870-4caf-b2f6-e02792299b3f', '2025-01-26 23:02:39.000517+00', 'dispatcher.12', 'Dispatcher 12', NULL, NULL, 'user'),
	('b4407d9b-b746-4574-bbf6-c45ce91c0957', '2025-01-26 23:02:39.000517+00', 'dispatcher.13', 'Dispatcher 13', NULL, NULL, 'user'),
	('2a3f190c-1444-4d66-994a-1ef37afcdf40', '2025-01-26 23:02:39.000517+00', 'dispatcher.14', 'Dispatcher 14', NULL, NULL, 'user'),
	('1ec91bbc-c74e-4f25-ac5d-4906e72ebf62', '2025-01-26 23:02:39.000517+00', 'dispatcher.15', 'Dispatcher 15', NULL, NULL, 'user'),
	('3af5c418-417b-4876-94fb-cd293c48d028', '2025-01-26 23:02:39.000517+00', 'dispatcher.16', 'Dispatcher 16', NULL, NULL, 'user'),
	('18ac8eca-1087-4674-99e0-96835e8c4c56', '2025-01-26 23:02:39.000517+00', 'dispatcher.17', 'Dispatcher 17', NULL, NULL, 'user'),
	('7c9ff09b-e811-425f-a13f-7056d96c175f', '2025-01-26 23:02:39.000517+00', 'dispatcher.18', 'Dispatcher 18', NULL, NULL, 'user'),
	('1a1e42ef-8d31-4965-9114-46179164615b', '2025-01-26 23:02:39.000517+00', 'dispatcher.19', 'Dispatcher 19', NULL, NULL, 'user'),
	('4d448dc3-9fa9-46bd-acde-2ffbfebc128d', '2025-01-26 23:02:39.000517+00', 'dispatcher.20', 'Dispatcher 20', NULL, NULL, 'user'),
	('39ff2b08-d0e2-4dd6-9052-a5ba40e9c22b', '2025-01-26 23:02:39.000517+00', 'dispatcher.21', 'Dispatcher 21', NULL, NULL, 'user'),
	('cbee2dd0-6f00-4673-9269-d12ba921e385', '2025-01-26 23:02:39.000517+00', 'dispatcher.22', 'Dispatcher 22', NULL, NULL, 'user'),
	('8be98b01-f612-4b57-807e-ce346d5e5002', '2025-01-26 23:02:39.000517+00', 'dispatcher.23', 'Dispatcher 23', NULL, NULL, 'user'),
	('5555999f-23b4-4f07-a621-7aa6b8993742', '2025-01-26 23:02:39.000517+00', 'dispatcher.24', 'Dispatcher 24', NULL, NULL, 'user'),
	('3f5eea44-cc8f-4871-9e8a-b98915ff17d6', '2025-01-26 23:02:39.000517+00', 'dispatcher.25', 'Dispatcher 25', NULL, NULL, 'user'),
	('a28ed60e-fde5-451f-bdd8-23d9a30653e4', '2025-01-26 23:02:39.000517+00', 'dispatcher.26', 'Dispatcher 26', NULL, NULL, 'user'),
	('b899a9d1-0ebd-4ea5-85e7-a01776fa1a2a', '2025-01-26 23:02:39.000517+00', 'dispatcher.27', 'Dispatcher 27', NULL, NULL, 'user'),
	('2120e2e7-b818-44f0-addb-16624f687986', '2025-01-26 23:02:39.000517+00', 'dispatcher.28', 'Dispatcher 28', NULL, NULL, 'user'),
	('a7f2a27b-c54c-4712-a157-3d6cd4c374f6', '2025-01-26 23:02:39.000517+00', 'dispatcher.29', 'Dispatcher 29', NULL, NULL, 'user'),
	('8d121956-4177-4391-88bd-ca311494e422', '2025-01-26 23:02:39.000517+00', 'dispatcher.30', 'Dispatcher 30', NULL, NULL, 'user'),
	('46ae2d59-6917-4cc6-af18-bc64f4e3dc54', '2025-01-26 23:02:39.000517+00', 'dispatcher.31', 'Dispatcher 31', NULL, NULL, 'user'),
	('f41f1123-97b3-455b-a008-0d97aaee549d', '2025-01-26 23:02:39.000517+00', 'dispatcher.32', 'Dispatcher 32', NULL, NULL, 'user'),
	('b83a9d47-38bd-4f75-a998-023fc57a2b61', '2025-01-26 23:02:39.000517+00', 'dispatcher.33', 'Dispatcher 33', NULL, NULL, 'user'),
	('15784d00-9805-4455-bb65-49924de4f395', '2025-01-26 23:02:39.000517+00', 'dispatcher.34', 'Dispatcher 34', NULL, NULL, 'user'),
	('671fe4eb-7c98-4e20-8c45-b9f518089d60', '2025-01-26 23:02:39.000517+00', 'dispatcher.35', 'Dispatcher 35', NULL, NULL, 'user');


--
-- Data for Name: shift_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shift_types" ("id", "name", "description", "created_at", "updated_at") VALUES
	('a0bb0dda-bc73-4126-ac66-5d331f0fac27', 'Day Shift Early', 'Early morning shift starting at 5 AM', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', 'Day Shift', 'Standard day shift starting at 9 AM', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c2dd2ffc-de95-6348-ce88-7f553f2fce49', 'Swing Shift', 'Afternoon to evening shift', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('d3ee3ffd-ef06-7459-df99-8f664f3fdf50', 'Night Shift', 'Overnight shift', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."employees" ("id", "employee_role", "user_role", "weekly_hours_scheduled", "default_shift_type_id", "created_at", "updated_at") VALUES
	('88e36666-a465-4865-983b-bf11533d308d', 'Management', 'Manager', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('58e6399e-e881-4b03-8946-2cb7f2ea32dd', 'Management', 'Manager', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('ea3ffafe-f9a4-4374-bf2a-731acd5e476e', 'Management', 'Manager', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b21fc993-ffe8-47e3-9b54-729affa5907d', 'Management', 'Manager', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('f3d38766-63e9-4d68-ba89-1a751ece2ed8', 'Management', 'Manager', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('8305ddc4-7ffe-44cd-b0b2-6e416414313c', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('db7901ec-5f52-4d15-8594-a108a411b2ff', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('06a6b20d-7e34-43f4-b157-95a61334ecd5', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a90bb78a-fe75-4ec9-8b95-4c1c044237ba', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('15de29ce-373d-48e6-9925-be7a57f2f38b', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('2cfb3560-0668-46b1-8671-32d8961d1d9e', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('9658f65a-64a7-4538-b80c-64c4198a4517', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b96d2078-3af7-4bab-b112-8b0e0892e33f', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('228f8208-3c80-446e-8fc2-4d229df85030', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('f15d591a-6bbe-407e-a295-d288a26141b1', 'Shift Supervisor', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('ba2eb797-a295-4373-95ee-c22eeef99efd', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('df238850-9d79-4716-8863-38f99f1caa02', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('38f5416a-e72c-47e8-92d5-37022274dac1', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c504a092-4883-4b9f-b270-a7259ccb0980', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('51643b51-9603-4151-bbae-1c44037773ba', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('11a0b8cd-0c43-46c3-881a-de863307e028', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4f2c808e-133d-4347-8b23-7bbf93ce4076', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4210a367-8419-4f94-960b-62f5ed88987b', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4122eb97-61e1-4a6f-b881-0ed17be5afaa', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e9496599-2f81-47d6-b25c-022f35415e88', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1930302a-ef3a-41e4-aef3-ec2df1a5ca56', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('86be5b58-c870-4caf-b2f6-e02792299b3f', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b4407d9b-b746-4574-bbf6-c45ce91c0957', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('2a3f190c-1444-4d66-994a-1ef37afcdf40', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1ec91bbc-c74e-4f25-ac5d-4906e72ebf62', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('3af5c418-417b-4876-94fb-cd293c48d028', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('18ac8eca-1087-4674-99e0-96835e8c4c56', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('7c9ff09b-e811-425f-a13f-7056d96c175f', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1a1e42ef-8d31-4965-9114-46179164615b', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4d448dc3-9fa9-46bd-acde-2ffbfebc128d', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('39ff2b08-d0e2-4dd6-9052-a5ba40e9c22b', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('cbee2dd0-6f00-4673-9269-d12ba921e385', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('8be98b01-f612-4b57-807e-ce346d5e5002', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('5555999f-23b4-4f07-a621-7aa6b8993742', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('3f5eea44-cc8f-4871-9e8a-b98915ff17d6', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a28ed60e-fde5-451f-bdd8-23d9a30653e4', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b899a9d1-0ebd-4ea5-85e7-a01776fa1a2a', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('2120e2e7-b818-44f0-addb-16624f687986', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a7f2a27b-c54c-4712-a157-3d6cd4c374f6', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('8d121956-4177-4391-88bd-ca311494e422', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('46ae2d59-6917-4cc6-af18-bc64f4e3dc54', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('f41f1123-97b3-455b-a008-0d97aaee549d', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b83a9d47-38bd-4f75-a998-023fc57a2b61', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('15784d00-9805-4455-bb65-49924de4f395', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('671fe4eb-7c98-4e20-8c45-b9f518089d60', 'Dispatcher', 'Employee', 40, NULL, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: shift_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shift_patterns" ("id", "name", "pattern_type", "days_on", "days_off", "shift_duration", "created_at", "updated_at") VALUES
	('27bf724a-3b12-498c-a4a7-dc9b23019eb7', '4x10 Standard', '4x10', 4, 3, 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c12a0d05-a2ee-400b-836d-05fa4814afa7', '3x12 + 1x4', '3x12_1x4', 4, 3, 12, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('fe504954-8306-4d00-b780-d96522a2fb86', 'Custom Pattern', 'Custom', 4, 3, 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: employee_patterns; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."employee_patterns" ("id", "employee_id", "pattern_id", "start_date", "end_date", "rotation_start_date", "created_at", "updated_at") VALUES
	('53ed5765-f7f0-4799-8693-63173c7fa748', '8305ddc4-7ffe-44cd-b0b2-6e416414313c', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e22d9637-c9fb-4127-b8c1-8258112ecab8', 'db7901ec-5f52-4d15-8594-a108a411b2ff', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('8b28f69d-f63f-42cb-8b5a-eef6351dd16e', '06a6b20d-7e34-43f4-b157-95a61334ecd5', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e50269c4-afab-4514-81b4-1eaba8ae7a59', 'a90bb78a-fe75-4ec9-8b95-4c1c044237ba', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('7eb99b9e-4630-4f9f-a0e2-7e8e2250af7e', '15de29ce-373d-48e6-9925-be7a57f2f38b', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b4f4e865-8eca-4978-b38d-de9ec275c825', '2cfb3560-0668-46b1-8671-32d8961d1d9e', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('fd7e2b21-45a0-4ce3-a478-5c30f901e6cb', '9658f65a-64a7-4538-b80c-64c4198a4517', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('dd02aa1f-7049-4823-b209-018efc0f1509', 'b96d2078-3af7-4bab-b112-8b0e0892e33f', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('6dabe711-7509-4d0d-9175-4dee0e224032', '228f8208-3c80-446e-8fc2-4d229df85030', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a74be15f-6fb2-4509-a7a1-33c2f6db1c8a', 'f15d591a-6bbe-407e-a295-d288a26141b1', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('9d4e6fd2-3e4f-43d6-ae8e-b1a17729ee30', 'ba2eb797-a295-4373-95ee-c22eeef99efd', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b8357aea-427e-4200-8478-19ba4e949987', 'df238850-9d79-4716-8863-38f99f1caa02', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('eaa350df-03f1-4cb6-ac94-9438799b2c73', '38f5416a-e72c-47e8-92d5-37022274dac1', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('d1e4a105-f6c6-4e8b-9818-8a7df71eed57', 'c504a092-4883-4b9f-b270-a7259ccb0980', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a3cee2cd-2a86-45cf-8d22-5cc61695fdf6', '51643b51-9603-4151-bbae-1c44037773ba', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('80a505f1-fec5-4909-8427-78a8c3f4036a', '11a0b8cd-0c43-46c3-881a-de863307e028', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4e4c0068-2ae8-49e6-b801-03acd9a1763f', '4f2c808e-133d-4347-8b23-7bbf93ce4076', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('642e687c-6298-4ebb-9454-bc5345bbdc10', '4210a367-8419-4f94-960b-62f5ed88987b', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('d7e1ac42-6de7-4081-930d-81692b74d8b8', '4122eb97-61e1-4a6f-b881-0ed17be5afaa', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1719dbab-53e1-49b2-83c7-8d65be7899a0', 'e9496599-2f81-47d6-b25c-022f35415e88', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('30f9b708-77b9-4994-b8ae-407cfb700f93', '1930302a-ef3a-41e4-aef3-ec2df1a5ca56', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e62b0f0c-95b0-4081-b796-41703654ff7f', '86be5b58-c870-4caf-b2f6-e02792299b3f', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('44a321b9-5b3c-4a66-a76b-c50bd0529fdf', 'b4407d9b-b746-4574-bbf6-c45ce91c0957', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('bb50e556-fb37-4f6a-a866-3e4f42f56b32', '2a3f190c-1444-4d66-994a-1ef37afcdf40', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e56ca9e1-7926-4265-a0ef-b72a311d0ca0', '1ec91bbc-c74e-4f25-ac5d-4906e72ebf62', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('2bd921e2-2276-42bd-928f-cce7e5286f43', '3af5c418-417b-4876-94fb-cd293c48d028', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('68a62ce0-d916-4a12-a08a-40ceae7e2b3c', '18ac8eca-1087-4674-99e0-96835e8c4c56', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('39bcf38e-33a3-473e-9b0a-20930fe13c98', '7c9ff09b-e811-425f-a13f-7056d96c175f', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('4f6c5a33-14dd-4b3c-bfc6-f55d0423a31f', '1a1e42ef-8d31-4965-9114-46179164615b', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('521b2d50-3dca-4568-b10a-06a96ef9be2a', '4d448dc3-9fa9-46bd-acde-2ffbfebc128d', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('07c58e5e-602b-403b-a8b3-0cddc82d1f02', '39ff2b08-d0e2-4dd6-9052-a5ba40e9c22b', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('e71ad3b6-a123-421e-9e60-b389dd635a96', 'cbee2dd0-6f00-4673-9269-d12ba921e385', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c5294b4d-8f8f-4013-9987-4589865056a4', '8be98b01-f612-4b57-807e-ce346d5e5002', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b4015727-0897-4a5d-b173-154c71fc5735', '5555999f-23b4-4f07-a621-7aa6b8993742', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('d4baa64e-cdd0-43b0-aeed-80c9f9daf680', '3f5eea44-cc8f-4871-9e8a-b98915ff17d6', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('21884469-f66e-4f90-a87d-e36cee8635ff', 'a28ed60e-fde5-451f-bdd8-23d9a30653e4', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('12f72dbf-043d-47cd-8c95-3ac553cbd7a4', 'b899a9d1-0ebd-4ea5-85e7-a01776fa1a2a', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('0514547f-bfa3-46df-a58e-a27efab92d01', '2120e2e7-b818-44f0-addb-16624f687986', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a487788b-5d75-4c63-9bd4-fcd21b17e1a4', 'a7f2a27b-c54c-4712-a157-3d6cd4c374f6', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('65887771-57b0-49da-aa31-6e778fd2f4ab', '8d121956-4177-4391-88bd-ca311494e422', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('3a8f8c92-b431-474f-b68a-797c3e58aa58', '46ae2d59-6917-4cc6-af18-bc64f4e3dc54', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('496f9a02-547c-4a18-8087-ea0e7e9416d4', 'f41f1123-97b3-455b-a008-0d97aaee549d', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('049e961f-67b3-4450-852c-13e4f5980a42', 'b83a9d47-38bd-4f75-a998-023fc57a2b61', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('591a0c12-4c1b-43a4-9699-d257514cca5b', '15784d00-9805-4455-bb65-49924de4f395', '27bf724a-3b12-498c-a4a7-dc9b23019eb7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1e6d0f01-d4da-44f9-987a-a9022c5dbf38', '671fe4eb-7c98-4e20-8c45-b9f518089d60', 'c12a0d05-a2ee-400b-836d-05fa4814afa7', '2024-01-01', NULL, '2024-01-01', '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shifts" ("id", "shift_type_id", "start_time", "end_time", "duration_hours", "created_at", "updated_at") VALUES
	('f7f78d5b-826d-4aa7-8583-0bc0b5015199', 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00:00', '09:00:00', 4, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c9fd30df-1628-4830-8790-d52bc9edbd9f', 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00:00', '15:00:00', 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('150b19ac-f75f-4c9a-baca-5138dbd1d2d4', 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '05:00:00', '17:00:00', 12, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('5c165f59-9f83-4b7d-a43e-0d04f2d3a742', 'b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00:00', '13:00:00', 4, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c78d72b1-bec5-4306-a7ae-4f081be873f9', 'b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00:00', '19:00:00', 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('a19ccef9-d06c-4b95-8405-0606ec2f0828', 'b1cc1eeb-cd84-5237-bd77-6e442f1fbd38', '09:00:00', '21:00:00', 12, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('fd018eb6-e18b-48f7-a9ce-95aabe0fc0d0', 'c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00:00', '17:00:00', 4, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('84b87160-477c-4f0d-b411-6c4683ebf9b0', 'c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00:00', '23:00:00', 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('da74c3d6-4caf-4b13-a306-5da5ea56d15b', 'c2dd2ffc-de95-6348-ce88-7f553f2fce49', '13:00:00', '01:00:00', 12, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('c150d82c-dc2d-48f3-866d-569b7712204f', 'd3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00:00', '01:00:00', 4, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('1db91c74-4034-4cf5-bd12-86b81607ec2b', 'd3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00:00', '07:00:00', 10, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00'),
	('b6e8de79-d850-4117-a219-1a200117a130', 'd3ee3ffd-ef06-7459-df99-8f664f3fdf50', '21:00:00', '09:00:00', 12, '2025-01-26 23:02:39.000517+00', '2025-01-26 23:02:39.000517+00');


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: time_off_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: postgres
--



--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: postgres
--



--
-- Data for Name: s3_multipart_uploads; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: s3_multipart_uploads_parts; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--



--
-- Data for Name: secrets; Type: TABLE DATA; Schema: vault; Owner: supabase_admin
--



--
-- Name: refresh_tokens_id_seq; Type: SEQUENCE SET; Schema: auth; Owner: supabase_auth_admin
--

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 1, false);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
