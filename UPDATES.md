WE MUST KEEP THE DETAIL OF THIS DOCUMENT INTACT. DO NOT DELETE ANYTHING.

# 911 Dispatch App Notes

### Employee shift\_types with sub duration options:

Day Shift Early   
5:00 AM \- 9:00 AM (4 hours)  
5:00 AM \- 3:00 PM (10 hours)  
5:00 AM \- 5:00 PM (12 hours)

Day Shift  
9:00 AM \- 1:00 PM (4 hours)  
9:00 AM \- 7:00 PM (10 hours)  
9:00 AM \- 9:00 PM (12 hours)

Swing Shift  
1:00 PM \- 5:00 PM (4 hours)  
3:00 PM \- 1:00 AM (10 hours)  
3:00 PM \- 3:00 AM (12 hours)

Graveyards  
1:00 AM \- 5:00 AM (4 hours)  
7:00 PM \- 5:00 AM (10 hours)  
5:00 PM \- 5:00 AM (12 hours)

### staffing\_requirements:

5 AM \- 9 AM: 6 employees (1 supervisor)  
9 AM \- 9 PM: 8 employees (1 supervisor)  
9 PM \- 1 AM: 7 employees (1 supervisor)  
1 AM \- 5 AM: 6 employees (1 supervisor)

### Shift Definitions:

Multiple shift\_types with varying durations and times of individual shifts, some crossing midnight.

### Employee Patterns:

Pattern A: 4 × 10-hour shifts on consecutive days (Total: 40 hours/week)  
Pattern B: 3 × 12-hour shifts \+ 1 × 4-hour shift on consecutive days (Total: 40 hours/week)

### Additional Constraints:

No employee should exceed 40 hours per week unless manually approved.  
Supervisors must be present in each time block.

### assigned\_shifts:

The assigned shifts table should contain each individual shift each employee is assigned.   
Schedules table should be the larger 4 month period that contains the multiple individually assigned shifts. 

###  Scheduling Variables:

There are a lot of variables to consider when creating a schedule:

I need to create a schedule that provides 24/7 coverage for a 911 dispatch center. Minimum staffing requirements must be met for specific staffing requirements time periods. There should be at 1 shift supervisor per staffing requirements time period. There must be at least 6 employees starting at 5 am until 9 am. there must be at least 8 employees at 9 am until 9 pm. there must be at least 7 employees at 9 am until 1 am. there must be at least 6 employees at 1 am until 5 am. Some shifts cross midnight and partially fulfill staffing requirements for 2 separate days.

Employees should be scheduled for 40 hours a week. No employee should be scheduled for more than 40 hours a week unless manually approved by a manager. Employee shifts should fall on consecutive days during the same default shift time each day. Employees can have Either four 10 hour shifts on consecutive days or three 12 hour shifts and one 4 hour on consecutive days. (3+1 should have 3 12 hours for the same shift on 3 consecutive days and one 4 hour shift that is the closest in time to their 12 hour shifts)

schedules are in 4 month blocks, some shifts might also span the end of one schedule into the beginning of the next.

The employees assigned shifts need to take into consideration any time off requests the employees have submitted. Do not schedule an employee during an approved time off period. try to avoid scheduling the employee during a requested but not yet approved time off period but can schedule the employee during that period if we can't meet staffing requirements without them.

We will need an assigned-shifts table in the db to track assigned-shifts individual employees are assigned to per day.

The Shifts do not have a minimum required number of assigned workers

Supervisor requirement flag, and Minimum employee count should exist in the staffing requirements table not the shifts table.

Please think of all the logic to fulfill these requirements.

Please think of all the necessary variables, tables or db columns needed to fulfill the scheduling with the above terms.

Employee default shift\_types with shifts options:

Day Shift Early   
5:00 AM \- 9:00 AM (4 hours)  
5:00 AM \- 3:00 PM (10 hours)  
5:00 AM \- 5:00 PM (12 hours)

Day Shift  
9:00 AM \- 1:00 PM (4 hours)  
9:00 AM \- 7:00 PM (10 hours)  
9:00 AM \- 9:00 PM (12 hours)

Swing Shift  
1:00 PM \- 5:00 PM (4 hours)  
3:00 PM \- 1:00 AM (14 hours)  
3:00 PM \- 3:00 AM (12 hours)

Graveyards  
1:00 AM \- 5:00 AM (4 hours)  
7:00 PM \- 5:00 AM (14 hours)  
5:00 PM \- 5:00 AM (12 hours)

staffing\_requirements per day:

5 AM \- 9 AM: 6 employees (1 supervisor)  
9 AM \- 9 PM: 8 employees (1 supervisor)  
9 PM \- 1 AM: 7 employees (1 supervisor)  
1 AM \- 5 AM: 6 employees (1 supervisor)

Shift Definitions:  
Multiple shifts with varying durations and times, some crossing midnight.

Employee Patterns:  
Pattern A: 4 × 10-hour shifts on consecutive days (Total: 40 hours/week)  
Pattern B: 3 × 12-hour shifts \+ 1 × 4-hour shift on consecutive days (Total: 40 hours/week)

Additional Constraints:  
No employee should exceed 40 hours per week unless manually approved.  
A schedule should span 4 months. Each employee should have the same days scheduled each week for the entire 4 month block unless time\_off\_requests conflict.

Create test data for schedules and assigned\_shifts so we can build out the schedule creation process.  

 **High-Level Scheduling Strategy**

To meet these requirements, the scheduling process can be broken down into the following phases:

	1\.	**Data Preparation:**

	•	Organize shifts and their corresponding time blocks.

	•	Categorize employees based on their patterns and availability.

	2\.	**Shift Assignment:**

	•	Assign shifts to employees based on their chosen patterns.

	•	Ensure that each shift assignment adheres to the staffing and supervisory requirements.

	3\.	**Coverage Validation:**

	•	After assignments, validate that each staffing\_requirements time block meets the required staffing levels.

	•	Adjust assignments if coverage gaps are detected.

	4\.	**Handling Edge Cases:**

	•	Manage shifts that span two bi-weekly schedules.

	•	Ensure consecutive day patterns are maintained without overlap or gaps.

Scheduling Algorithm:

	

Okay, this is a complex scheduling problem, but we can break it down into manageable steps. Here's a detailed analysis of the logic, variables, database schema, and test data generation strategy.

**1\. Scheduling Logic and Constraints**

Let's outline the core logic and constraints we need to satisfy:

**1.1. Core Requirements:**

* **24/7 Coverage:** The dispatch center must be staffed at all times.  
* **Minimum Staffing:** Each time period has minimum staffing requirements (including at least one supervisor).  
  * 5 AM \- 9 AM: 6 employees (1 supervisor)  
  * 9 AM \- 9 PM: 8 employees (1 supervisor)  
  * 9 PM \- 1 AM: 7 employees (1 supervisor)  
  * 1 AM \- 5 AM: 6 employees (1 supervisor)  
* **Shift Types:** Employees have default shift types, which dictate the available shifts they can be assigned to.  
* **Employee Patterns:** Employees follow one of two patterns:  
  * Pattern A: 4 consecutive 10-hour shifts.  
  * Pattern B: 3 consecutive 12-hour shifts \+ 1 4-hour shift (closest in time to the 12-hour shifts) on consecutive days.  
* **40-Hour Limit:** Employees should not be scheduled for more than 40 hours per week without manual override (manager approval).  
* **4-Month Schedule:** The schedule spans four months, with consistent weekly patterns for each employee.  
* **Time Off:**  
  * Approved time off requests must be respected.  
  * Pending time off requests should be avoided if possible, but can be overridden to meet staffing needs.  
* **Shift Continuity:** Employees should generally work the same shift type (e.g., "Day Shift Early") on their scheduled days.

**1.2. Scheduling Algorithm Considerations:**

* **Priority:** Meeting the minimum staffing requirements for each time period is the highest priority.  
* **Supervisor Coverage:** Ensure at least one supervisor is scheduled during each time period.  
* **Employee Availability:** Consider employee's default shift types and time off requests.  
* **Pattern Adherence:** Attempt to schedule employees according to their assigned pattern (4x10 or 3x12+1x4).  
* **Fairness:** Distribute shifts and any necessary overtime as fairly as possible among employees.  
* **Flexibility:** Allow for manual adjustments by managers.  
* **Optimization:** The algorithm should aim to minimize the number of unfulfilled staffing requirements and the amount of overtime.

**2\. Variables and Data Structures**

**2.1. Database Tables and Columns (Updated):**

* employees:  
  * id (UUID, Primary Key)  
  * employee\_role (ENUM: 'Dispatcher', 'Shift Supervisor', 'Management')  
  * user\_role (ENUM: 'Employee', 'Manager', 'Admin')  
  * weekly\_hours\_scheduled (INT) \- Target hours (default 40, can be overridden by manager)  
  * default\_shift\_type\_id (UUID, Foreign Key to shift\_types)  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
  * employee\_pattern (ENUM: '4x10', '3x12\_1x4') \- Added to specify the employee's work pattern  
* profiles: (This table remains unchanged)  
* shift\_types:  
  * id (UUID, Primary Key)  
  * name (TEXT, Unique) \- e.g., "Day Shift Early", "Day Shift", "Swing Shift", "Graveyard"  
  * description (TEXT, nullable)  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
* shifts:  
  * id (UUID, Primary Key)  
  * shift\_type\_id (UUID, Foreign Key to shift\_types)  
  * start\_time (TIME)  
  * end\_time (TIME)  
  * duration\_hours (INTEGER) \- Stored to simplify querying for schedules  
  * duration\_category (ENUM: '4 hours', '10 hours', '12 hours') \- Added for filtering based on duration  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
* schedules**:**  
  * id (UUID, Primary Key) \- Auto-generated UUID  
  * employee\_id (UUID, Foreign Key to employees)  
  * shift\_id (UUID, Foreign Key to shifts)  
  * date (DATE) \- The date of the scheduled shift  
  * schedule\_status (ENUM: 'Draft', 'Published') \- Updated to remove the Pending status  
  * week\_start\_date (DATE) \- The start date of the week (Monday)  
  * day\_of\_week (ENUM: 'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday') \- Day of the week  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
* time\_off\_requests:  
  * id (UUID, Primary Key)  
  * employee\_id (UUID, Foreign Key to employees)  
  * start\_date (DATE)  
  * end\_date (DATE)  
  * type (ENUM: 'Vacation', 'Sick', 'Personal', 'Training')  
  * status (ENUM: 'Pending', 'Approved', 'Declined')  
  * notes (TEXT, nullable)  
  * reviewed\_by (UUID, nullable, Foreign Key to employees) \- Manager who reviewed  
  * reviewed\_at (TIMESTAMPTZ, nullable)  
  * submitted\_at (TIMESTAMPTZ)  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
* staffing\_requirements:  
  * id (UUID, Primary Key)  
  * period\_name (TEXT) \- e.g., "Early Morning", "Day", "Evening", "Night"  
  * start\_time (TIME)  
  * end\_time (TIME)  
  * minimum\_employees (INTEGER)  
  * shift\_supervisor\_required (BOOLEAN) \- Added to indicate if a supervisor is needed  
  * created\_at (TIMESTAMPTZ)  
  * updated\_at (TIMESTAMPTZ)  
* shift\_patterns: (No changes needed)  
* employee\_patterns: (No changes needed)  
* daily\_coverage: (No changes needed)

**2.2. Additional Variables**

* currentDate: The date for which the schedule is being generated.  
* weekStartDate: The start date of the week (Monday) for the schedule.  
* fourMonthStartDate: The start date of the 4-month scheduling block.  
* fourMonthEndDate: The end date of the 4-month scheduling block.

**3\. Scheduling Algorithm**

Here's a high-level outline of the scheduling algorithm:

1. **Initialization:**

   * Fetch all employees, their default shift types, assigned patterns, and time off requests.  
   * Fetch all shift types and their associated shifts.  
   * Fetch staffing requirements.  
2. **4-Month Schedule Loop:**

   * Iterate through each week of the 4-month block.  
   * Iterate through each day of the week.  
3. **Daily Scheduling:**

   * **Get Staffing Requirements:** Determine the minimum number of employees and supervisors needed for each time period on the current day.  
   * **Get Available Employees:** Filter employees based on:  
     * Not having approved time off on the current date.  
     * Pending time off is considered a soft constraint (prioritize employees without pending time off).  
   * **Assign Supervisors:**  
     * Prioritize employees with employee\_role as 'Shift Supervisor' and matching default shift type.  
     * If no supervisors are available, elevate a 'Dispatcher' (if allowed by policy).  
   * **Assign Employees:**  
     * Prioritize employees whose default shift type matches the current time period.  
     * Prioritize employees based on their assigned pattern to ensure consecutive days are scheduled together.  
     * Consider weekly hours scheduled to avoid exceeding 40 hours without approval.  
     * If staffing requirements cannot be met, consider employees with pending time off or allow overtime (with manager override flag).  
   * **Create** schedules **Records:** For each assigned employee, create a record in the schedules table with the corresponding employee ID, shift ID, date, and status ('Draft').  
4. **Review and Publish:**

   * Allow managers to review the generated schedule.  
   * Provide options to manually adjust assignments.  
   * Implement a "publish" action to finalize the schedule (change the status in schedules to 'Published').

**4\. Test Data Generation**

**4.1. Sample Data for** shift\_types**:**

| id | name | description |
| ----- | ----- | ----- |
| 335afe36-804d-4722-88bf-4066798ffbfb | Day Shift Early | Early morning shift starting at 5 AM |
| a0bb0dda-bc73-4126-ac66-5d331f0fac27 | Day Shift | Standard day shift starting at 9 AM |
| 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | Swing Shift | Afternoon to evening shift |
| ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | Graveyard | Overnight shift |

**4.2. Sample Data for** shifts**:**

| id | shift\_type\_id | start\_time | end\_time | duration\_hours | duration\_category |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 335afe36-804d-4722-88bf-4066798ffbfb | 05:00 | 09:00 | 4 | 4 hours |
| 123e4567-e89b-12d3-a456-426614174000 | 335afe36-804d-4722-88bf-4066798ffbfb | 05:00 | 15:00 | 10 | 10 hours |
| 2b2e4e67-e89b-12d3-a456-426614174000 | 335afe36-804d-4722-88bf-4066798ffbfb | 05:00 | 17:00 | 12 | 12 hours |
| 456f4567-e89b-12d3-a456-426614174000 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 09:00 | 13:00 | 4 | 4 hours |
| 567g4567-e89b-12d3-a456-426614174000 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 09:00 | 19:00 | 10 | 10 hours |
| 678h4567-e89b-12d3-a456-426614174000 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 09:00 | 21:00 | 12 | 12 hours |
| 789i4567-e89b-12d3-a456-426614174000 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 13:00 | 17:00 | 4 | 4 hours |
| 890j4567-e89b-12d3-a456-426614174000 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 15:00 | 01:00 | 10 | 10 hours |
| 901k4567-e89b-12d3-a456-426614174000 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 15:00 | 03:00 | 12 | 12 hours |
| 012l4567-e89b-12d3-a456-426614174000 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 01:00 | 05:00 | 4 | 4 hours |
| 123m4567-e89b-12d3-a456-426614174000 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 19:00 | 05:00 | 10 | 10 hours |
| 234n4567-e89b-12d3-a456-426614174000 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 17:00 | 05:00 | 12 | 12 hours |

**4.3. Sample Data for** staffing\_requirements**:**

| id | period\_name | start\_time | end\_time | minimum\_employees | shift\_supervisor\_required |
| ----- | ----- | ----- | ----- | ----- | ----- |
| f47ac10b-58cc-4372-a567-0e02b2c3d479 | Early Morning | 05:00 | 09:00 | 6 | true |
| c723b72e-9a48-437d-b621-5f78b2c7a1b4 | Day | 09:00 | 21:00 | 8 | true |
| a894b89f-d9f3-4f9e-b753-7f12f8b5b5a2 | Evening | 21:00 | 01:00 | 7 | true |
| 7e18e8d2-a672-4c1f-b30f-9e34d9a4c8e1 | Night | 01:00 | 05:00 | 6 | true |

**4.4. Sample Data for** employees**:**

| id | employee\_role | user\_role | weekly\_hours\_scheduled | default\_shift\_type\_id | employee\_pattern |
| ----- | ----- | ----- | ----- | ----- | ----- |
| d6eb4636-951b-4f27-9736-75d597d75d97 | Shift Supervisor | Manager |  |  |  |

| id | employee\_role | user\_role | weekly\_hours\_scheduled | default\_shift\_type\_id | employee\_pattern |
| ----- | ----- | ----- | ----- | ----- | ----- |
| d6eb4636-951b-4f27-9736-75d597d75d97 | Shift Supervisor | Manager | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | Dispatcher | Employee | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | Dispatcher | Employee | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | Dispatcher | Employee | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | Dispatcher | Employee | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | Dispatcher | Employee | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | Dispatcher | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | Dispatcher | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 3x12\_1x4 |
| e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 4x10 |
| b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 4x10 |
| d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 4x10 |
| f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | Dispatcher | Employee | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 4x10 |
| a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | Shift Supervisor | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 3x12\_1x4 |
| c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | Shift Supervisor | Employee | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 3x12\_1x4 |
| e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | Shift Supervisor | Employee | 40 | 335afe36-804d-4722-88bf-4066798ffbfb | 3x12\_1x4 |
| a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | Shift Supervisor | Employee | 40 | 335afe36-804d-4722-88bf-4066798ffbfb | 3x12\_1x4 |
| 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | Shift Supervisor | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | Shift Supervisor | Employee | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 3x12\_1x4 |
| f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | Admin | Admin | 40 | a0bb0dda-bc73-4126-ac66-5d331f0fac27 | 4x10 |
| 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | Admin | Admin | 40 | b1cc1eeb-cd84-5237-bd77-6e442f1fbd38 | 4x10 |
| 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | Admin | Admin | 40 | 7d924e7d-fd2f-4a3c-9ed2-0da5f956cfdd | 4x10 |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | Admin | Admin | 40 | ebb9a736-caad-443d-81c8-4d3d9f7a4dc1 | 4x10 |

**4.5. Sample Data for** profiles**:**

| id | full\_name | username |
| ----- | ----- | ----- |
| d6eb4636-951b-4f27-9736-75d597d75d97 | Shift Supervisor 1 | supervisor1 |
| f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | Dispatcher 1 | dispatcher1 |
| 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | Dispatcher 2 | dispatcher2 |
| 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | Dispatcher 3 | dispatcher3 |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | Dispatcher 4 | dispatcher4 |
| 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | Dispatcher 5 | dispatcher5 |
| 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | Dispatcher 6 | dispatcher6 |
| a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | Dispatcher 7 | dispatcher7 |
| 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | Dispatcher 8 | dispatcher8 |

| id | full\_name | username |
| ----- | ----- | ----- |
| 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | Dispatcher 9 | dispatcher9 |
| 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | Dispatcher 10 | dispatcher10 |
| f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | Dispatcher 11 | dispatcher11 |
| 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | Dispatcher 12 | dispatcher12 |
| 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | Dispatcher 13 | dispatcher13 |
| 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | Dispatcher 14 | dispatcher14 |
| 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | Dispatcher 15 | dispatcher15 |
| 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | Dispatcher 16 | dispatcher16 |
| c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | Dispatcher 17 | dispatcher17 |
| 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | Dispatcher 18 | dispatcher18 |
| 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | Dispatcher 19 | dispatcher19 |
| 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | Dispatcher 20 | dispatcher20 |
| 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | Dispatcher 21 | dispatcher21 |
| 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | Dispatcher 22 | dispatcher22 |
| d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | Dispatcher 23 | dispatcher23 |
| e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | Dispatcher 24 | dispatcher24 |
| b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | Dispatcher 25 | dispatcher25 |
| d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | Dispatcher 26 | dispatcher26 |
| f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | Dispatcher 27 | dispatcher27 |
| a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | Shift Supervisor 2 | supervisor2 |
| c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | Shift Supervisor 3 | supervisor3 |
| e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | Shift Supervisor 4 | supervisor4 |
| a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | Shift Supervisor 5 | supervisor5 |
| 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | Shift Supervisor 6 | supervisor6 |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | Shift Supervisor 7 | supervisor7 |
| f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | Admin 1 | admin1 |
| 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | Admin 2 | admin2 |
| 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | Admin 3 | admin3 |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | Admin 4 | admin4 |

**4.6. Sample Data for** employee\_patterns**:**

| employee\_id | pattern\_id | start\_date | end\_date | rotation\_start\_date |
| ----- | ----- | ----- | ----- | ----- |
| d6eb4636-951b-4f27-9736-75d597d75d97 | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |

| employee\_id | pattern\_id | start\_date | end\_date | rotation\_start\_date |
| ----- | ----- | ----- | ----- | ----- |
| a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |

**4.7. Sample Data for** schedules**:**

Let's create some schedules for the first week of the 4-month block, starting **Monday, January 1, 2025**. This will include a mix of employees, shift types, and patterns to illustrate how the logic works.

**Week:** 2025-01-01 to 2025-01-07

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_01 | d6eb4636-951b-4f27-9736-75d597d75d97 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_02 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_03 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_04 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_05 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_06 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_07 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_08 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_09 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_10 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_11 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_12 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_13 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_14 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_15 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_16 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_17 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_18 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_19 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_20 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_21 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_22 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_23 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_24 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_25 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_26 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_27 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_28 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_29 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-1 |  |

**4.6. Sample Data for** employee\_patterns **(continued):**

| employee\_id | pattern\_id | start\_date | end\_date | rotation\_start\_date |
| ----- | ----- | ----- | ----- | ----- |
| a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | (3x12\_1x4 ID) | '2024-01-01' | NULL | '2024-01-01' |
| f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |
| 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | (4x10 ID) | '2024-01-01' | NULL | '2024-01-01' |

**4.7. Sample Data for** schedules **(continued):**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_01 | d6eb4636-951b-4f27-9736-75d597d75d97 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_02 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_03 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_04 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_05 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_06 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_07 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_08 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_09 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_10 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_11 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_12 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_13 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_14 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_15 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_16 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_17 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_18 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_19 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_20 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_21 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_22 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_23 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_24 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_25 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_26 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_27 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_28 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_29 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_30 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 567g4567-e89b-12d3-a456-4 |  |  |  |  |

**4.7. Sample Data for** schedules **(continued):**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_30 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_31 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_32 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_33 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_34 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_35 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_36 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_37 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |
| uuid\_38 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-01 | Draft | 2024-12-30 | Monday |

**(Note:** The table above shows schedules for Monday. You'll need to create similar entries for Tuesday \- Sunday, following employee patterns and respecting time-off requests. I'll continue generating a few more days as an example.)

**Tuesday, 2025-01-02**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_39 | d6eb4636-951b-4f27-9736-75d597d75d97 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_40 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_41 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_42 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_43 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_44 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_45 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_46 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_47 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_48 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_49 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_50 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_51 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_52 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_53 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_54 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_55 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_56 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_57 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_58 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_59 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_60 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_61 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_62 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_63 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |

**4.7. Sample Data for** schedules **(continued):**

**Tuesday, 2025-01-02 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_64 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_65 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_66 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_67 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_68 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_69 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_70 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_71 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_72 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_73 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_74 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_75 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |
| uuid\_76 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-02 | Draft | 2024-12-30 | Tuesday |

**Wednesday, 2025-01-03**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_77 | d6eb4636-951b-4f27-9736-75d597d75d97 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_78 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_79 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_80 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_81 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_82 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_83 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_84 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_85 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_86 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_87 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_88 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_89 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_90 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_91 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_92 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_93 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_94 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_95 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_96 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_97 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_98 | 9a0b1c2d-3e4f-5a6b-7c8d-9e |  |  |  |  |  |

**4.7. Sample Data for** schedules **(continued):**

**Wednesday, 2025-01-03 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_99 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_100 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_101 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_102 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_103 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_104 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_105 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_106 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_107 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_108 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_109 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_110 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_111 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_112 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_113 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |
| uuid\_114 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-03 | Draft | 2024-12-30 | Wednesday |

**Thursday, 2025-01-04**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_115 | d6eb4636-951b-4f27-9736-75d597d75d97 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_116 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_117 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_118 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_119 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_120 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_121 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_122 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_123 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_124 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_125 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_126 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_127 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_128 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_129 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_130 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_131 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_132 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_133 | 3a4b5c6d-7e8f-9a0b-1c2 |  |  |  |  |  |

**4.7. Sample Data for** schedules **(continued):**

**Thursday, 2025-01-04 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_133 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_134 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_135 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_136 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_137 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_138 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_139 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_140 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_141 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_142 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_143 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_144 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_145 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_146 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_147 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_148 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_149 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_150 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_151 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |
| uuid\_152 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-04 | Draft | 2024-12-30 | Thursday |

**Friday, 2025-01-05**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_153 | d6eb4636-951b-4f27-9736-75d597d75d97 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_154 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_155 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_156 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_157 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_158 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_159 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_160 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_161 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_162 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_163 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_164 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_165 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_166 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_167 | 6d7e8f9a-0b1c-2d3e-4f |  |  |  |  |  |

**4.7. Sample Data for** schedules **(continued):**

**Friday, 2025-01-05 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_167 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_168 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_169 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_170 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_171 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_172 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_173 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_174 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_175 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_176 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_177 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_178 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_179 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-05 | Draft | 2024-12-30 | Friday |
| uuid\_180 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-05 | Draft | 2024-12-30 | Friday |

**Notes on the Sample Schedule Data:**

* The generated id values are placeholders. In a real database, these would be automatically generated UUIDs.  
* The week\_start\_date is set to '2024-12-30' for all entries in this example, representing the Monday of the first week of the schedule.  
* The provided schedule covers three days (Monday, Tuesday, Wednesday, and Thursday) of the first week. You would need to extend this to cover all 7 days of the week and the entire 4-month period.  
* Employee assignments are distributed across different shift types and days, based on their patterns.  
* The schedule\_status is set to 'Draft' for all entries, indicating that this is a generated draft schedule.  
* It is assumed that the necessary shift\_id and employee\_id values exist in the shifts and employees tables respectively.

**4.8. Sample Data for** time\_off\_requests**:**

| id | employee\_id | start\_date | end\_date | type | status | notes | reviewed\_by | reviewed\_at |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 8e4c2a1b-7d6f-4e5a-9b0c-1d2e3f4a5b6c | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | '2025-01-01' | '2025-01-03' | 'Vacation' | 'Approved' | 'Family vacation' |  |  |
| 6a5b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | '2025-01-15' | '2025-01-15' | 'Sick' | 'Approved' | 'Flu' |  |  |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | '2025-01-22' | '2025-01-24' | 'Training' | 'Pending' | 'Mandatory company training' |  |  |
| 2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | '2025-01-29' | '2025-01-31' | 'Vacation' | 'Declined' | 'Insufficient staffing during that week' |  |  |
| 0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d | d6eb4636-951b-4f27-9736-75d597d75d97 | '2025-02-05' | '2025-02-09' | 'Personal' | 'Approved' | 'Moving to a new house' |  |  |
| 8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | '2025-02-12' | '2025-02-12' | 'Sick' | 'Pending' | 'Doctor appointment' |  |  |
| 6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | '2025-02-19' | '2025-02-23' | 'Vacation' | 'Approved' | 'Trip to the mountains' |  |  |
| 4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | '2025-02-26' | '2025-02-28' | 'Training' | 'Pending' | 'Advanced dispatch techniques workshop' |  |  |
| 2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | '2025-03-05' | '2025-03-09' | 'Vacation' | 'Approved' | 'Spring break' |  |  |
| 0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | '2025-03-12' | '2025-03-16' | 'Personal' | 'Pending' | 'Family event' |  |  |

**4.9 Sample data for** shift\_patterns**:**

| id | name | pattern\_type | days\_on | days\_off | shift\_duration |
| ----- | ----- | ----- | ----- | ----- | ----- |
| 455d0866-8f64-47d9-9992-375885267938 | 4x10 Standard | '4x10' | 4 | 3 | 10 |
| 7215053d-9e97-423c-b940-61775d5f5471 | 3x12 \+ 1x4 | '3x12\_1x4' | 4 | 3 | 12 |
| 16730431-4f17-46ba-9383-5443a3b2145f | Custom Pattern | 'Custom' | 4 | 3 | 10 |

**Explanation of Test Data and Logic**

* **Shift Types and Shifts:** We have defined four main shift types (Early Day, Day, Swing, Graveyard) and created multiple shift variations (4hr, 10hr, 12hr) within each type. This covers the required durations and time ranges.  
* **Staffing Requirements:** The staffing\_requirements table has entries for each time period (Early Morning, Day, Evening, Night) with the minimum number of employees and the supervisor requirement.  
* **Employees:**  
  * We've created a diverse set of employees with different roles (Dispatcher, Shift Supervisor, Management) and user roles (Employee, Manager, Admin).  
  * Each employee is assigned a default\_shift\_type\_id and an employee\_pattern.  
  * The distribution of employees across shift types and patterns is designed to test the scheduling algorithm's ability to handle various combinations.  
* **Employee Patterns:** The sample data includes two standard patterns (4x10 and 3x12+1x4) and a custom pattern.  
* **Schedules:**  
  * The sample schedules data covers the first three days of the first week (Monday 2025-01-01, Tuesday 2025-01-02, Wednesday 2025-01-03, Thursday 2025-01-04, and Friday 2025-01-05) to demonstrate the initial scheduling logic.  
  * The week\_start\_date is set to '2024-12-30' which is the Monday of that week.  
  * Employees are assigned to shifts based on their default shift types and patterns, attempting to meet the staffing requirements.  
  * Notice that in the schedule provided, not every shift has an employee assigned, this is on purpose to illustrate how understaffing will look like.  
  * Note the use of different UUIDs for id in the schedules table. Each entry should have a unique ID.  
* **Time Off Requests:** Sample time off requests with varying statuses and types are included to test how the algorithm handles conflicts.

**Scheduling Algorithm Steps (Detailed)**

1. **Initialization:**

   * Fetch all relevant data: employees (with default shift types and patterns), shift types, shifts, staffing requirements, and approved/pending time off requests.  
2. **4-Month Schedule Loop:**

   * currentDate \= fourMonthStartDate

   * endDate \= fourMonthStartDate \+ 4 months

   * While currentDate \< endDate  
     **Scheduling Algorithm Steps (Detailed) \- Continued**  
2. **4-Month Schedule Loop (continued):**

   * While currentDate \< endDate  
     * weekStartDate \= getWeekStart(currentDate)  
     * Iterate through each day of the week (Monday to Sunday) using a for loop (e.g., for (let i \= 0; i \< 7; i++))  
       * currentDay \= weekStartDate \+ i days  
       * **Call** generateDailySchedule(currentDay, ...) (see details below)  
       * currentDate \= currentDate \+ 1 day  
3. generateDailySchedule(currentDay, employees, shiftTypes, shifts, staffingRequirements, timeOffRequests)**:**

   * **3.1. Filter Time Off:**

     * Get approved and pending time off requests for currentDay.  
   * **3.2. Determine Staffing Needs:**

     * Iterate through the staffingRequirements.  
     * For each requirement where currentDay falls within the start\_time and end\_time:  
       * Determine the number of employees needed ( requirement.minimum\_employees) and if a supervisor is required (requirement.shift\_supervisor\_required).  
   * **3.3. Employee Assignment Loop:**

     * Iterate through the required time periods (e.g., Early Morning, Day, Evening, Night) based on the staffingRequirements.  
     * For each timePeriod:  
       * **3.3.1. Filter Available Employees:**  
         * Start with all employees.  
         * Remove employees with approved time off for currentDay.  
         * Create a separate list of employees with pending time off for currentDay (these will be considered only if needed).  
         * Filter available employees by default\_shift\_type\_id to match the shifts within the current timePeriod.  
       * **3.3.2. Assign Supervisor:**  
         * If shift\_supervisor\_required is true for the timePeriod:  
           * Filter available employees further to those with employee\_role \= 'Shift Supervisor'.  
           * If a supervisor is found:  
             * Select a supervisor based on the least number of hours scheduled in the current week.  
             * Assign the supervisor to a suitable shift within the timePeriod (consider their default\_shift\_type\_id).  
             * Create a new entry in the schedules table (mark it as 'Draft').  
             * Remove the assigned supervisor from the list of available employees.  
           * If no supervisor is found and policy allows:  
             * Consider promoting a 'Dispatcher' to a supervisor role for this shift (this would require a manual approval/review step).  
             * If promotion is allowed, create the schedules entry, update the employee's role temporarily for that shift, and remove the employee from the available list.  
       * **3.3.3. Assign Employees:**  
         * Sort available employees based on:  
           * Adherence to their assigned pattern (4x10 or 3x12+1x4). Prioritize employees who are on their scheduled days.  
           * Least number of hours scheduled in the current week.  
         * Iterate through the sorted available employees:  
           * If minimum\_employees for the timePeriod is not yet met:  
             * Find a suitable shift within the timePeriod that matches the employee's default\_shift\_type\_id and does not exceed their weekly hour limit (40).  
             * If a suitable shift is found:  
               * Create a new entry in the schedules table.  
               * Remove the employee from the available list.  
             * If no suitable shift is found:  
               * Consider employees with pending time off requests if allowed by policy (needs manual approval).  
               * Consider allowing overtime if allowed by policy (needs manual approval).  
       * **3.3.4. Handle Unmet Requirements:**  
         * If, after assigning employees, the minimum\_employees for the timePeriod is still not met:  
           * Log a warning or create a notification for manual intervention.  
4. **Review and Publish:**

   * Provide an interface for managers to review the generated schedule.  
   * Allow managers to make manual adjustments (add, remove, or modify assignments).  
   * Implement a "publish" mechanism that:  
     * Changes the schedule\_status of all relevant schedules records to 'Published'.  
     * (Optional) Sends notifications to employees about their published schedules.

**5\. Data Model Considerations**

* The provided database schema (with the suggested modifications in step 2.1) is well-structured to support this logic.  
* You'll need to create appropriate indexes to optimize query performance (e.g., indexes on schedules.date, schedules.employee\_id, time\_off\_requests.employee\_id, etc.).  
* Consider adding a shift\_pattern column to the employees table or a separate table (employee\_shift\_patterns) to explicitly define the 4x10 or 3x12+1x4 pattern for each employee. This will make it easier to implement the pattern-based scheduling logic.

**6\. Example Test Data (Continued)**

Let's complete the sample schedule data for the rest of the week (**Saturday, 2025-01-06** and **Sunday, 2025-01-07**)

**Saturday, 2025-01-06**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_181 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_182 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_183 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_184 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_185 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_186 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_187 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_188 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_189 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_190 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_191 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_192 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_193 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_194 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_195 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_196 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_197 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_198 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_199 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_200 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_201 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_202 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_203 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_204 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-1 |  |

**Scheduling Algorithm Steps (Detailed) \- Continued**

2. **4-Month Schedule Loop (continued):**

   * While currentDate \< endDate  
     * weekStartDate \= getWeekStart(currentDate)  
     * Iterate through each day of the week (Monday to Sunday) using a for loop (e.g., for (let i \= 0; i \< 7; i++))  
       * currentDay \= weekStartDate \+ i days  
       * **Call** generateDailySchedule(currentDay, ...) (see details below)  
       * currentDate \= currentDate \+ 1 day  
3. generateDailySchedule(currentDay, employees, shiftTypes, shifts, staffingRequirements, timeOffRequests)**:**

   * **3.1. Filter Time Off:**

     * Get approved and pending time off requests for currentDay.  
   * **3.2. Determine Staffing Needs:**

     * Iterate through the staffingRequirements.  
     * For each requirement where currentDay falls within the start\_time and end\_time:  
       * Determine the number of employees needed ( requirement.minimum\_employees) and if a supervisor is required (requirement.shift\_supervisor\_required).  
   * **3.3. Employee Assignment Loop:**

     * Iterate through the required time periods (e.g., Early Morning, Day, Evening, Night) based on the staffingRequirements.  
     * For each timePeriod:  
       * **3.3.1. Filter Available Employees:**  
         * Start with all employees.  
         * Remove employees with approved time off for currentDay.  
         * Create a separate list of employees with pending time off for currentDay (these will be considered only if needed).  
         * Filter available employees by default\_shift\_type\_id to match the shifts within the current timePeriod.  
       * **3.3.2. Assign Supervisor:**  
         * If shift\_supervisor\_required is true for the timePeriod:  
           * Filter available employees further to those with employee\_role \= 'Shift Supervisor'.  
           * If a supervisor is found:  
             * Select a supervisor based on the least number of hours scheduled in the current week.  
             * Assign the supervisor to a suitable shift within the timePeriod (consider their default\_shift\_type\_id).  
             * Create a new entry in the schedules table (mark it as 'Draft').  
             * Remove the assigned supervisor from the list of available employees.  
           * If no supervisor is found and policy allows:  
             * Consider promoting a 'Dispatcher' to a supervisor role for this shift (this would require a manual approval/review step).  
             * If promotion is allowed, create the schedules entry, update the employee's role temporarily for that shift, and remove the employee from the available list.  
       * **3.3.3. Assign Employees:**  
         * Sort available employees based on:  
           * Adherence to their assigned pattern (4x10 or 3x12+1x4). Prioritize employees who are on their scheduled days.  
           * Least number of hours scheduled in the current week.  
         * Iterate through the sorted available employees:  
           * If minimum\_employees for the timePeriod is not yet met:  
             * Find a suitable shift within the timePeriod that matches the employee's default\_shift\_type\_id and does not exceed their weekly hour limit (40).  
             * If a suitable shift is found:  
               * Create a new entry in the schedules table.  
               * Remove the employee from the available list.  
             * If no suitable shift is found:  
               * Consider employees with pending time off requests if allowed by policy (needs manual approval).  
               * Consider allowing overtime if allowed by policy (needs manual approval).  
       * **3.3.4. Handle Unmet Requirements:**  
         * If, after assigning employees, the minimum\_employees for the timePeriod is still not met:  
           * Log a warning or create a notification for manual intervention.  
4. **Review and Publish:**

   * Provide an interface for managers to review the generated schedule.  
   * Allow managers to make manual adjustments (add, remove, or modify assignments).  
   * Implement a "publish" mechanism that:  
     * Changes the schedule\_status of all relevant schedules records to 'Published'.  
     * (Optional) Sends notifications to employees about their published schedules.

**5\. Data Model Considerations**

* The provided database schema (with the suggested modifications in step 2.1) is well-structured to support this logic.  
* You'll need to create appropriate indexes to optimize query performance (e.g., indexes on schedules.date, schedules.employee\_id, time\_off\_requests.employee\_id, etc.).  
* Consider adding a shift\_pattern column to the employees table or a separate table (employee\_shift\_patterns) to explicitly define the 4x10 or 3x12+1x4 pattern for each employee. This will make it easier to implement the pattern-based scheduling logic.

**6\. Example Test Data (Continued)**

Let's complete the sample schedule data for the rest of the week (**Saturday, 2025-01-06** and **Sunday, 2025-01-07**)

**Saturday, 2025-01-06**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_181 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_182 | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_183 | 8d7c6b5a-4e3f-2d1c-0b9a-8f7e6d5c4b3a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_184 | 6f5e4d3c-2b1a-0f9e-8d7c-6b5a4e3f2d1c | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_185 | 4d3c2b1a-0f9e-8d7c-6b5a-4e3f2d1c0b9a | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_186 | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_187 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_188 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_189 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_190 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_191 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_192 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_193 | 3a4b5c6d-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_194 | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_195 | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_196 | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_197 | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_198 | d3e4f5a6-b7c8-9d0e-1f2a-3b4c5d6e7f8a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_199 | e4f5a6b7-c8d9-0e1f-2a3b-4c5d6e7f8a9b | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_200 | b7c8d9e0-f1a2-3b4c-5d6e-7f8a9b0c1d2e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_201 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_202 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_203 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_204 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-1 |  |

**4.7. Sample Data for** schedules **(continued):**

**Saturday, 2025-01-06 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_205 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 35d58c3e-b844-49c7-85a8-592a5cf6e8b4 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_206 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_207 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_208 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_209 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_210 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_211 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-06 | Draft | 2024-12-30 | Saturday |
| uuid\_212 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-06 | Draft | 2024-12-30 | Saturday |

**Sunday, 2025-01-07**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_213 | d6eb4636-951b-4f27-9736-75d597d75d97 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_214 | f8a7b2c3-d4e5-4f6a-9b8c-1c3d4e5f6a7b | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_215 | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_216 | 7c5b2d9e-4f1a-4c2b-8d3c-6e7f8a9b0c1d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_217 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_218 | 3d4e5f6a-7b8c-9d0e-1f2a-3b4c5d6e7f8a | 123m4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_219 | a3b4c5d6-7e8f-9a0b-1c2d-3e4f5a6b7c8d | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_220 | c5d6e7f8-9a0b-1c2d-3e4f-5a6b7c8d9e0f | 789i4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_221 | a9b0c1d2-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_222 | 2d3e4f5a-6b7c-8d9e-0f1a-2b3c4d5e6f7a | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_223 | 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_224 | f8a9b0c1-d2e3-4f5a-6b7c-8d9e0f1a2b3c | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_225 | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_226 | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | 9a0b1c2d-3e4f-5a6b-7c8d-9e0f1a2b3c4d | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_227 | 5a6b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | 901k4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_228 | 2a3b4c5d-6e7f-8a9b-0c1d-2e3f4a5b6c7d | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_229 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_230 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_231 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_232 | 0b1c2d3e-4f5a-6b7c-8d9e-0f1a2b3c4d5e | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_233 | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_234 | d9e0f1a2-3b4c-5d6e-7f8a-9b0c1d2e3f4a | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_235 | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_236 | e7f8a9b0-1c2d-3e4f-5a6b-7c8d9e0f1a2b | 456f4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_237 | 1b2c3d4e-5f6a-7b8c-9d0e-1f2a3b4c5d6e | 567g4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_238 | 4b5c6d7e-8f9a-0b1c-2d3e-4f5a6b7c8d9e | 890j4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_239 | 6d7e8f9a-0b1c-2d3e-4 |  |  |  |  |  |

**4.7. Sample Data for** schedules **(continued):**

**Sunday, 2025-01-07 (continued)**

| id | employee\_id | shift\_id | date | schedule\_status | week\_start\_date | day\_of\_week |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| uuid\_239 | 6d7e8f9a-0b1c-2d3e-4f5a-6b7c8d9e0f1a | 012l4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |
| uuid\_240 | 8f9a0b1c-2d3e-4f5a-6b7c-8d9e0f1a2b3c | 234n4567-e89b-12d3-a456-426614174000 | 2025-01-07 | Draft | 2024-12-30 | Sunday |

**Explanation of the Sample Schedule Data:**

* **Shift Assignments:** The sample data demonstrates how employees are assigned to different shifts based on their default shift types and patterns. For example, employees with the 4x10 pattern are scheduled for 10-hour shifts on consecutive days, while those with the 3x12\_1x4 pattern are scheduled for 12-hour shifts with a 4-hour shift mixed in.  
* **Supervisor Coverage:** You can see that employees with the employee\_role of "Shift Supervisor" are strategically placed across different time periods to ensure supervisor coverage as per the staffing requirements.  
* **Meeting Minimum Requirements:** The schedule attempts to meet the minimum employee requirements for each time period. You'll notice that on some days, certain time slots might have more employees than the minimum, this is to fulfill the shift patterns of employees  
* **Draft Status:** All schedules are created with a 'Draft' status, indicating that they are not yet finalized.  
* **Unfilled Requirements:** If you carefully examine the schedule against the staffing requirements, you might find instances where the minimum requirements are not met. This is intentional to show how the system would flag these gaps for manual intervention by a manager.

**4.10. Sample Data for** time\_off\_requests **(continued):**

| id | employee\_id | start\_date | end\_date | type | status | notes | reviewed\_by | reviewed\_at |
| ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- | ----- |
| 8e4c2a1b-7d6f-4e5a-9b0c-1d2e3f4a5b6c | 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 | '2025-01-01' | '2025-01-03' | 'Vacation' | 'Approved' | 'Family vacation' |  |  |
| 6a5b7c8d-9e0f-1a2b-3c4d-5e6f7a8b9c0d | f8e7d6c5-b4a3-9e0f-1d2c-3b4a5d6c7e8f | '2025-01-15' | '2025-01-15' | 'Sick' | 'Approved' | 'Flu' |  |  |
| 4f5a6b7c-8d9e-0f1a-2b3c-4d5e6f7a8b9c | 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b | '2025-01-22' | '2025-01-24' | 'Training' | 'Pending' | 'Advanced Dispatch Training' |  |  |
| 2c3d4e5f-6a7b-8c9d-0e1f-2a3b4c5d6e7f | a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d | '2025-01-29' | '2025-01-31' | 'Vacation' | 'Declined' | 'Insufficient staffing during that week' |  |  |
| 0a1b2c3d-4e5f-6a7b-8c9d-0e1f2a3b4c5d | d6eb4636-951b-4f27-9736-75d597d75d97 | '2025-02-05' | '2025-02-09' | 'Personal' | 'Approved' | 'Moving to a new house' |  |  |
| 8b9c0d1e-2f3a-4b5c-6d7e-8f9a0b1c2d3e | 1c2d3e4f-5a6b-7c8d-9e0f-1a2b3c4d5e6f | '2025-02-12' | '2025-02-12' | 'Sick' | 'Pending' | 'Doctor appointment' |  |  |
| 6e7f8a9b-0c1d-2e3f-4a5b-6c7d8e9f0a1b | 9e0f1a2b-3c4d-5e6f-7a8b-9c0d1e2f3a4b | '2025-02-19' | '2025-02-23' | 'Vacation' | 'Approved' | 'Trip to the mountains' |  |  |
| 4a5b6c7d-8e9f-0a1b-2c3d-4e5f6a7b8c9d | 7c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | '2025-02-26' | '2025-02-28' | 'Training' | 'Pending' | 'Advanced dispatch techniques workshop' |  |  |
| 2b3c4d5e-6f7a-8b9c-0d1e-2f3a4b5c6d7e | c7d6e5f4-a3b2-9e0f-1d2c-3b4a5d6c7e8f | '2025-03-05' | '2025-03-09' | 'Vacation' | 'Approved' | 'Spring break' |  |  |
| 0f1a2b3c-4d5e-6f7a-8b9c-0d1e2f3a4b5c | 5c6d7e8f-9a0b-1c2d-3e4f-5a6b7c8d9e0f | '2025-03-12' | '2025-03-16' | 'Personal' | 'Pending' | 'Family event' |  |  |
| 5c8d9e0f-1a2b-3c4d-5e6f-7a8b9c0d1e2f | f1a2b3c4-5d6e-7f8a-9b0c-1d2e3f4a5b6c | '2025-03-19' | '2025-03-23' | 'Vacation' | 'Pending' | 'Anniversary trip' |  |  |

**Explanation of Time Off Requests:**

* **Approved:** Employee 9e3f7a2b-8c4d-4e5f-a6b7-c8d9e0f1a2b3 has approved vacation from 2025-01-01 to 2025-01-03, so they are not scheduled during that time.  
* **Pending:** Employee 7e8f9a0b-1c2d-3e4f-5a6b-7c8d9e0f1a2b has a pending training request. The scheduler might try to avoid scheduling them during this time, but could override it if necessary.  
* **Declined:** Employee a9b8c7d6-e5f4-4a3b-8c9d-0e1f2a3b4c5d had a vacation request declined, so they are available for scheduling during that period.

**Important Considerations:**

* **Real-World Complexity:** This is a simplified example. Real-world scheduling systems often involve many more factors, such as:  
  * **Skill Levels:** Different employees might have different skill levels or certifications, affecting who can be assigned to specific shifts.  
  * **Shift Preferences:** Employees might have preferred shifts or days off.  
  * **Union Rules:** Collective bargaining agreements can impose complex scheduling restrictions.  
  * **Fatigue Rules:** Regulations or policies might limit the number of consecutive hours or days an employee can work.  
  * **Training:** You'll need to incorporate training schedules and ensure coverage during those times.  
  * **Emergency Situations:** The ability to quickly adjust the schedule in response to unexpected events.  
* **Algorithm Refinement:** The provided algorithm is a basic outline. You'll likely need to refine it iteratively, testing it with different scenarios and data sets.  
* **User Interface:** A user-friendly interface for managers to review, modify, and publish schedules is crucial.

This detailed breakdown of the logic, database schema, and test data should give you a solid foundation to start implementing the scheduling feature in your application. Remember to start with a basic implementation and gradually add complexity as needed, testing thoroughly at each step.

