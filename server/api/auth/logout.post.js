// Logout - clear session cookie
export default defineEventHandler(async (event) => {
    deleteCookie(event, 'session', {
        path: '/'
    })

    return { success: true }
})
