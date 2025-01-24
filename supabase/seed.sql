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

INSERT INTO "auth"."audit_log_entries" ("instance_id", "id", "payload", "created_at", "ip_address") VALUES
	('00000000-0000-0000-0000-000000000000', 'e73a386f-8732-41cb-bf37-a16688761116', '{"action":"user_signedup","actor_id":"7ebd5064-d7e1-4017-a195-fe1b9e0e6408","actor_username":"adambpeterson@gmail.com","actor_via_sso":false,"log_type":"team","traits":{"provider":"email"}}', '2025-01-23 21:35:28.610774+00', ''),
	('00000000-0000-0000-0000-000000000000', '7183897b-5ca9-4652-be2a-c91225832cb8', '{"action":"login","actor_id":"7ebd5064-d7e1-4017-a195-fe1b9e0e6408","actor_username":"adambpeterson@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-23 21:35:28.615403+00', ''),
	('00000000-0000-0000-0000-000000000000', '0230cfea-7803-4a76-9fcb-a26d70bcbaba', '{"action":"user_deleted","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"adambpeterson@gmail.com","user_id":"7ebd5064-d7e1-4017-a195-fe1b9e0e6408","user_phone":""}}', '2025-01-23 21:36:03.960347+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd965c40d-4fb3-4456-bb92-848f1d37ea67', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joseph.king@dispatch911.test","user_id":"3ae093c6-70cd-45b6-b923-b0546031d67a","user_phone":""}}', '2025-01-23 21:37:26.203901+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e4034a8b-024a-4432-a214-1a02a57391b5', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"donna.jackson@dispatch911.test","user_id":"775196c7-221e-4493-9114-3484912696f1","user_phone":""}}', '2025-01-23 21:37:26.401907+00', ''),
	('00000000-0000-0000-0000-000000000000', '0acd4c6c-940c-4b06-8592-c3373764792e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"amanda.diaz@dispatch911.test","user_id":"26cb1a43-b734-468d-8cd6-6c2e775667e3","user_phone":""}}', '2025-01-23 21:37:26.59386+00', ''),
	('00000000-0000-0000-0000-000000000000', '8ce509ac-04cf-4482-bee8-b5f4888f5f2c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sarah.roberts@dispatch911.test","user_id":"9d8372d5-d14c-427c-9c5e-6c08e1b423af","user_phone":""}}', '2025-01-23 21:37:26.772002+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bea6a8d0-c0ce-42e8-85f0-cfbd477c045c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"timothy.scott@dispatch911.test","user_id":"67530f8a-9313-43bb-aa2b-74cafe72aac2","user_phone":""}}', '2025-01-23 21:37:26.92901+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bb18f524-6b9b-4dbb-bb72-7ccbe96b9b9a', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"paul.robinson@dispatch911.test","user_id":"c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4","user_phone":""}}', '2025-01-23 21:37:27.115575+00', ''),
	('00000000-0000-0000-0000-000000000000', '0e15dc6b-8ca9-4d87-bef4-2cf897e01311', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"dorothy.thomas@dispatch911.test","user_id":"cf645d1e-6820-4ebb-a717-3feeb5610021","user_phone":""}}', '2025-01-23 21:37:27.280724+00', ''),
	('00000000-0000-0000-0000-000000000000', '37ffe5c4-a488-4090-b774-240d9ada4108', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"kenneth.evans@dispatch911.test","user_id":"8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895","user_phone":""}}', '2025-01-23 21:37:27.43224+00', ''),
	('00000000-0000-0000-0000-000000000000', 'f03c85ff-95b6-4bd2-9987-36ccbfb92ca3', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"james.smith@dispatch911.test","user_id":"3df2ab5d-a23e-44bb-878c-d28a63842c9f","user_phone":""}}', '2025-01-23 21:37:27.623845+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e69b5d07-3e74-47c7-88d0-62e5f8b2c4ba', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"edward.green@dispatch911.test","user_id":"cbcba25e-5e17-4fad-a524-f28b9613ca2e","user_phone":""}}', '2025-01-23 21:37:27.776677+00', ''),
	('00000000-0000-0000-0000-000000000000', '580e495f-edc6-4203-a778-d6b2805a4e3c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"elizabeth.davis@dispatch911.test","user_id":"c6560298-d632-439e-ac16-d480875c211d","user_phone":""}}', '2025-01-23 21:37:27.921766+00', ''),
	('00000000-0000-0000-0000-000000000000', '11e1707e-fce4-4828-a4bb-fa31eaf43b11', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"david.phillips@dispatch911.test","user_id":"80fadb13-fec8-4e6c-baa8-24a03907852d","user_phone":""}}', '2025-01-23 21:37:28.097652+00', ''),
	('00000000-0000-0000-0000-000000000000', '47ab7ba7-f78e-4aaf-8b60-9aec699067c9', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"deborah.jones@dispatch911.test","user_id":"550e9af3-e044-49a9-87d6-942cd58bbb39","user_phone":""}}', '2025-01-23 21:37:28.247352+00', ''),
	('00000000-0000-0000-0000-000000000000', 'da508d99-e93c-40e9-bd9b-e378aa72f145', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"william.torres@dispatch911.test","user_id":"74cebaf2-3a4d-4371-8f1d-43a9afb27cd0","user_phone":""}}', '2025-01-23 21:37:28.450703+00', ''),
	('00000000-0000-0000-0000-000000000000', '70c83108-5570-4e4d-be91-1cfa470369f8', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"lisa.nelson@dispatch911.test","user_id":"44d108fe-1a71-4e6a-bb6d-4b21978a9637","user_phone":""}}', '2025-01-23 21:37:28.60574+00', ''),
	('00000000-0000-0000-0000-000000000000', '657c3f65-b5d8-4973-a117-39f8dc684bce', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"michael.hall@dispatch911.test","user_id":"12500126-382b-4247-b598-8dea9be1e3b4","user_phone":""}}', '2025-01-23 21:37:28.762476+00', ''),
	('00000000-0000-0000-0000-000000000000', '1ed68a0e-9694-4a79-9537-919cb5daf464', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sharon.ramirez@dispatch911.test","user_id":"237aee4c-77dd-45db-8592-7ddac4bb63f8","user_phone":""}}', '2025-01-23 21:37:28.908182+00', ''),
	('00000000-0000-0000-0000-000000000000', '28e357f6-2e75-402e-85d8-e9d7960f15d4', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"susan.rivera@dispatch911.test","user_id":"b6ca461a-506d-45f0-954b-9ba0746c8ea5","user_phone":""}}', '2025-01-23 21:37:29.082496+00', ''),
	('00000000-0000-0000-0000-000000000000', '8826cc6b-afea-4e90-a6d5-d135e89e179c', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"matthew.turner@dispatch911.test","user_id":"96cba30b-41c9-4b34-85e6-dbf682902d0a","user_phone":""}}', '2025-01-23 21:37:29.238644+00', ''),
	('00000000-0000-0000-0000-000000000000', '254db751-17ef-45a9-8b2d-91e284088f8e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"thomas.gomez@dispatch911.test","user_id":"bc91fbeb-acc6-4100-9e05-da662ebbdff7","user_phone":""}}', '2025-01-23 21:37:29.387225+00', ''),
	('00000000-0000-0000-0000-000000000000', '85592c98-29d9-4c8b-afe0-2752968abf40', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"carol.harris@dispatch911.test","user_id":"790ba4d6-8326-47f2-92c2-ff666a3a8575","user_phone":""}}', '2025-01-23 21:37:29.550851+00', ''),
	('00000000-0000-0000-0000-000000000000', '4a984477-6cad-4e21-adba-1618e47b350b', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"rebecca.allen@dispatch911.test","user_id":"0b45d8fb-8218-481a-b9eb-725726617ebd","user_phone":""}}', '2025-01-23 21:37:29.736814+00', ''),
	('00000000-0000-0000-0000-000000000000', '00ee2412-c9bf-44ee-bc2a-9038ea04d787', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"emily.martinez@dispatch911.test","user_id":"cea4b801-55f9-40fc-bc53-64c529eafc13","user_phone":""}}', '2025-01-23 21:37:29.894461+00', ''),
	('00000000-0000-0000-0000-000000000000', '92a064ac-1856-48c0-8af5-5ed18de7b11e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"john.perez@dispatch911.test","user_id":"c7567c74-d25a-47a8-88a5-4a901b4ae27b","user_phone":""}}', '2025-01-23 21:37:30.052467+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd976c7f6-e9ab-4aa7-9d1d-e01c423091e6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"anthony.nguyen@dispatch911.test","user_id":"16994703-c64b-4fd6-8cc3-635be73d6965","user_phone":""}}', '2025-01-23 21:37:30.201362+00', ''),
	('00000000-0000-0000-0000-000000000000', '60335001-df23-420c-97c6-711f0a852755', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"george.rodriguez@dispatch911.test","user_id":"b62e51ba-0b92-47d2-abdc-c01b138740ab","user_phone":""}}', '2025-01-23 21:37:30.388271+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b50d6312-8f62-45bc-84e4-e82aa95aa8bc', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"andrew.thompson@dispatch911.test","user_id":"3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0","user_phone":""}}', '2025-01-23 21:37:30.553316+00', ''),
	('00000000-0000-0000-0000-000000000000', 'c2c8fd5e-ff76-44e8-9409-d53a2aa29f19', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"linda.walker@dispatch911.test","user_id":"ff5ade2d-b38e-4ca5-af1a-7499cbd6d927","user_phone":""}}', '2025-01-23 21:37:30.729015+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ce97ccb1-3800-4c27-a290-9c77c8138564', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"brian.miller@dispatch911.test","user_id":"3d721bc7-8ff4-40db-b3a2-7e25a66687fb","user_phone":""}}', '2025-01-23 21:37:30.891081+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e8811594-192a-4348-9aa7-2afe1b5e1566', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"margaret.white@dispatch911.test","user_id":"09890293-ba41-4217-b7fa-b01211a411e6","user_phone":""}}', '2025-01-23 21:37:31.073876+00', ''),
	('00000000-0000-0000-0000-000000000000', '7849cf94-81e8-49be-9cd0-39fc3d3e22e4', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"barbara.lopez@dispatch911.test","user_id":"4bfe7200-8a91-4de0-a2c6-2d24720957db","user_phone":""}}', '2025-01-23 21:37:31.223513+00', ''),
	('00000000-0000-0000-0000-000000000000', 'bd04d66c-78c0-4a9e-8c5c-43a48e61d44e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"jennifer.mitchell@dispatch911.test","user_id":"c7af35f6-8dd7-40c8-a2a3-ed85ad328652","user_phone":""}}', '2025-01-23 21:37:31.370394+00', ''),
	('00000000-0000-0000-0000-000000000000', '67de1fea-ee97-4ede-a35b-ede9a3848e96', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"michelle.lee@dispatch911.test","user_id":"4de8ad00-b770-43d3-adee-6bdb8439c0ab","user_phone":""}}', '2025-01-23 21:37:31.535672+00', ''),
	('00000000-0000-0000-0000-000000000000', '9b96c6ff-651f-4251-aaca-527dd6e45930', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"karen.clark@dispatch911.test","user_id":"7bd029c6-0e12-43ca-9075-77fc7105c6ad","user_phone":""}}', '2025-01-23 21:37:31.693778+00', ''),
	('00000000-0000-0000-0000-000000000000', 'a89b7343-d976-4b54-ba44-a48e94456f32', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mark.johnson@dispatch911.test","user_id":"4a211ea0-1e34-42b9-9ed0-341b3bc6beff","user_phone":""}}', '2025-01-23 21:37:31.859153+00', ''),
	('00000000-0000-0000-0000-000000000000', '3cec7714-048b-45a6-ae2e-045280f4e7ef', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"charles.young@dispatch911.test","user_id":"45b1ed80-37d5-4467-910e-f713ee1384cb","user_phone":""}}', '2025-01-23 21:37:32.008122+00', ''),
	('00000000-0000-0000-0000-000000000000', '3bf41737-77f8-4688-9d12-8f64c0e47003', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"kevin.garcia@dispatch911.test","user_id":"62ea7b0e-9db1-47a5-9e55-4d311293bcac","user_phone":""}}', '2025-01-23 21:37:32.161183+00', ''),
	('00000000-0000-0000-0000-000000000000', '33f7d38e-b6fa-4f76-84f5-e209ab784952', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"sandra.wilson@dispatch911.test","user_id":"13edf723-2892-4122-9aca-0d961de78077","user_phone":""}}', '2025-01-23 21:37:32.311899+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a501f88-f136-428f-adaa-44dc0e20801e', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"stephanie.moore@dispatch911.test","user_id":"69ffce4c-f6ee-49ac-87c5-bc6f59f771ca","user_phone":""}}', '2025-01-23 21:37:32.483403+00', ''),
	('00000000-0000-0000-0000-000000000000', 'e5ac362d-523a-406c-8905-6fcbd23b4884', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"ronald.williams@dispatch911.test","user_id":"3e90610b-6f4a-43c9-a73a-1f71ef5c6b74","user_phone":""}}', '2025-01-23 21:37:32.645034+00', ''),
	('00000000-0000-0000-0000-000000000000', '7ac2f7ec-74bb-4319-a586-f301f3619188', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"daniel.taylor@dispatch911.test","user_id":"f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec","user_phone":""}}', '2025-01-23 21:37:32.79046+00', ''),
	('00000000-0000-0000-0000-000000000000', '9882ed4b-98d6-4425-8c42-d1f64ab07219', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"richard.martin@dispatch911.test","user_id":"5c0ed845-d52c-4d25-8486-ed017b6f60a1","user_phone":""}}', '2025-01-23 21:37:32.940786+00', ''),
	('00000000-0000-0000-0000-000000000000', '9a701dad-d9da-44dd-ab24-4edbefa71744', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"betty.baker@dispatch911.test","user_id":"5c52a054-3d67-48c3-9fa9-1d89f59cc763","user_phone":""}}', '2025-01-23 21:37:33.128654+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ab36b225-df8b-4958-94d5-577bc8478276', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"robert.adams@dispatch911.test","user_id":"99a22969-6322-4abd-a341-9b9da475717a","user_phone":""}}', '2025-01-23 21:37:33.281768+00', ''),
	('00000000-0000-0000-0000-000000000000', 'd2806baf-6d93-487c-8ab3-7cd331783b60', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"melissa.hill@dispatch911.test","user_id":"354d2bb4-1745-4780-8ad0-f2a59bd5c1e0","user_phone":""}}', '2025-01-23 21:37:33.43832+00', ''),
	('00000000-0000-0000-0000-000000000000', 'ea914b5d-ee60-473d-9e4c-6229182ea1de', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"joshua.flores@dispatch911.test","user_id":"2e88a784-d5b1-4ef4-ac96-dcfab869849f","user_phone":""}}', '2025-01-23 21:37:33.597345+00', ''),
	('00000000-0000-0000-0000-000000000000', '5b7be6cb-3f33-4228-8d4b-d0bd536057e0', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"patricia.parker@dispatch911.test","user_id":"c5857e55-9b30-43bb-9c79-1d5e07f99189","user_phone":""}}', '2025-01-23 21:37:33.750245+00', ''),
	('00000000-0000-0000-0000-000000000000', 'b7fc479d-3436-4e28-afbb-d23f48686874', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"mary.sanchez@dispatch911.test","user_id":"864e5816-b415-489d-87cc-c4dd3a37d34b","user_phone":""}}', '2025-01-23 21:37:33.98623+00', ''),
	('00000000-0000-0000-0000-000000000000', '95bdce3e-9d7a-4177-b502-cee0f6afc5cd', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"kimberly.wright@dispatch911.test","user_id":"c2297db5-9b39-440a-b545-38e2c036ee7c","user_phone":""}}', '2025-01-23 21:37:34.152571+00', ''),
	('00000000-0000-0000-0000-000000000000', '792fc91f-5adf-4137-b39e-73634d0bd6c6', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"nancy.brown@dispatch911.test","user_id":"ab0414a0-8107-4b5b-87d2-ec283d9b9650","user_phone":""}}', '2025-01-23 21:37:34.303381+00', ''),
	('00000000-0000-0000-0000-000000000000', '2c5ca4cb-779b-4335-b9ca-3f6f58853f33', '{"action":"user_signedup","actor_id":"00000000-0000-0000-0000-000000000000","actor_username":"service_role","actor_via_sso":false,"log_type":"team","traits":{"user_email":"adambpeterson@gmail.com","user_id":"ace54a5c-0347-4b22-8e3d-63216ad59460","user_phone":""}}', '2025-01-23 21:38:08.342316+00', ''),
	('00000000-0000-0000-0000-000000000000', 'daab2bd1-3660-41d7-a979-b709098e801a', '{"action":"login","actor_id":"ace54a5c-0347-4b22-8e3d-63216ad59460","actor_username":"adambpeterson@gmail.com","actor_via_sso":false,"log_type":"account","traits":{"provider":"email"}}', '2025-01-23 21:39:17.568853+00', '');


--
-- Data for Name: flow_state; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: users; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."users" ("instance_id", "id", "aud", "role", "email", "encrypted_password", "email_confirmed_at", "invited_at", "confirmation_token", "confirmation_sent_at", "recovery_token", "recovery_sent_at", "email_change_token_new", "email_change", "email_change_sent_at", "last_sign_in_at", "raw_app_meta_data", "raw_user_meta_data", "is_super_admin", "created_at", "updated_at", "phone", "phone_confirmed_at", "phone_change", "phone_change_token", "phone_change_sent_at", "email_change_token_current", "email_change_confirm_status", "banned_until", "reauthentication_token", "reauthentication_sent_at", "is_sso_user", "deleted_at", "is_anonymous") VALUES
	('00000000-0000-0000-0000-000000000000', '3df2ab5d-a23e-44bb-878c-d28a63842c9f', 'authenticated', 'authenticated', 'james.smith@dispatch911.test', '$2a$10$nWBjKzXFfeI8MbUN1QjFd.IKTS7OooF.rKPtdQ5jT8zsGLlQZCXE2', '2025-01-23 21:37:27.6256+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "jamessmith", "full_name": "James Smith", "user_role": "Manager", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.621865+00', '2025-01-23 21:37:27.626215+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '26cb1a43-b734-468d-8cd6-6c2e775667e3', 'authenticated', 'authenticated', 'amanda.diaz@dispatch911.test', '$2a$10$.p7ku/gJ/wcAR9mSt7h26.t50DRZXloVU7goAOv5wI3c7E4MCWJ4C', '2025-01-23 21:37:26.594726+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "amandadiaz", "full_name": "Amanda Diaz", "user_role": "Employee", "employee_role": "Management", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:26.591443+00', '2025-01-23 21:37:26.595492+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4', 'authenticated', 'authenticated', 'paul.robinson@dispatch911.test', '$2a$10$b.3byFUHpi2SZUQKVdadAuWc5z8FN44Cr10V4.JqHpIaLe1LR9lrC', '2025-01-23 21:37:27.116586+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "paulrobinson", "full_name": "Paul Robinson", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.112519+00', '2025-01-23 21:37:27.117248+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '9d8372d5-d14c-427c-9c5e-6c08e1b423af', 'authenticated', 'authenticated', 'sarah.roberts@dispatch911.test', '$2a$10$5jlMTYpigEIt/DtIQkM7BuB/WhGTwBK.XDKBbjvHCtq/GZnGkBFCO', '2025-01-23 21:37:26.773071+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "sarahroberts", "full_name": "Sarah Roberts", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:26.768214+00', '2025-01-23 21:37:26.77375+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3ae093c6-70cd-45b6-b923-b0546031d67a', 'authenticated', 'authenticated', 'joseph.king@dispatch911.test', '$2a$10$E4nsGVzyXDoHV3WVgBZnJu8WmoKKlB1bWQvoYm4zPglugur0oxmgO', '2025-01-23 21:37:26.205436+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "josephking", "full_name": "Joseph King", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:26.196323+00', '2025-01-23 21:37:26.206319+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895', 'authenticated', 'authenticated', 'kenneth.evans@dispatch911.test', '$2a$10$PaOEI5SQuD9iCuxt0ngNwOVWIqoP7oYn404U6dWLpYag9hMxui2ge', '2025-01-23 21:37:27.43316+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "kennethevans", "full_name": "Kenneth Evans", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.430179+00', '2025-01-23 21:37:27.433761+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '67530f8a-9313-43bb-aa2b-74cafe72aac2', 'authenticated', 'authenticated', 'timothy.scott@dispatch911.test', '$2a$10$xS3TxXhf3FjUchHZCwBp/OW7lM//HIszqVGjI3PqODgxCMX6J1wKC', '2025-01-23 21:37:26.930064+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "timothyscott", "full_name": "Timothy Scott", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:26.926683+00', '2025-01-23 21:37:26.930752+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '775196c7-221e-4493-9114-3484912696f1', 'authenticated', 'authenticated', 'donna.jackson@dispatch911.test', '$2a$10$hkR1N2BEC5MZ3.i4x.HXkO4jT8mcYCAM2emU47GkVAp0ZmiXkx3g2', '2025-01-23 21:37:26.403607+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "donnajackson", "full_name": "Donna Jackson", "user_role": "Admin", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:26.399439+00', '2025-01-23 21:37:26.404272+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cf645d1e-6820-4ebb-a717-3feeb5610021', 'authenticated', 'authenticated', 'dorothy.thomas@dispatch911.test', '$2a$10$swnpTZJCzCsVhv0P0OP6rO5QVVG42byb.6SDtU468P/M9Gfa3gUGq', '2025-01-23 21:37:27.281654+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "dorothythomas", "full_name": "Dorothy Thomas", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.278749+00', '2025-01-23 21:37:27.282267+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cbcba25e-5e17-4fad-a524-f28b9613ca2e', 'authenticated', 'authenticated', 'edward.green@dispatch911.test', '$2a$10$7w9sjL2Ab4rLDbTR.F189eZZGbem.zDddYZ4LNXY72UtaRkHhI0GO', '2025-01-23 21:37:27.777521+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "edwardgreen", "full_name": "Edward Green", "user_role": "Manager", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.774724+00', '2025-01-23 21:37:27.77812+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c6560298-d632-439e-ac16-d480875c211d', 'authenticated', 'authenticated', 'elizabeth.davis@dispatch911.test', '$2a$10$pKV3DD8NmrOJuMAwTB8oweROew04sFuzM8hd8hbMVW/ynG2Z9Ao72', '2025-01-23 21:37:27.922612+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "elizabethdavis", "full_name": "Elizabeth Davis", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:27.91885+00', '2025-01-23 21:37:27.923246+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '237aee4c-77dd-45db-8592-7ddac4bb63f8', 'authenticated', 'authenticated', 'sharon.ramirez@dispatch911.test', '$2a$10$HN6ty7aElILY/9iFON5XCO8wh5icYylfG6U97JFezj36SFFWrp89W', '2025-01-23 21:37:28.909075+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "sharonramirez", "full_name": "Sharon Ramirez", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.90629+00', '2025-01-23 21:37:28.909694+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '44d108fe-1a71-4e6a-bb6d-4b21978a9637', 'authenticated', 'authenticated', 'lisa.nelson@dispatch911.test', '$2a$10$4x7jGr43BbtUmKRkfY3MmugtFGfd4Dec6x5ntSQPqssYm.KZBjbnu', '2025-01-23 21:37:28.606656+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "lisanelson", "full_name": "Lisa Nelson", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.603719+00', '2025-01-23 21:37:28.607262+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '80fadb13-fec8-4e6c-baa8-24a03907852d', 'authenticated', 'authenticated', 'david.phillips@dispatch911.test', '$2a$10$8laJmCMFv5pRISRuVmE1huCbPNyl6x0MXRRAE.vT3ecxmv2j.2mg.', '2025-01-23 21:37:28.098562+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "davidphillips", "full_name": "David Phillips", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.095482+00', '2025-01-23 21:37:28.099875+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '550e9af3-e044-49a9-87d6-942cd58bbb39', 'authenticated', 'authenticated', 'deborah.jones@dispatch911.test', '$2a$10$3pABgsUF0o8SsljesIHz7.6N4FI6q68REvYFKgWqYR7ixNhoQ4Qym', '2025-01-23 21:37:28.248317+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "deborahjones", "full_name": "Deborah Jones", "user_role": "Employee", "employee_role": "Management", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.244844+00', '2025-01-23 21:37:28.248936+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'bc91fbeb-acc6-4100-9e05-da662ebbdff7', 'authenticated', 'authenticated', 'thomas.gomez@dispatch911.test', '$2a$10$IBENRkbhfZUTTUg3m47NlepqJwMHwgUY4s32wC493kvIe0a7HsEbW', '2025-01-23 21:37:29.388104+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "thomasgomez", "full_name": "Thomas Gomez", "user_role": "Employee", "employee_role": "Management", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.385399+00', '2025-01-23 21:37:29.388706+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '12500126-382b-4247-b598-8dea9be1e3b4', 'authenticated', 'authenticated', 'michael.hall@dispatch911.test', '$2a$10$d/84BhaNlq1cR5faFDKsweuFNBIuRg8ES2lFMdJQXmB.XXt1iMi4C', '2025-01-23 21:37:28.764095+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "michaelhall", "full_name": "Michael Hall", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.760535+00', '2025-01-23 21:37:28.764792+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '74cebaf2-3a4d-4371-8f1d-43a9afb27cd0', 'authenticated', 'authenticated', 'william.torres@dispatch911.test', '$2a$10$4he/46pmI.ix/7UjcriHZe1G04w.ON2OHXRHA1LP6G6rHMYqt7U9K', '2025-01-23 21:37:28.4516+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "williamtorres", "full_name": "William Torres", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:28.448749+00', '2025-01-23 21:37:28.452265+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '96cba30b-41c9-4b34-85e6-dbf682902d0a', 'authenticated', 'authenticated', 'matthew.turner@dispatch911.test', '$2a$10$Xb1t23AjvajWDW8lWrFsxe1wRFP2wes7xZcgTDgNuCVjrMCns/67O', '2025-01-23 21:37:29.239523+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "matthewturner", "full_name": "Matthew Turner", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.236802+00', '2025-01-23 21:37:29.240179+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b6ca461a-506d-45f0-954b-9ba0746c8ea5', 'authenticated', 'authenticated', 'susan.rivera@dispatch911.test', '$2a$10$2tMqSX2L9ed0vKzGbc5.JuurFcfOW6aRbo843Vqc/2D516aMavqpK', '2025-01-23 21:37:29.083445+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "susanrivera", "full_name": "Susan Rivera", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.079655+00', '2025-01-23 21:37:29.084058+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '790ba4d6-8326-47f2-92c2-ff666a3a8575', 'authenticated', 'authenticated', 'carol.harris@dispatch911.test', '$2a$10$2RRlFQTn1T6aeCOEYfLegOAxJ0ERoPHopywg5/p4WkJWWHPyLm0xq', '2025-01-23 21:37:29.553947+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "carolharris", "full_name": "Carol Harris", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.54895+00', '2025-01-23 21:37:29.554571+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '0b45d8fb-8218-481a-b9eb-725726617ebd', 'authenticated', 'authenticated', 'rebecca.allen@dispatch911.test', '$2a$10$eqLJD9Umge51DGFl1qZhg.vHPx94b87lPRU1u0lvTnHpskKBNx.IK', '2025-01-23 21:37:29.737658+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "rebeccaallen", "full_name": "Rebecca Allen", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.734939+00', '2025-01-23 21:37:29.73831+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ff5ade2d-b38e-4ca5-af1a-7499cbd6d927', 'authenticated', 'authenticated', 'linda.walker@dispatch911.test', '$2a$10$mUiTKgc2CsaUBi1MTSJRK.ZKl.xylbl41Qha66YjKvs8k/gHb9alG', '2025-01-23 21:37:30.72996+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "lindawalker", "full_name": "Linda Walker", "user_role": "Admin", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.727109+00', '2025-01-23 21:37:30.730563+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'b62e51ba-0b92-47d2-abdc-c01b138740ab', 'authenticated', 'authenticated', 'george.rodriguez@dispatch911.test', '$2a$10$V8Y2lkrnnoQOOhOSl/TBQuhhbMPLqah.Q7eyX7855/x4DPJEzzgQG', '2025-01-23 21:37:30.389118+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "georgerodriguez", "full_name": "George Rodriguez", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.386269+00', '2025-01-23 21:37:30.3897+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'cea4b801-55f9-40fc-bc53-64c529eafc13', 'authenticated', 'authenticated', 'emily.martinez@dispatch911.test', '$2a$10$O6T725.AlnMOnC.QJ.s6Ge8UU4qY2wbZYo1dFF4lEjR49t4uS5s9S', '2025-01-23 21:37:29.895285+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "emilymartinez", "full_name": "Emily Martinez", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:29.892476+00', '2025-01-23 21:37:29.895878+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c7567c74-d25a-47a8-88a5-4a901b4ae27b', 'authenticated', 'authenticated', 'john.perez@dispatch911.test', '$2a$10$3wUMi91qeFYJ2f0ovRxq/e1979wrTHJUnqp8k5lSAOlcardbzXEjW', '2025-01-23 21:37:30.053274+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "johnperez", "full_name": "John Perez", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.050568+00', '2025-01-23 21:37:30.053852+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4bfe7200-8a91-4de0-a2c6-2d24720957db', 'authenticated', 'authenticated', 'barbara.lopez@dispatch911.test', '$2a$10$9TgKftMTy3ClLVpUCmQxBOene4ZjDL6AvTVOE27xQUzWozsLUr6Du', '2025-01-23 21:37:31.224654+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "barbaralopez", "full_name": "Barbara Lopez", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.221552+00', '2025-01-23 21:37:31.226119+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0', 'authenticated', 'authenticated', 'andrew.thompson@dispatch911.test', '$2a$10$YaADCdYowWstcSwXp3Wwsea7mQPlvcT/b7r3bWnqHOnUCqY5oA1W6', '2025-01-23 21:37:30.554158+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "andrewthompson", "full_name": "Andrew Thompson", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.551371+00', '2025-01-23 21:37:30.554755+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '16994703-c64b-4fd6-8cc3-635be73d6965', 'authenticated', 'authenticated', 'anthony.nguyen@dispatch911.test', '$2a$10$msel6i7bu/8AEg/4ehZtxOWwps161Tgo72NUMk5Z5ZOSTOJBcubZm', '2025-01-23 21:37:30.20221+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "anthonynguyen", "full_name": "Anthony Nguyen", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.199461+00', '2025-01-23 21:37:30.202794+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '09890293-ba41-4217-b7fa-b01211a411e6', 'authenticated', 'authenticated', 'margaret.white@dispatch911.test', '$2a$10$w6ApYZNRat66/IcJRV8TcufhYbTAE3Cd9Y7ZX8VoW/3CADmr8vB2i', '2025-01-23 21:37:31.075552+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "margaretwhite", "full_name": "Margaret White", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.071952+00', '2025-01-23 21:37:31.076154+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3d721bc7-8ff4-40db-b3a2-7e25a66687fb', 'authenticated', 'authenticated', 'brian.miller@dispatch911.test', '$2a$10$RrqZrUr8pdcJht/hkYrPz.cNsu1Cx1elqdB/c4QkB1kFIda/UOy/a', '2025-01-23 21:37:30.892025+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "brianmiller", "full_name": "Brian Miller", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:30.888578+00', '2025-01-23 21:37:30.892672+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c7af35f6-8dd7-40c8-a2a3-ed85ad328652', 'authenticated', 'authenticated', 'jennifer.mitchell@dispatch911.test', '$2a$10$WbX3MiSOC2DdnD8DnWl0auKaj9me/jBdcQesYz4AlQGd4jMDiEz1m', '2025-01-23 21:37:31.371303+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "jennifermitchell", "full_name": "Jennifer Mitchell", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.368327+00', '2025-01-23 21:37:31.372011+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4de8ad00-b770-43d3-adee-6bdb8439c0ab', 'authenticated', 'authenticated', 'michelle.lee@dispatch911.test', '$2a$10$vX.iWzY2/V62JcbpJbfE8eyH/Nw4eIQB1qUtacBGzFe4zyvq05iWy', '2025-01-23 21:37:31.536744+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "michellelee", "full_name": "Michelle Lee", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.533684+00', '2025-01-23 21:37:31.537389+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '62ea7b0e-9db1-47a5-9e55-4d311293bcac', 'authenticated', 'authenticated', 'kevin.garcia@dispatch911.test', '$2a$10$Az74uJRtKNFR0D.UQa9C9eDdod1qNHNadx/dtWZrmnXEWK8NrMLzK', '2025-01-23 21:37:32.162828+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "kevingarcia", "full_name": "Kevin Garcia", "user_role": "Manager", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.159248+00', '2025-01-23 21:37:32.163442+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '7bd029c6-0e12-43ca-9075-77fc7105c6ad', 'authenticated', 'authenticated', 'karen.clark@dispatch911.test', '$2a$10$0nLo1dudkjDZIdL8cd0f8eQXPL7hBC15TBjId99utf.CzASC8NEvK', '2025-01-23 21:37:31.694784+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "karenclark", "full_name": "Karen Clark", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.691061+00', '2025-01-23 21:37:31.695398+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '69ffce4c-f6ee-49ac-87c5-bc6f59f771ca', 'authenticated', 'authenticated', 'stephanie.moore@dispatch911.test', '$2a$10$Aje6.1gLRDKcHnlnqFX1ZOKkXXvkl46BGQhPDQqene/HePfPC2lbe', '2025-01-23 21:37:32.484286+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "stephaniemoore", "full_name": "Stephanie Moore", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.481454+00', '2025-01-23 21:37:32.485183+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '4a211ea0-1e34-42b9-9ed0-341b3bc6beff', 'authenticated', 'authenticated', 'mark.johnson@dispatch911.test', '$2a$10$N2YJO7CZU3JhJlsXY8/BwevrPqNUFnQ3GJPZ/eoEZn9A7YTEKDPBu', '2025-01-23 21:37:31.8601+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "markjohnson", "full_name": "Mark Johnson", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:31.857198+00', '2025-01-23 21:37:31.860788+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '13edf723-2892-4122-9aca-0d961de78077', 'authenticated', 'authenticated', 'sandra.wilson@dispatch911.test', '$2a$10$IAgC9ucRbpzWOhCXFMBQE.NTxvC7XZ2eJQxaroMHpBrPwwQgaBQn.', '2025-01-23 21:37:32.313389+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "sandrawilson", "full_name": "Sandra Wilson", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.309955+00', '2025-01-23 21:37:32.313979+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '45b1ed80-37d5-4467-910e-f713ee1384cb', 'authenticated', 'authenticated', 'charles.young@dispatch911.test', '$2a$10$PvvArYqA4jJDnCGcbOPx7uc3F3dHgOGFCCYdIOTpYfmvbDid8lHLy', '2025-01-23 21:37:32.009+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "charlesyoung", "full_name": "Charles Young", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.006178+00', '2025-01-23 21:37:32.009638+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5c0ed845-d52c-4d25-8486-ed017b6f60a1', 'authenticated', 'authenticated', 'richard.martin@dispatch911.test', '$2a$10$D0wQ1Q1P6gW7vub.qrAakuJaHWEf5/6q8D9VAZbEUlJLdVybt6oRa', '2025-01-23 21:37:32.94183+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "richardmartin", "full_name": "Richard Martin", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.938574+00', '2025-01-23 21:37:32.942453+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec', 'authenticated', 'authenticated', 'daniel.taylor@dispatch911.test', '$2a$10$LBhwBlgn8EkomaypHOGAqezjIJo5lqUJ9J02whAWeQ6xy8S68Ynei', '2025-01-23 21:37:32.791526+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "danieltaylor", "full_name": "Daniel Taylor", "user_role": "Employee", "employee_role": "Management", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.787715+00', '2025-01-23 21:37:32.792169+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '3e90610b-6f4a-43c9-a73a-1f71ef5c6b74', 'authenticated', 'authenticated', 'ronald.williams@dispatch911.test', '$2a$10$WO5ggPbZY79gy5yMcP.loOzJws1n.Ku6DvBO50ZpJkY/sH/ZwyZVS', '2025-01-23 21:37:32.645885+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "ronaldwilliams", "full_name": "Ronald Williams", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:32.643104+00', '2025-01-23 21:37:32.646471+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '5c52a054-3d67-48c3-9fa9-1d89f59cc763', 'authenticated', 'authenticated', 'betty.baker@dispatch911.test', '$2a$10$c1IKdRnj892f51w3Kdorie0/MHBmETxnWSOUv9A9wlDSWe1O0MMj6', '2025-01-23 21:37:33.129564+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "bettybaker", "full_name": "Betty Baker", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.126716+00', '2025-01-23 21:37:33.130178+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '99a22969-6322-4abd-a341-9b9da475717a', 'authenticated', 'authenticated', 'robert.adams@dispatch911.test', '$2a$10$w/2VBMPge/Aa9VvCJ364OuzZ0wsYZW.2OaLqtmkxEZUfzPLVeK3gu', '2025-01-23 21:37:33.283453+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "robertadams", "full_name": "Robert Adams", "user_role": "Employee", "employee_role": "Management", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.279699+00', '2025-01-23 21:37:33.28412+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '354d2bb4-1745-4780-8ad0-f2a59bd5c1e0', 'authenticated', 'authenticated', 'melissa.hill@dispatch911.test', '$2a$10$dh.02Pf1uPokGJV1n2ZHY.U85r2DA5zbsduV8ehMfndSP3uPVPXwy', '2025-01-23 21:37:33.439199+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "melissahill", "full_name": "Melissa Hill", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.436407+00', '2025-01-23 21:37:33.439828+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ace54a5c-0347-4b22-8e3d-63216ad59460', 'authenticated', 'authenticated', 'adambpeterson@gmail.com', '$2a$10$nMai9Poh82VfJo2SG6vDU.C4xp.HFxMxdO9PVcITimOmLMj1iN0TW', '2025-01-23 21:38:08.343406+00', NULL, '', NULL, '', NULL, '', '', NULL, '2025-01-23 21:39:17.569485+00', '{"provider": "email", "providers": ["email"]}', '{"email_verified": true}', NULL, '2025-01-23 21:38:08.338293+00', '2025-01-23 21:39:17.572621+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '2e88a784-d5b1-4ef4-ac96-dcfab869849f', 'authenticated', 'authenticated', 'joshua.flores@dispatch911.test', '$2a$10$6Ny5ftoIXclNRa4OkLV5LeL3p6Uaz9BEg.L37Ma6mqFOAshzVanjW', '2025-01-23 21:37:33.598266+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "joshuaflores", "full_name": "Joshua Flores", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.595292+00', '2025-01-23 21:37:33.598889+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c2297db5-9b39-440a-b545-38e2c036ee7c', 'authenticated', 'authenticated', 'kimberly.wright@dispatch911.test', '$2a$10$/cqqoMXpEfcmDaF04UlO/.kDPks8/o7seRBMY6K1.UAjm.kjyc4Ua', '2025-01-23 21:37:34.154116+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "kimberlywright", "full_name": "Kimberly Wright", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:34.1494+00', '2025-01-23 21:37:34.15471+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'c5857e55-9b30-43bb-9c79-1d5e07f99189', 'authenticated', 'authenticated', 'patricia.parker@dispatch911.test', '$2a$10$qt75F/zQKqfi3PshCqweMep1zIFTODBs41UlJVH3DFwgEqjg8eS1S', '2025-01-23 21:37:33.752511+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "patriciaparker", "full_name": "Patricia Parker", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.748235+00', '2025-01-23 21:37:33.753199+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', '864e5816-b415-489d-87cc-c4dd3a37d34b', 'authenticated', 'authenticated', 'mary.sanchez@dispatch911.test', '$2a$10$YnSFmzrCbivO.Ss4AFpsyuN12zGEr.FLn5rRibd8lUrHY.GIQylIq', '2025-01-23 21:37:33.98713+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "marysanchez", "full_name": "Mary Sanchez", "user_role": "Employee", "employee_role": "Shift Supervisor", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:33.984326+00', '2025-01-23 21:37:33.987735+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false),
	('00000000-0000-0000-0000-000000000000', 'ab0414a0-8107-4b5b-87d2-ec283d9b9650', 'authenticated', 'authenticated', 'nancy.brown@dispatch911.test', '$2a$10$Wf3sKbHENZlWj7TCVGhui.YXbm/qZBz/TbUSnXklUDhIGm8dWXzpS', '2025-01-23 21:37:34.30428+00', NULL, '', NULL, '', NULL, '', '', NULL, NULL, '{"provider": "email", "providers": ["email"]}', '{"username": "nancybrown", "full_name": "Nancy Brown", "user_role": "Employee", "employee_role": "Dispatcher", "email_verified": true, "default_shift_type_id": "a0bb0dda-bc73-4126-ac66-5d331f0fac27", "weekly_hours_scheduled": 40}', NULL, '2025-01-23 21:37:34.301485+00', '2025-01-23 21:37:34.304903+00', NULL, NULL, '', '', NULL, '', 0, NULL, '', NULL, false, NULL, false);


--
-- Data for Name: identities; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."identities" ("provider_id", "user_id", "identity_data", "provider", "last_sign_in_at", "created_at", "updated_at", "id") VALUES
	('3ae093c6-70cd-45b6-b923-b0546031d67a', '3ae093c6-70cd-45b6-b923-b0546031d67a', '{"sub": "3ae093c6-70cd-45b6-b923-b0546031d67a", "email": "joseph.king@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:26.203063+00', '2025-01-23 21:37:26.203117+00', '2025-01-23 21:37:26.203117+00', 'b27356ba-51fa-4284-a4b2-c9693a423d4a'),
	('775196c7-221e-4493-9114-3484912696f1', '775196c7-221e-4493-9114-3484912696f1', '{"sub": "775196c7-221e-4493-9114-3484912696f1", "email": "donna.jackson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:26.401127+00', '2025-01-23 21:37:26.401178+00', '2025-01-23 21:37:26.401178+00', 'e7555f3e-eb78-45e6-9533-b6b782ed81d8'),
	('26cb1a43-b734-468d-8cd6-6c2e775667e3', '26cb1a43-b734-468d-8cd6-6c2e775667e3', '{"sub": "26cb1a43-b734-468d-8cd6-6c2e775667e3", "email": "amanda.diaz@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:26.593185+00', '2025-01-23 21:37:26.593238+00', '2025-01-23 21:37:26.593238+00', '2e6e7ad4-3253-4019-a793-db0561865c3f'),
	('9d8372d5-d14c-427c-9c5e-6c08e1b423af', '9d8372d5-d14c-427c-9c5e-6c08e1b423af', '{"sub": "9d8372d5-d14c-427c-9c5e-6c08e1b423af", "email": "sarah.roberts@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:26.771153+00', '2025-01-23 21:37:26.771209+00', '2025-01-23 21:37:26.771209+00', '504a0868-c51b-4059-99ab-dc3e0eddce83'),
	('67530f8a-9313-43bb-aa2b-74cafe72aac2', '67530f8a-9313-43bb-aa2b-74cafe72aac2', '{"sub": "67530f8a-9313-43bb-aa2b-74cafe72aac2", "email": "timothy.scott@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:26.928268+00', '2025-01-23 21:37:26.928319+00', '2025-01-23 21:37:26.928319+00', 'cdfbe1e1-4058-403d-bd16-b073c8f625f4'),
	('c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4', 'c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4', '{"sub": "c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4", "email": "paul.robinson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.114823+00', '2025-01-23 21:37:27.114876+00', '2025-01-23 21:37:27.114876+00', '817f6923-6f08-4679-922a-0bf3928a2a78'),
	('cf645d1e-6820-4ebb-a717-3feeb5610021', 'cf645d1e-6820-4ebb-a717-3feeb5610021', '{"sub": "cf645d1e-6820-4ebb-a717-3feeb5610021", "email": "dorothy.thomas@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.28009+00', '2025-01-23 21:37:27.280139+00', '2025-01-23 21:37:27.280139+00', 'fae20bf9-f6a2-4a42-a664-65930ce5fc59'),
	('8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895', '8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895', '{"sub": "8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895", "email": "kenneth.evans@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.431473+00', '2025-01-23 21:37:27.431521+00', '2025-01-23 21:37:27.431521+00', '1a4192a4-b334-4cb3-a6bb-8a95d829f4ef'),
	('3df2ab5d-a23e-44bb-878c-d28a63842c9f', '3df2ab5d-a23e-44bb-878c-d28a63842c9f', '{"sub": "3df2ab5d-a23e-44bb-878c-d28a63842c9f", "email": "james.smith@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.623218+00', '2025-01-23 21:37:27.623268+00', '2025-01-23 21:37:27.623268+00', '9af8d21e-54ea-4e7d-912b-e2597e7a586c'),
	('cbcba25e-5e17-4fad-a524-f28b9613ca2e', 'cbcba25e-5e17-4fad-a524-f28b9613ca2e', '{"sub": "cbcba25e-5e17-4fad-a524-f28b9613ca2e", "email": "edward.green@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.776047+00', '2025-01-23 21:37:27.776097+00', '2025-01-23 21:37:27.776097+00', '5f89e361-d324-4479-a894-39f9c0d7564a'),
	('c6560298-d632-439e-ac16-d480875c211d', 'c6560298-d632-439e-ac16-d480875c211d', '{"sub": "c6560298-d632-439e-ac16-d480875c211d", "email": "elizabeth.davis@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:27.920191+00', '2025-01-23 21:37:27.920244+00', '2025-01-23 21:37:27.920244+00', '953e010d-e823-42f3-bbe5-0e9254e9176b'),
	('80fadb13-fec8-4e6c-baa8-24a03907852d', '80fadb13-fec8-4e6c-baa8-24a03907852d', '{"sub": "80fadb13-fec8-4e6c-baa8-24a03907852d", "email": "david.phillips@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.096985+00', '2025-01-23 21:37:28.097039+00', '2025-01-23 21:37:28.097039+00', 'b2256ab8-b918-475a-a585-4af134f7337e'),
	('550e9af3-e044-49a9-87d6-942cd58bbb39', '550e9af3-e044-49a9-87d6-942cd58bbb39', '{"sub": "550e9af3-e044-49a9-87d6-942cd58bbb39", "email": "deborah.jones@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.246734+00', '2025-01-23 21:37:28.246784+00', '2025-01-23 21:37:28.246784+00', '64205134-869e-4f1c-8772-78fcbd86b315'),
	('74cebaf2-3a4d-4371-8f1d-43a9afb27cd0', '74cebaf2-3a4d-4371-8f1d-43a9afb27cd0', '{"sub": "74cebaf2-3a4d-4371-8f1d-43a9afb27cd0", "email": "william.torres@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.450072+00', '2025-01-23 21:37:28.450123+00', '2025-01-23 21:37:28.450123+00', '98fbe1f6-ed23-4891-8702-c1f8616aa8dd'),
	('44d108fe-1a71-4e6a-bb6d-4b21978a9637', '44d108fe-1a71-4e6a-bb6d-4b21978a9637', '{"sub": "44d108fe-1a71-4e6a-bb6d-4b21978a9637", "email": "lisa.nelson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.605089+00', '2025-01-23 21:37:28.605138+00', '2025-01-23 21:37:28.605138+00', '0dd10575-a9d4-47ec-8399-635574fa303b'),
	('12500126-382b-4247-b598-8dea9be1e3b4', '12500126-382b-4247-b598-8dea9be1e3b4', '{"sub": "12500126-382b-4247-b598-8dea9be1e3b4", "email": "michael.hall@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.761857+00', '2025-01-23 21:37:28.761905+00', '2025-01-23 21:37:28.761905+00', 'ad44420d-3bda-42bd-899e-6f0ea8571b50'),
	('237aee4c-77dd-45db-8592-7ddac4bb63f8', '237aee4c-77dd-45db-8592-7ddac4bb63f8', '{"sub": "237aee4c-77dd-45db-8592-7ddac4bb63f8", "email": "sharon.ramirez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:28.90755+00', '2025-01-23 21:37:28.907597+00', '2025-01-23 21:37:28.907597+00', '0a231bbb-37d3-4dc1-b2a8-53a7b83bccff'),
	('b6ca461a-506d-45f0-954b-9ba0746c8ea5', 'b6ca461a-506d-45f0-954b-9ba0746c8ea5', '{"sub": "b6ca461a-506d-45f0-954b-9ba0746c8ea5", "email": "susan.rivera@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.081019+00', '2025-01-23 21:37:29.08107+00', '2025-01-23 21:37:29.08107+00', 'c06a835c-0c92-45f6-b156-eaade1686022'),
	('96cba30b-41c9-4b34-85e6-dbf682902d0a', '96cba30b-41c9-4b34-85e6-dbf682902d0a', '{"sub": "96cba30b-41c9-4b34-85e6-dbf682902d0a", "email": "matthew.turner@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.238041+00', '2025-01-23 21:37:29.23809+00', '2025-01-23 21:37:29.23809+00', 'e22d35ae-b598-475d-85fe-0b7f5b7f8c76'),
	('bc91fbeb-acc6-4100-9e05-da662ebbdff7', 'bc91fbeb-acc6-4100-9e05-da662ebbdff7', '{"sub": "bc91fbeb-acc6-4100-9e05-da662ebbdff7", "email": "thomas.gomez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.386612+00', '2025-01-23 21:37:29.38666+00', '2025-01-23 21:37:29.38666+00', 'c461b434-022f-422a-9fd5-4361e493e619'),
	('790ba4d6-8326-47f2-92c2-ff666a3a8575', '790ba4d6-8326-47f2-92c2-ff666a3a8575', '{"sub": "790ba4d6-8326-47f2-92c2-ff666a3a8575", "email": "carol.harris@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.550229+00', '2025-01-23 21:37:29.550278+00', '2025-01-23 21:37:29.550278+00', '3d859a02-7642-4fbc-bb10-1e29cb50a410'),
	('0b45d8fb-8218-481a-b9eb-725726617ebd', '0b45d8fb-8218-481a-b9eb-725726617ebd', '{"sub": "0b45d8fb-8218-481a-b9eb-725726617ebd", "email": "rebecca.allen@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.736207+00', '2025-01-23 21:37:29.736257+00', '2025-01-23 21:37:29.736257+00', 'cd78ad1b-7c36-45f4-b8a7-91fc99c3663e'),
	('cea4b801-55f9-40fc-bc53-64c529eafc13', 'cea4b801-55f9-40fc-bc53-64c529eafc13', '{"sub": "cea4b801-55f9-40fc-bc53-64c529eafc13", "email": "emily.martinez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:29.893848+00', '2025-01-23 21:37:29.893899+00', '2025-01-23 21:37:29.893899+00', '177f0be3-fc96-42e8-a8e3-4426b67a81dc'),
	('c7567c74-d25a-47a8-88a5-4a901b4ae27b', 'c7567c74-d25a-47a8-88a5-4a901b4ae27b', '{"sub": "c7567c74-d25a-47a8-88a5-4a901b4ae27b", "email": "john.perez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.05183+00', '2025-01-23 21:37:30.051896+00', '2025-01-23 21:37:30.051896+00', '96a746f0-927a-4daf-9fe3-14d8786528a3'),
	('16994703-c64b-4fd6-8cc3-635be73d6965', '16994703-c64b-4fd6-8cc3-635be73d6965', '{"sub": "16994703-c64b-4fd6-8cc3-635be73d6965", "email": "anthony.nguyen@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.200726+00', '2025-01-23 21:37:30.200773+00', '2025-01-23 21:37:30.200773+00', '16d6ec1a-652e-44e5-b247-ee8d83c5dc6d'),
	('b62e51ba-0b92-47d2-abdc-c01b138740ab', 'b62e51ba-0b92-47d2-abdc-c01b138740ab', '{"sub": "b62e51ba-0b92-47d2-abdc-c01b138740ab", "email": "george.rodriguez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.38749+00', '2025-01-23 21:37:30.387538+00', '2025-01-23 21:37:30.387538+00', '31b82083-5cdf-4ede-88a7-da2edff66d73'),
	('3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0', '3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0', '{"sub": "3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0", "email": "andrew.thompson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.5527+00', '2025-01-23 21:37:30.55275+00', '2025-01-23 21:37:30.55275+00', 'b8ecadeb-dce1-4264-a734-d6493816904e'),
	('ff5ade2d-b38e-4ca5-af1a-7499cbd6d927', 'ff5ade2d-b38e-4ca5-af1a-7499cbd6d927', '{"sub": "ff5ade2d-b38e-4ca5-af1a-7499cbd6d927", "email": "linda.walker@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.728363+00', '2025-01-23 21:37:30.728412+00', '2025-01-23 21:37:30.728412+00', '4e0fd1c8-dcf0-4dad-b536-d976e8296dcc'),
	('3d721bc7-8ff4-40db-b3a2-7e25a66687fb', '3d721bc7-8ff4-40db-b3a2-7e25a66687fb', '{"sub": "3d721bc7-8ff4-40db-b3a2-7e25a66687fb", "email": "brian.miller@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:30.890368+00', '2025-01-23 21:37:30.890417+00', '2025-01-23 21:37:30.890417+00', '9755c35e-b694-4487-b1ac-6ba04eabb28a'),
	('09890293-ba41-4217-b7fa-b01211a411e6', '09890293-ba41-4217-b7fa-b01211a411e6', '{"sub": "09890293-ba41-4217-b7fa-b01211a411e6", "email": "margaret.white@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.073244+00', '2025-01-23 21:37:31.073294+00', '2025-01-23 21:37:31.073294+00', '8bcfe5a5-f4f4-4403-bb06-9049a585616e'),
	('4bfe7200-8a91-4de0-a2c6-2d24720957db', '4bfe7200-8a91-4de0-a2c6-2d24720957db', '{"sub": "4bfe7200-8a91-4de0-a2c6-2d24720957db", "email": "barbara.lopez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.222836+00', '2025-01-23 21:37:31.222887+00', '2025-01-23 21:37:31.222887+00', 'b96a765f-d0eb-4a89-926a-58373fda9242'),
	('c7af35f6-8dd7-40c8-a2a3-ed85ad328652', 'c7af35f6-8dd7-40c8-a2a3-ed85ad328652', '{"sub": "c7af35f6-8dd7-40c8-a2a3-ed85ad328652", "email": "jennifer.mitchell@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.369739+00', '2025-01-23 21:37:31.369789+00', '2025-01-23 21:37:31.369789+00', '8f230310-e788-4056-a2a6-f69cdfbd9041'),
	('4de8ad00-b770-43d3-adee-6bdb8439c0ab', '4de8ad00-b770-43d3-adee-6bdb8439c0ab', '{"sub": "4de8ad00-b770-43d3-adee-6bdb8439c0ab", "email": "michelle.lee@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.535041+00', '2025-01-23 21:37:31.53509+00', '2025-01-23 21:37:31.53509+00', 'b6020ccd-2eda-469d-9a48-6aef2c898528'),
	('7bd029c6-0e12-43ca-9075-77fc7105c6ad', '7bd029c6-0e12-43ca-9075-77fc7105c6ad', '{"sub": "7bd029c6-0e12-43ca-9075-77fc7105c6ad", "email": "karen.clark@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.693129+00', '2025-01-23 21:37:31.693181+00', '2025-01-23 21:37:31.693181+00', 'b55846d1-a45d-4915-96eb-da79d09a9735'),
	('4a211ea0-1e34-42b9-9ed0-341b3bc6beff', '4a211ea0-1e34-42b9-9ed0-341b3bc6beff', '{"sub": "4a211ea0-1e34-42b9-9ed0-341b3bc6beff", "email": "mark.johnson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:31.858488+00', '2025-01-23 21:37:31.858537+00', '2025-01-23 21:37:31.858537+00', '8f3c3506-5e02-43f0-b9ba-fd1a8c6e87ee'),
	('45b1ed80-37d5-4467-910e-f713ee1384cb', '45b1ed80-37d5-4467-910e-f713ee1384cb', '{"sub": "45b1ed80-37d5-4467-910e-f713ee1384cb", "email": "charles.young@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.007487+00', '2025-01-23 21:37:32.007541+00', '2025-01-23 21:37:32.007541+00', '856c7b8c-67ce-47ab-a3ba-8de30b5fb6a0'),
	('62ea7b0e-9db1-47a5-9e55-4d311293bcac', '62ea7b0e-9db1-47a5-9e55-4d311293bcac', '{"sub": "62ea7b0e-9db1-47a5-9e55-4d311293bcac", "email": "kevin.garcia@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.160547+00', '2025-01-23 21:37:32.160598+00', '2025-01-23 21:37:32.160598+00', 'c19c072c-b608-433d-bf57-6905dbcc630d'),
	('13edf723-2892-4122-9aca-0d961de78077', '13edf723-2892-4122-9aca-0d961de78077', '{"sub": "13edf723-2892-4122-9aca-0d961de78077", "email": "sandra.wilson@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.311235+00', '2025-01-23 21:37:32.311285+00', '2025-01-23 21:37:32.311285+00', '9131b5cf-d7c0-4d40-b4e1-f0c0619263ef'),
	('69ffce4c-f6ee-49ac-87c5-bc6f59f771ca', '69ffce4c-f6ee-49ac-87c5-bc6f59f771ca', '{"sub": "69ffce4c-f6ee-49ac-87c5-bc6f59f771ca", "email": "stephanie.moore@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.482783+00', '2025-01-23 21:37:32.482833+00', '2025-01-23 21:37:32.482833+00', '8bb68c69-0b1b-4c61-961e-c3525a78ee85'),
	('3e90610b-6f4a-43c9-a73a-1f71ef5c6b74', '3e90610b-6f4a-43c9-a73a-1f71ef5c6b74', '{"sub": "3e90610b-6f4a-43c9-a73a-1f71ef5c6b74", "email": "ronald.williams@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.644403+00', '2025-01-23 21:37:32.644456+00', '2025-01-23 21:37:32.644456+00', 'bb9d549b-2a27-4042-b14f-473f387ad15f'),
	('f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec', 'f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec', '{"sub": "f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec", "email": "daniel.taylor@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.789761+00', '2025-01-23 21:37:32.789817+00', '2025-01-23 21:37:32.789817+00', '3ce2eabf-ecd1-4069-aba4-34866fefc61d'),
	('5c0ed845-d52c-4d25-8486-ed017b6f60a1', '5c0ed845-d52c-4d25-8486-ed017b6f60a1', '{"sub": "5c0ed845-d52c-4d25-8486-ed017b6f60a1", "email": "richard.martin@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:32.940023+00', '2025-01-23 21:37:32.940075+00', '2025-01-23 21:37:32.940075+00', 'dd3a4cab-cb4c-4d7b-bb95-94bf99a0e471'),
	('5c52a054-3d67-48c3-9fa9-1d89f59cc763', '5c52a054-3d67-48c3-9fa9-1d89f59cc763', '{"sub": "5c52a054-3d67-48c3-9fa9-1d89f59cc763", "email": "betty.baker@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.127988+00', '2025-01-23 21:37:33.128036+00', '2025-01-23 21:37:33.128036+00', '36f16cff-97fb-48c8-9b52-cae3fd44671a'),
	('99a22969-6322-4abd-a341-9b9da475717a', '99a22969-6322-4abd-a341-9b9da475717a', '{"sub": "99a22969-6322-4abd-a341-9b9da475717a", "email": "robert.adams@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.281078+00', '2025-01-23 21:37:33.281128+00', '2025-01-23 21:37:33.281128+00', '7e51cdbd-372a-4654-b9db-604112d96d89'),
	('354d2bb4-1745-4780-8ad0-f2a59bd5c1e0', '354d2bb4-1745-4780-8ad0-f2a59bd5c1e0', '{"sub": "354d2bb4-1745-4780-8ad0-f2a59bd5c1e0", "email": "melissa.hill@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.437708+00', '2025-01-23 21:37:33.437754+00', '2025-01-23 21:37:33.437754+00', '12e53fa6-e4ba-48a0-aacd-97015056938a'),
	('2e88a784-d5b1-4ef4-ac96-dcfab869849f', '2e88a784-d5b1-4ef4-ac96-dcfab869849f', '{"sub": "2e88a784-d5b1-4ef4-ac96-dcfab869849f", "email": "joshua.flores@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.596652+00', '2025-01-23 21:37:33.596708+00', '2025-01-23 21:37:33.596708+00', '8218028e-4768-4609-b272-8a60e5d843e4'),
	('c5857e55-9b30-43bb-9c79-1d5e07f99189', 'c5857e55-9b30-43bb-9c79-1d5e07f99189', '{"sub": "c5857e55-9b30-43bb-9c79-1d5e07f99189", "email": "patricia.parker@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.749575+00', '2025-01-23 21:37:33.749636+00', '2025-01-23 21:37:33.749636+00', 'a106447e-fbf8-4055-a0db-2c4ed942db69'),
	('864e5816-b415-489d-87cc-c4dd3a37d34b', '864e5816-b415-489d-87cc-c4dd3a37d34b', '{"sub": "864e5816-b415-489d-87cc-c4dd3a37d34b", "email": "mary.sanchez@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:33.985604+00', '2025-01-23 21:37:33.98565+00', '2025-01-23 21:37:33.98565+00', 'b88498c8-a7d7-41e8-a064-1c1162a6426f'),
	('c2297db5-9b39-440a-b545-38e2c036ee7c', 'c2297db5-9b39-440a-b545-38e2c036ee7c', '{"sub": "c2297db5-9b39-440a-b545-38e2c036ee7c", "email": "kimberly.wright@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:34.150625+00', '2025-01-23 21:37:34.150686+00', '2025-01-23 21:37:34.150686+00', '436dc3b7-16ee-4935-a1bf-7eb2c196bf3c'),
	('ab0414a0-8107-4b5b-87d2-ec283d9b9650', 'ab0414a0-8107-4b5b-87d2-ec283d9b9650', '{"sub": "ab0414a0-8107-4b5b-87d2-ec283d9b9650", "email": "nancy.brown@dispatch911.test", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:37:34.302771+00', '2025-01-23 21:37:34.302822+00', '2025-01-23 21:37:34.302822+00', 'd1fd3a98-6f9a-400f-88e6-87ede2f4744a'),
	('ace54a5c-0347-4b22-8e3d-63216ad59460', 'ace54a5c-0347-4b22-8e3d-63216ad59460', '{"sub": "ace54a5c-0347-4b22-8e3d-63216ad59460", "email": "adambpeterson@gmail.com", "email_verified": false, "phone_verified": false}', 'email', '2025-01-23 21:38:08.341515+00', '2025-01-23 21:38:08.341568+00', '2025-01-23 21:38:08.341568+00', '452384c7-094a-4d8d-bb4a-b97bdf89a639');


--
-- Data for Name: instances; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--



--
-- Data for Name: sessions; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."sessions" ("id", "user_id", "created_at", "updated_at", "factor_id", "aal", "not_after", "refreshed_at", "user_agent", "ip", "tag") VALUES
	('431b84ca-1628-49f6-86ca-75e58f8da4aa', 'ace54a5c-0347-4b22-8e3d-63216ad59460', '2025-01-23 21:39:17.569554+00', '2025-01-23 21:39:17.569554+00', NULL, 'aal1', NULL, NULL, 'node', '98.35.199.33', NULL);


--
-- Data for Name: mfa_amr_claims; Type: TABLE DATA; Schema: auth; Owner: supabase_auth_admin
--

INSERT INTO "auth"."mfa_amr_claims" ("session_id", "created_at", "updated_at", "authentication_method", "id") VALUES
	('431b84ca-1628-49f6-86ca-75e58f8da4aa', '2025-01-23 21:39:17.573044+00', '2025-01-23 21:39:17.573044+00', 'password', '1951a535-25e6-4002-9f08-a5dd61d1a4c7');


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

INSERT INTO "auth"."refresh_tokens" ("instance_id", "id", "token", "user_id", "revoked", "created_at", "updated_at", "parent", "session_id") VALUES
	('00000000-0000-0000-0000-000000000000', 2, 'ru8H1qDSj-zDQz_71iQrfQ', 'ace54a5c-0347-4b22-8e3d-63216ad59460', false, '2025-01-23 21:39:17.571294+00', '2025-01-23 21:39:17.571294+00', NULL, '431b84ca-1628-49f6-86ca-75e58f8da4aa');


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
-- Data for Name: profiles; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."profiles" ("id", "updated_at", "username", "full_name", "avatar_url", "website") VALUES
	('3ae093c6-70cd-45b6-b923-b0546031d67a', '2025-01-23 21:37:26.1959+00', NULL, 'Joseph King', NULL, NULL),
	('775196c7-221e-4493-9114-3484912696f1', '2025-01-23 21:37:26.399099+00', NULL, 'Donna Jackson', NULL, NULL),
	('26cb1a43-b734-468d-8cd6-6c2e775667e3', '2025-01-23 21:37:26.591129+00', NULL, 'Amanda Diaz', NULL, NULL),
	('9d8372d5-d14c-427c-9c5e-6c08e1b423af', '2025-01-23 21:37:26.76787+00', NULL, 'Sarah Roberts', NULL, NULL),
	('67530f8a-9313-43bb-aa2b-74cafe72aac2', '2025-01-23 21:37:26.926325+00', NULL, 'Timothy Scott', NULL, NULL),
	('c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4', '2025-01-23 21:37:27.112135+00', NULL, 'Paul Robinson', NULL, NULL),
	('cf645d1e-6820-4ebb-a717-3feeb5610021', '2025-01-23 21:37:27.278392+00', NULL, 'Dorothy Thomas', NULL, NULL),
	('8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895', '2025-01-23 21:37:27.42981+00', NULL, 'Kenneth Evans', NULL, NULL),
	('3df2ab5d-a23e-44bb-878c-d28a63842c9f', '2025-01-23 21:37:27.621536+00', NULL, 'James Smith', NULL, NULL),
	('cbcba25e-5e17-4fad-a524-f28b9613ca2e', '2025-01-23 21:37:27.77436+00', NULL, 'Edward Green', NULL, NULL),
	('c6560298-d632-439e-ac16-d480875c211d', '2025-01-23 21:37:27.918522+00', NULL, 'Elizabeth Davis', NULL, NULL),
	('80fadb13-fec8-4e6c-baa8-24a03907852d', '2025-01-23 21:37:28.095144+00', NULL, 'David Phillips', NULL, NULL),
	('550e9af3-e044-49a9-87d6-942cd58bbb39', '2025-01-23 21:37:28.244498+00', NULL, 'Deborah Jones', NULL, NULL),
	('74cebaf2-3a4d-4371-8f1d-43a9afb27cd0', '2025-01-23 21:37:28.448394+00', NULL, 'William Torres', NULL, NULL),
	('44d108fe-1a71-4e6a-bb6d-4b21978a9637', '2025-01-23 21:37:28.60336+00', NULL, 'Lisa Nelson', NULL, NULL),
	('12500126-382b-4247-b598-8dea9be1e3b4', '2025-01-23 21:37:28.760227+00', NULL, 'Michael Hall', NULL, NULL),
	('237aee4c-77dd-45db-8592-7ddac4bb63f8', '2025-01-23 21:37:28.90596+00', NULL, 'Sharon Ramirez', NULL, NULL),
	('b6ca461a-506d-45f0-954b-9ba0746c8ea5', '2025-01-23 21:37:29.079335+00', NULL, 'Susan Rivera', NULL, NULL),
	('96cba30b-41c9-4b34-85e6-dbf682902d0a', '2025-01-23 21:37:29.236478+00', NULL, 'Matthew Turner', NULL, NULL),
	('bc91fbeb-acc6-4100-9e05-da662ebbdff7', '2025-01-23 21:37:29.385072+00', NULL, 'Thomas Gomez', NULL, NULL),
	('790ba4d6-8326-47f2-92c2-ff666a3a8575', '2025-01-23 21:37:29.548595+00', NULL, 'Carol Harris', NULL, NULL),
	('0b45d8fb-8218-481a-b9eb-725726617ebd', '2025-01-23 21:37:29.734588+00', NULL, 'Rebecca Allen', NULL, NULL),
	('cea4b801-55f9-40fc-bc53-64c529eafc13', '2025-01-23 21:37:29.892161+00', NULL, 'Emily Martinez', NULL, NULL),
	('c7567c74-d25a-47a8-88a5-4a901b4ae27b', '2025-01-23 21:37:30.049509+00', NULL, 'John Perez', NULL, NULL),
	('16994703-c64b-4fd6-8cc3-635be73d6965', '2025-01-23 21:37:30.199133+00', NULL, 'Anthony Nguyen', NULL, NULL),
	('b62e51ba-0b92-47d2-abdc-c01b138740ab', '2025-01-23 21:37:30.385931+00', NULL, 'George Rodriguez', NULL, NULL),
	('3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0', '2025-01-23 21:37:30.551037+00', NULL, 'Andrew Thompson', NULL, NULL),
	('ff5ade2d-b38e-4ca5-af1a-7499cbd6d927', '2025-01-23 21:37:30.726788+00', NULL, 'Linda Walker', NULL, NULL),
	('3d721bc7-8ff4-40db-b3a2-7e25a66687fb', '2025-01-23 21:37:30.888234+00', NULL, 'Brian Miller', NULL, NULL),
	('09890293-ba41-4217-b7fa-b01211a411e6', '2025-01-23 21:37:31.0716+00', NULL, 'Margaret White', NULL, NULL),
	('4bfe7200-8a91-4de0-a2c6-2d24720957db', '2025-01-23 21:37:31.221211+00', NULL, 'Barbara Lopez', NULL, NULL),
	('c7af35f6-8dd7-40c8-a2a3-ed85ad328652', '2025-01-23 21:37:31.367974+00', NULL, 'Jennifer Mitchell', NULL, NULL),
	('4de8ad00-b770-43d3-adee-6bdb8439c0ab', '2025-01-23 21:37:31.533321+00', NULL, 'Michelle Lee', NULL, NULL),
	('7bd029c6-0e12-43ca-9075-77fc7105c6ad', '2025-01-23 21:37:31.690699+00', NULL, 'Karen Clark', NULL, NULL),
	('4a211ea0-1e34-42b9-9ed0-341b3bc6beff', '2025-01-23 21:37:31.856858+00', NULL, 'Mark Johnson', NULL, NULL),
	('45b1ed80-37d5-4467-910e-f713ee1384cb', '2025-01-23 21:37:32.005818+00', NULL, 'Charles Young', NULL, NULL),
	('62ea7b0e-9db1-47a5-9e55-4d311293bcac', '2025-01-23 21:37:32.158897+00', NULL, 'Kevin Garcia', NULL, NULL),
	('13edf723-2892-4122-9aca-0d961de78077', '2025-01-23 21:37:32.309627+00', NULL, 'Sandra Wilson', NULL, NULL),
	('69ffce4c-f6ee-49ac-87c5-bc6f59f771ca', '2025-01-23 21:37:32.481111+00', NULL, 'Stephanie Moore', NULL, NULL),
	('3e90610b-6f4a-43c9-a73a-1f71ef5c6b74', '2025-01-23 21:37:32.64276+00', NULL, 'Ronald Williams', NULL, NULL),
	('f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec', '2025-01-23 21:37:32.78736+00', NULL, 'Daniel Taylor', NULL, NULL),
	('5c0ed845-d52c-4d25-8486-ed017b6f60a1', '2025-01-23 21:37:32.938221+00', NULL, 'Richard Martin', NULL, NULL),
	('5c52a054-3d67-48c3-9fa9-1d89f59cc763', '2025-01-23 21:37:33.126377+00', NULL, 'Betty Baker', NULL, NULL),
	('99a22969-6322-4abd-a341-9b9da475717a', '2025-01-23 21:37:33.279351+00', NULL, 'Robert Adams', NULL, NULL),
	('354d2bb4-1745-4780-8ad0-f2a59bd5c1e0', '2025-01-23 21:37:33.436042+00', NULL, 'Melissa Hill', NULL, NULL),
	('2e88a784-d5b1-4ef4-ac96-dcfab869849f', '2025-01-23 21:37:33.594947+00', NULL, 'Joshua Flores', NULL, NULL),
	('c5857e55-9b30-43bb-9c79-1d5e07f99189', '2025-01-23 21:37:33.747875+00', NULL, 'Patricia Parker', NULL, NULL),
	('864e5816-b415-489d-87cc-c4dd3a37d34b', '2025-01-23 21:37:33.98399+00', NULL, 'Mary Sanchez', NULL, NULL),
	('c2297db5-9b39-440a-b545-38e2c036ee7c', '2025-01-23 21:37:34.149059+00', NULL, 'Kimberly Wright', NULL, NULL),
	('ab0414a0-8107-4b5b-87d2-ec283d9b9650', '2025-01-23 21:37:34.301139+00', NULL, 'Nancy Brown', NULL, NULL),
	('ace54a5c-0347-4b22-8e3d-63216ad59460', '2025-01-23 21:39:23.256+00', NULL, 'Adam Peterson', NULL, NULL);


--
-- Data for Name: shift_types; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shift_types" ("id", "name", "description", "created_at", "updated_at") VALUES
	('335afe36-804d-4722-88bf-4066798ffbfb', 'Early Day Shift', 'Early morning shift starting between 5AM and 7AM', '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('a0bb0dda-bc73-4126-ac66-5d331f0fac27', 'Day Shift', 'Standard day shift starting between 7AM and 11AM', '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', 'Swing Shift', 'Swing shift starting between 1PM and 3PM', '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', 'Graveyard', 'Night shift starting between 9PM and 11PM', '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00');


--
-- Data for Name: employees; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."employees" ("id", "employee_role", "user_role", "weekly_hours_scheduled", "default_shift_type_id", "created_at", "updated_at") VALUES
	('3ae093c6-70cd-45b6-b923-b0546031d67a', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:26.1959+00', '2025-01-23 21:37:26.1959+00'),
	('775196c7-221e-4493-9114-3484912696f1', 'Dispatcher', 'Admin', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:26.399099+00', '2025-01-23 21:37:26.399099+00'),
	('26cb1a43-b734-468d-8cd6-6c2e775667e3', 'Management', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:26.591129+00', '2025-01-23 21:37:26.591129+00'),
	('9d8372d5-d14c-427c-9c5e-6c08e1b423af', 'Dispatcher', 'Manager', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:26.76787+00', '2025-01-23 21:37:26.76787+00'),
	('67530f8a-9313-43bb-aa2b-74cafe72aac2', 'Dispatcher', 'Manager', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:26.926325+00', '2025-01-23 21:37:26.926325+00'),
	('c0fc0d8b-de7e-4945-9dd7-05b1009cbfe4', 'Dispatcher', 'Manager', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:27.112135+00', '2025-01-23 21:37:27.112135+00'),
	('cf645d1e-6820-4ebb-a717-3feeb5610021', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:27.278392+00', '2025-01-23 21:37:27.278392+00'),
	('8a7bbb0e-8cfa-4ff4-9423-fffc56ff0895', 'Dispatcher', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:27.42981+00', '2025-01-23 21:37:27.42981+00'),
	('3df2ab5d-a23e-44bb-878c-d28a63842c9f', 'Shift Supervisor', 'Manager', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:27.621536+00', '2025-01-23 21:37:27.621536+00'),
	('cbcba25e-5e17-4fad-a524-f28b9613ca2e', 'Shift Supervisor', 'Manager', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:27.77436+00', '2025-01-23 21:37:27.77436+00'),
	('c6560298-d632-439e-ac16-d480875c211d', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:27.918522+00', '2025-01-23 21:37:27.918522+00'),
	('80fadb13-fec8-4e6c-baa8-24a03907852d', 'Shift Supervisor', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:28.095144+00', '2025-01-23 21:37:28.095144+00'),
	('550e9af3-e044-49a9-87d6-942cd58bbb39', 'Management', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:28.244498+00', '2025-01-23 21:37:28.244498+00'),
	('74cebaf2-3a4d-4371-8f1d-43a9afb27cd0', 'Shift Supervisor', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:28.448394+00', '2025-01-23 21:37:28.448394+00'),
	('44d108fe-1a71-4e6a-bb6d-4b21978a9637', 'Dispatcher', 'Manager', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:28.60336+00', '2025-01-23 21:37:28.60336+00'),
	('12500126-382b-4247-b598-8dea9be1e3b4', 'Dispatcher', 'Manager', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:28.760227+00', '2025-01-23 21:37:28.760227+00'),
	('237aee4c-77dd-45db-8592-7ddac4bb63f8', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:28.90596+00', '2025-01-23 21:37:28.90596+00'),
	('b6ca461a-506d-45f0-954b-9ba0746c8ea5', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:29.079335+00', '2025-01-23 21:37:29.079335+00'),
	('96cba30b-41c9-4b34-85e6-dbf682902d0a', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:29.236478+00', '2025-01-23 21:37:29.236478+00'),
	('bc91fbeb-acc6-4100-9e05-da662ebbdff7', 'Management', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:29.385072+00', '2025-01-23 21:37:29.385072+00'),
	('790ba4d6-8326-47f2-92c2-ff666a3a8575', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:29.548595+00', '2025-01-23 21:37:29.548595+00'),
	('0b45d8fb-8218-481a-b9eb-725726617ebd', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:29.734588+00', '2025-01-23 21:37:29.734588+00'),
	('cea4b801-55f9-40fc-bc53-64c529eafc13', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:29.892161+00', '2025-01-23 21:37:29.892161+00'),
	('c7567c74-d25a-47a8-88a5-4a901b4ae27b', 'Dispatcher', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:30.049509+00', '2025-01-23 21:37:30.049509+00'),
	('16994703-c64b-4fd6-8cc3-635be73d6965', 'Shift Supervisor', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:30.199133+00', '2025-01-23 21:37:30.199133+00'),
	('b62e51ba-0b92-47d2-abdc-c01b138740ab', 'Shift Supervisor', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:30.385931+00', '2025-01-23 21:37:30.385931+00'),
	('3e2aab1f-2378-40fb-9d3f-c8630ac1a2d0', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:30.551037+00', '2025-01-23 21:37:30.551037+00'),
	('ff5ade2d-b38e-4ca5-af1a-7499cbd6d927', 'Shift Supervisor', 'Admin', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:30.726788+00', '2025-01-23 21:37:30.726788+00'),
	('3d721bc7-8ff4-40db-b3a2-7e25a66687fb', 'Shift Supervisor', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:30.888234+00', '2025-01-23 21:37:30.888234+00'),
	('09890293-ba41-4217-b7fa-b01211a411e6', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:31.0716+00', '2025-01-23 21:37:31.0716+00'),
	('4bfe7200-8a91-4de0-a2c6-2d24720957db', 'Shift Supervisor', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:31.221211+00', '2025-01-23 21:37:31.221211+00'),
	('c7af35f6-8dd7-40c8-a2a3-ed85ad328652', 'Dispatcher', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:31.367974+00', '2025-01-23 21:37:31.367974+00'),
	('4de8ad00-b770-43d3-adee-6bdb8439c0ab', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:31.533321+00', '2025-01-23 21:37:31.533321+00'),
	('7bd029c6-0e12-43ca-9075-77fc7105c6ad', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:31.690699+00', '2025-01-23 21:37:31.690699+00'),
	('4a211ea0-1e34-42b9-9ed0-341b3bc6beff', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:31.856858+00', '2025-01-23 21:37:31.856858+00'),
	('45b1ed80-37d5-4467-910e-f713ee1384cb', 'Shift Supervisor', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:32.005818+00', '2025-01-23 21:37:32.005818+00'),
	('62ea7b0e-9db1-47a5-9e55-4d311293bcac', 'Dispatcher', 'Manager', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:32.158897+00', '2025-01-23 21:37:32.158897+00'),
	('13edf723-2892-4122-9aca-0d961de78077', 'Shift Supervisor', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:32.309627+00', '2025-01-23 21:37:32.309627+00'),
	('69ffce4c-f6ee-49ac-87c5-bc6f59f771ca', 'Shift Supervisor', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:32.481111+00', '2025-01-23 21:37:32.481111+00'),
	('3e90610b-6f4a-43c9-a73a-1f71ef5c6b74', 'Shift Supervisor', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:32.64276+00', '2025-01-23 21:37:32.64276+00'),
	('f3fa98b5-f6c0-4f2c-bdb4-30cd747c87ec', 'Management', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:32.78736+00', '2025-01-23 21:37:32.78736+00'),
	('5c0ed845-d52c-4d25-8486-ed017b6f60a1', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:32.938221+00', '2025-01-23 21:37:32.938221+00'),
	('5c52a054-3d67-48c3-9fa9-1d89f59cc763', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:33.126377+00', '2025-01-23 21:37:33.126377+00'),
	('99a22969-6322-4abd-a341-9b9da475717a', 'Management', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:33.279351+00', '2025-01-23 21:37:33.279351+00'),
	('354d2bb4-1745-4780-8ad0-f2a59bd5c1e0', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:33.436042+00', '2025-01-23 21:37:33.436042+00'),
	('2e88a784-d5b1-4ef4-ac96-dcfab869849f', 'Shift Supervisor', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:33.594947+00', '2025-01-23 21:37:33.594947+00'),
	('c5857e55-9b30-43bb-9c79-1d5e07f99189', 'Dispatcher', 'Employee', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:37:33.747875+00', '2025-01-23 21:37:33.747875+00'),
	('864e5816-b415-489d-87cc-c4dd3a37d34b', 'Shift Supervisor', 'Employee', 40, 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '2025-01-23 21:37:33.98399+00', '2025-01-23 21:37:33.98399+00'),
	('c2297db5-9b39-440a-b545-38e2c036ee7c', 'Dispatcher', 'Employee', 40, '335afe36-804d-4722-88bf-4066798ffbfb', '2025-01-23 21:37:34.149059+00', '2025-01-23 21:37:34.149059+00'),
	('ab0414a0-8107-4b5b-87d2-ec283d9b9650', 'Dispatcher', 'Employee', 40, 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '2025-01-23 21:37:34.301139+00', '2025-01-23 21:37:34.301139+00'),
	('ace54a5c-0347-4b22-8e3d-63216ad59460', 'Management', 'Admin', 40, '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '2025-01-23 21:38:08.33795+00', '2025-01-23 21:38:08.33795+00');


--
-- Data for Name: shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--

INSERT INTO "public"."shifts" ("id", "shift_type_id", "start_time", "end_time", "duration_hours", "created_at", "updated_at") VALUES
	('c3c704eb-9141-4dc2-9c30-0c8cf0ccd125', '335afe36-804d-4722-88bf-4066798ffbfb', '05:00:00', '09:00:00', 4, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('4a406628-b04c-4655-a120-56463d6bde2f', '335afe36-804d-4722-88bf-4066798ffbfb', '05:00:00', '15:00:00', 10, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('e416ea91-50c4-423d-91cb-2c5c6d201035', '335afe36-804d-4722-88bf-4066798ffbfb', '05:00:00', '17:00:00', 12, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('bb325d83-8b24-435e-892d-7045577123ea', 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '09:00:00', '13:00:00', 4, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('039fcc09-7ad6-4916-84c6-f3f863abd70b', '335afe36-804d-4722-88bf-4066798ffbfb', '09:00:00', '19:00:00', 10, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('0946c396-efd1-48c9-bcdd-036a2f2412d0', 'a0bb0dda-bc73-4126-ac66-5d331f0fac27', '09:00:00', '21:00:00', 12, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('7f684e9e-131e-48b3-b0bb-d05253e2c596', '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '13:00:00', '17:00:00', 4, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('328dde8b-c812-4cc8-a9ee-63ae8f1e45fa', '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '15:00:00', '01:00:00', 10, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('174a20bc-b5de-4b9e-aebd-1497a2a77187', '7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd', '15:00:00', '03:00:00', 12, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('1590a218-46b6-4395-b98a-c68568c90722', 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '01:00:00', '05:00:00', 4, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('af6de1b1-935e-40d6-b97f-cc196b93b222', 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '19:00:00', '05:00:00', 10, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00'),
	('f1d6c3ba-cfd4-4d8a-93db-9543edff9fd8', 'ebb9a736-caad-443d-81c8-4d3d9f7a4dc1', '17:00:00', '05:00:00', 12, '2025-01-23 21:34:22.588339+00', '2025-01-23 21:34:22.588339+00');


--
-- Data for Name: schedules; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: assigned_shifts; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: staffing_requirements; Type: TABLE DATA; Schema: public; Owner: postgres
--

-- Initial staffing requirements
INSERT INTO public.staffing_requirements (period_name, start_time, end_time, minimum_employees, shift_supervisor_required)
VALUES
  ('Early Morning', '06:00:00', '10:00:00', 3, true),
  ('Morning', '10:00:00', '14:00:00', 4, true),
  ('Afternoon', '14:00:00', '18:00:00', 4, true),
  ('Evening', '18:00:00', '22:00:00', 3, true),
  ('Night', '22:00:00', '02:00:00', 2, true),
  ('Late Night', '02:00:00', '06:00:00', 2, true);


--
-- Data for Name: time_off_requests; Type: TABLE DATA; Schema: public; Owner: postgres
--



--
-- Data for Name: buckets; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
--

INSERT INTO "storage"."buckets" ("id", "name", "owner", "created_at", "updated_at", "public", "avif_autodetection", "file_size_limit", "allowed_mime_types", "owner_id") VALUES
	('avatars', 'avatars', NULL, '2025-01-22 20:48:37.996997+00', '2025-01-22 20:48:37.996997+00', false, false, NULL, NULL, NULL);


--
-- Data for Name: objects; Type: TABLE DATA; Schema: storage; Owner: supabase_storage_admin
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

SELECT pg_catalog.setval('"auth"."refresh_tokens_id_seq"', 2, true);


--
-- Name: key_key_id_seq; Type: SEQUENCE SET; Schema: pgsodium; Owner: supabase_admin
--

SELECT pg_catalog.setval('"pgsodium"."key_key_id_seq"', 1, false);


--
-- PostgreSQL database dump complete
--

RESET ALL;
