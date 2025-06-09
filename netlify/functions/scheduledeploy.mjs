import fetch from 'node-fetch'
import { schedule } from '@netlify/functions'

// This is the 'scheduledeployment' build hook URL
const BUILD_HOOK =
  'https://api.netlify.com/build_hooks/6847450fa142580c3cbd53df'

// schedule this function
const handler = schedule("30 18 * * *", async () => {
  await fetch(BUILD_HOOK, {
    method: 'POST'
  }).then(response => {
    console.log('Build hook response:', response)
  })

  return {
    statusCode: 200
  }
})

export { handler }