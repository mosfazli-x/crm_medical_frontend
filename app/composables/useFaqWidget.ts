export const useFaqWidget = () => {
  const isOpen = useState('faq-widget-open', () => false)

  const toggle = () => { isOpen.value = !isOpen.value }
  const open = () => { isOpen.value = true }
  const close = () => { isOpen.value = false }

  return { isOpen, toggle, open, close }
}
