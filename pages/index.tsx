import Head from 'next/head'
import Sidebar from '../components/Sidebar'

export default function Home() {
  return (
    <div>
      <Head>
        <title>vChat</title>
        <meta name="description" content="Generated by Vang Nguyen" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Sidebar/>
    </div>
  )
}
