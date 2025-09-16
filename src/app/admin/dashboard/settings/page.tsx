import React from 'react'
import BulkIsrcUpdater from '../../_components/BulkIsrcUpdate'
import BulkArtistUpdater from '../../_components/BulkArtistUpdater'
import BulkComposerUpdater from '../../_components/BulkComposerUpdater'

type Props = {}

const page = (props: Props) => {
  return (
    <section className='bg-white py-20'>
        <div className="w-[90%] mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>
        <section className='space-y-5'>
            <h2 className="text-xl font-semibold">Bulk ISRC Management</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
            <BulkIsrcUpdater />
            <BulkArtistUpdater/>
            <BulkComposerUpdater/>
            </div>
        </section>
      
    </div>
    </section>
  )
}

export default page