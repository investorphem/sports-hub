import '../styles/globals.css'
import { sdk } from '@farcaster/miniapp-sdk'
import { useEffect } from 'react'

function MyApp({ Component, pageProps }) {
  useEffect(() => {
    // Tell Farcaster Mini App that the app is ready
    const readyApp = async () => {
      try {
        await sdk.actions.ready()
        console.log("✅ Farcaster Mini App is ready")
      } catch (err) {
        console.error("Farcaster ready() error:", err)
      }
    }
    readyApp()
  }, [])

  return <Component {...pageProps} />
}

export default MyApp
