export const notifyInfo = (config = {}) => {
  const {
    message,
    title
  } = config

  window.$bvToast.toast(message, {
    title: title,
    variant: 'info',
    toaster: 'b-toaster-top-center',
  })
}

export const notifyError = (config = {}) => {
  const {
    message,
    title
  } = config

  window.$bvToast.toast(message, {
    title: title,
    variant: 'danger',
    toaster: 'b-toaster-top-center',
  })
}

export const notify = (args) => {
  window.$bvToast.toast(...args)
}
