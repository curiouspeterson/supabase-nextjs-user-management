import { type TestToast, type ToastAction } from '../types/toast'
import { screen, within, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

export const findToastByTitle = async (title: string) => {
  const toasts = await screen.findAllByRole('status')
  const matchingToast = toasts.find(toast => 
    within(toast).queryByText(title) !== null
  )
  if (!matchingToast) {
    throw new Error(`Toast with title "${title}" not found`)
  }
  return matchingToast
}

export const queryToastByTitle = (title: string) => {
  const toasts = screen.queryAllByRole('status')
  return toasts.find(toast => within(toast).queryByText(title) !== null) || null
}

export const getToastByTitle = (title: string) => {
  const toasts = screen.getAllByRole('status')
  const matchingToast = toasts.find(toast => 
    within(toast).queryByText(title) !== null
  )
  if (!matchingToast) {
    throw new Error(`Toast with title "${title}" not found`)
  }
  return matchingToast
}

export const findToastElements = async (toast: TestToast) => {
  const toastElement = await findToastByTitle(toast.title)
  const titleElement = within(toastElement).getByText(toast.title)
  const descriptionElement = toast.description 
    ? within(toastElement).getByText(toast.description)
    : null
  const closeButton = within(toastElement).getByRole('button', { 
    name: '', 
    hidden: true 
  })
  const actionButton = toast.action
    ? within(toastElement).getByRole('button', { name: toast.action.altText })
    : null
  
  return {
    toastElement,
    titleElement,
    descriptionElement,
    closeButton,
    actionButton
  }
}

export const expectToastToBeVisible = async (toast: TestToast) => {
  const { toastElement, titleElement, descriptionElement } = await findToastElements(toast)
  
  expect(toastElement).toBeInTheDocument()
  expect(titleElement).toBeInTheDocument()
  if (toast.description) {
    expect(descriptionElement).toBeInTheDocument()
  }
}

export const expectToastToBeDismissed = async (title: string) => {
  await new Promise(resolve => setTimeout(resolve, 100)) // Small delay for animation
  const toast = queryToastByTitle(title)
  expect(toast).not.toBeInTheDocument()
}

export const expectToastToHaveVariant = async (toast: TestToast) => {
  const { toastElement } = await findToastElements(toast)
  if (toast.variant === 'destructive') {
    expect(toastElement).toHaveClass('destructive')
  }
}

export const expectToastToBeAccessible = async (toast: TestToast) => {
  const { toastElement } = await findToastElements(toast)
  expect(toastElement).toHaveAttribute('aria-atomic', 'true')
  expect(toastElement).toHaveAttribute('role', 'status')
}

export const expectToastPosition = async (toast: TestToast) => {
  const { toastElement } = await findToastElements(toast)
  expect(toastElement).toHaveAttribute('position', toast.position || 'bottom')
}

export const expectToastQueueOrder = async (toasts: TestToast[]) => {
  const toastElements = await screen.findAllByRole('status', { hidden: true })
  const visibleToasts = toastElements.filter(element => 
    !element.hasAttribute('style') || 
    !element.getAttribute('style')?.includes('position: absolute')
  )
  expect(visibleToasts).toHaveLength(toasts.length)
  
  toasts.forEach((toast, index) => {
    const toastElement = visibleToasts[index]
    expect(within(toastElement).getByText(toast.title)).toBeInTheDocument()
  })
}

export const expectToastKeyboardInteraction = async (toast: TestToast) => {
  const user = userEvent.setup()
  const elements = await findToastElements(toast)
  
  await user.keyboard('{Escape}')
  await waitFor(() => {
    expect(queryToastByTitle(toast.title)).not.toBeInTheDocument()
  })
  
  if (elements.actionButton) {
    await user.tab()
    expect(elements.actionButton).toHaveFocus()
  }
  
  if (elements.closeButton) {
    await user.tab()
    expect(elements.closeButton).toHaveFocus()
  }
}

export const dismissToast = async (toast: TestToast) => {
  const { closeButton } = await findToastElements(toast)
  closeButton.click()
}

export const clickToastAction = async (toast: TestToast) => {
  if (!toast.action) return
  
  const toastElement = await findToastByTitle(toast.title)
  const actionButton = within(toastElement).getByRole('button', { 
    name: toast.action.altText 
  })
  actionButton.click()
}

export const expectToastToAutoDismiss = async (toast: TestToast, duration: number) => {
  const toastElement = await findToastByTitle(toast.title)
  expect(toastElement).toBeInTheDocument()

  await waitFor(() => {
    expect(queryToastByTitle(toast.title)).not.toBeInTheDocument()
  }, { timeout: duration + 1000 })
} 