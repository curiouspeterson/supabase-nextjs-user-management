-- Profiles policies
CREATE POLICY "Users can view their own profile"
    ON public.profiles
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
    ON public.profiles
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

-- Employees policies
CREATE POLICY "Users can view their own employee record"
    ON public.employees
    FOR SELECT
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Managers can view all employee records"
    ON public.employees
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Users can update their own employee record"
    ON public.employees
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = id);

CREATE POLICY "Managers can manage all employee records"
    ON public.employees
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Shift types policies
CREATE POLICY "Anyone can view shift types"
    ON public.shift_types
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage shift types"
    ON public.shift_types
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Shifts policies
CREATE POLICY "Anyone can view shifts"
    ON public.shifts
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage shifts"
    ON public.shifts
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Schedules policies
CREATE POLICY "Users can view their own schedule"
    ON public.schedules
    FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid());

CREATE POLICY "Managers can view all schedules"
    ON public.schedules
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Managers can manage all schedules"
    ON public.schedules
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Time off requests policies
CREATE POLICY "Users can view their own time off requests"
    ON public.time_off_requests
    FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid());

CREATE POLICY "Users can insert their own time off requests"
    ON public.time_off_requests
    FOR INSERT
    TO authenticated
    WITH CHECK (employee_id = auth.uid());

CREATE POLICY "Users can update their own pending time off requests"
    ON public.time_off_requests
    FOR UPDATE
    TO authenticated
    USING (
        employee_id = auth.uid()
        AND status = 'Pending'
    );

CREATE POLICY "Managers can view all time off requests"
    ON public.time_off_requests
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Managers can manage all time off requests"
    ON public.time_off_requests
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Staffing requirements policies
CREATE POLICY "Anyone can view staffing requirements"
    ON public.staffing_requirements
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage staffing requirements"
    ON public.staffing_requirements
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Shift patterns policies
CREATE POLICY "Anyone can view shift patterns"
    ON public.shift_patterns
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage shift patterns"
    ON public.shift_patterns
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Employee patterns policies
CREATE POLICY "Users can view their own patterns"
    ON public.employee_patterns
    FOR SELECT
    TO authenticated
    USING (employee_id = auth.uid());

CREATE POLICY "Managers can view all patterns"
    ON public.employee_patterns
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

CREATE POLICY "Managers can manage all patterns"
    ON public.employee_patterns
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    );

-- Daily coverage policies
CREATE POLICY "Anyone can view daily coverage"
    ON public.daily_coverage
    FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Managers can manage daily coverage"
    ON public.daily_coverage
    FOR ALL
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.employees
            WHERE id = auth.uid()
            AND user_role IN ('Manager', 'Admin')
        )
    ); 