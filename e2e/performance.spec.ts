import { test, expect } from '@playwright/test'
import { authFile } from './setup/auth.setup'

interface PerformanceMetrics {
  title: string
  metrics: {
    firstContentfulPaint?: number
    JSHeapSize?: number
    [key: string]: any
  }
}

interface APITiming {
  startTime: number
  endTime: number
}

test.describe('Performance Tests', () => {
  test.use({ storageState: authFile })

  test('measures page load performance', async ({ page }) => {
    // Start performance measurements
    const performanceEntries: PerformanceMetrics[] = []
    await page.evaluate(() => {
      performance.mark('testStart')
      const observer = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'paint' && entry.name === 'first-contentful-paint') {
            performanceEntries.push({
              title: 'firstContentfulPaint',
              metrics: { firstContentfulPaint: entry.startTime }
            })
          }
        }
      })
      observer.observe({ entryTypes: ['paint'] })
    })

    // Navigate to home page
    const startTime = Date.now()
    await page.goto('/')
    const loadTime = Date.now() - startTime

    // Verify load time is under threshold
    expect(loadTime).toBeLessThan(3000) // 3 seconds max

    // Get performance metrics
    const metrics = await page.evaluate(() => {
      performance.mark('testEnd')
      const paintEntries = performance.getEntriesByType('paint')
      const fcp = paintEntries.find(entry => entry.name === 'first-contentful-paint')
      return {
        firstContentfulPaint: fcp ? fcp.startTime : null
      }
    })

    // Check First Contentful Paint
    expect(metrics.firstContentfulPaint).toBeLessThan(1000) // 1 second max
  })

  test('measures time off request form submission performance', async ({ page }) => {
    await page.goto('/time-off')

    // Open form
    const startDialogTime = Date.now()
    await page.getByRole('button', { name: /request time off/i }).click()
    const dialogOpenTime = Date.now() - startDialogTime
    expect(dialogOpenTime).toBeLessThan(500) // 500ms max for dialog open

    // Fill form
    const startFillTime = Date.now()
    await page.getByLabel(/start date/i).fill('2024-03-15')
    await page.getByLabel(/end date/i).fill('2024-03-20')
    await page.getByLabel(/type/i).click()
    await page.getByRole('option', { name: /vacation/i }).click()
    await page.getByLabel(/notes/i).fill('Performance test request')
    const fillTime = Date.now() - startFillTime
    expect(fillTime).toBeLessThan(1000) // 1 second max for form fill

    // Submit form
    const startSubmitTime = Date.now()
    await page.getByRole('button', { name: /submit/i }).click()
    await page.getByText(/request has been submitted/i).waitFor()
    const submitTime = Date.now() - startSubmitTime
    expect(submitTime).toBeLessThan(2000) // 2 seconds max for submission
  })

  test('measures staffing table render performance', async ({ page }) => {
    await page.goto('/staffing')

    // Measure initial render time
    const startRenderTime = Date.now()
    await page.getByRole('table').waitFor()
    const renderTime = Date.now() - startRenderTime
    expect(renderTime).toBeLessThan(1000) // 1 second max for initial render

    // Measure filter performance
    const startFilterTime = Date.now()
    await page.getByLabel(/filter by day/i).selectOption('Tuesday')
    await page.getByRole('row').first().waitFor()
    const filterTime = Date.now() - startFilterTime
    expect(filterTime).toBeLessThan(500) // 500ms max for filter operation
  })

  test('measures schedule view performance', async ({ page }) => {
    await page.goto('/schedule')

    // Measure calendar render time
    const startCalendarTime = Date.now()
    await page.getByRole('grid').waitFor()
    const calendarRenderTime = Date.now() - startCalendarTime
    expect(calendarRenderTime).toBeLessThan(2000) // 2 seconds max for calendar render

    // Measure week view switch performance
    const startWeekViewTime = Date.now()
    await page.getByRole('tab', { name: /week/i }).click()
    await page.getByRole('grid').waitFor()
    const weekViewSwitchTime = Date.now() - startWeekViewTime
    expect(weekViewSwitchTime).toBeLessThan(500) // 500ms max for view switch
  })

  test('measures employee list performance', async ({ page }) => {
    await page.goto('/employees')

    // Measure initial load time
    const startLoadTime = Date.now()
    await page.getByRole('list').waitFor()
    const loadTime = Date.now() - startLoadTime
    expect(loadTime).toBeLessThan(1500) // 1.5 seconds max for initial load

    // Measure search performance
    const startSearchTime = Date.now()
    await page.getByPlaceholder(/search employees/i).fill('John')
    await page.getByRole('listitem').first().waitFor()
    const searchTime = Date.now() - startSearchTime
    expect(searchTime).toBeLessThan(300) // 300ms max for search operation
  })

  test('measures API response times', async ({ page, request }) => {
    // Time off requests API
    const timeOffStart = Date.now()
    const timeOffResponse = await request.get('/api/time-off')
    const timeOffEnd = Date.now()
    expect(timeOffResponse.status()).toBe(200)
    expect(timeOffEnd - timeOffStart).toBeLessThan(500) // 500ms max for API response

    // Staffing requirements API
    const staffingStart = Date.now()
    const staffingResponse = await request.get('/api/staffing')
    const staffingEnd = Date.now()
    expect(staffingResponse.status()).toBe(200)
    expect(staffingEnd - staffingStart).toBeLessThan(500)

    // Employee list API
    const employeesStart = Date.now()
    const employeesResponse = await request.get('/api/employees')
    const employeesEnd = Date.now()
    expect(employeesResponse.status()).toBe(200)
    expect(employeesEnd - employeesStart).toBeLessThan(500)
  })

  test('measures memory usage', async ({ page }) => {
    // Start memory monitoring
    const jsHeapSizes: number[] = []
    await page.evaluate(() => {
      const observer = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        for (const entry of entries) {
          if (entry.entryType === 'memory') {
            // @ts-ignore - memory API types
            const memory = entry.jsHeapSize
            if (memory) {
              jsHeapSizes.push(memory)
            }
          }
        }
      })
      observer.observe({ entryTypes: ['memory'] })
    })

    // Navigate through different pages
    await page.goto('/')
    await page.goto('/time-off')
    await page.goto('/staffing')
    await page.goto('/schedule')
    await page.goto('/employees')

    // Get final memory metrics
    const memoryMetrics = await page.evaluate(() => {
      // @ts-ignore - memory API types
      return performance.memory ? {
        // @ts-ignore - memory API types
        jsHeapSize: performance.memory.usedJSHeapSize,
        // @ts-ignore - memory API types
        totalJSHeapSize: performance.memory.totalJSHeapSize
      } : null
    })

    if (memoryMetrics) {
      // Check memory usage
      expect(memoryMetrics.jsHeapSize).toBeLessThan(100 * 1024 * 1024) // 100MB max heap size
      expect(memoryMetrics.totalJSHeapSize).toBeLessThan(200 * 1024 * 1024) // 200MB max total heap
    }
  })

  test('measures client-side navigation performance', async ({ page }) => {
    await page.goto('/')

    // Measure navigation times between pages
    const navigationTimes: number[] = []

    // Home to Time Off
    const startTimeOff = Date.now()
    await page.getByRole('link', { name: /time off/i }).click()
    await page.waitForURL('**/time-off')
    navigationTimes.push(Date.now() - startTimeOff)

    // Time Off to Staffing
    const startStaffing = Date.now()
    await page.getByRole('link', { name: /staffing/i }).click()
    await page.waitForURL('**/staffing')
    navigationTimes.push(Date.now() - startStaffing)

    // Staffing to Schedule
    const startSchedule = Date.now()
    await page.getByRole('link', { name: /schedule/i }).click()
    await page.waitForURL('**/schedule')
    navigationTimes.push(Date.now() - startSchedule)

    // Check navigation times
    navigationTimes.forEach(time => {
      expect(time).toBeLessThan(300) // 300ms max for client-side navigation
    })
  })
}) 