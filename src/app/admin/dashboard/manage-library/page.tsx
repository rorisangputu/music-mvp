import Link from 'next/link'
import React from 'react'
import AlbumsList from '../../_components/AlbumsList'

type Props = {}

const page = (props: Props) => {
  return (
    <div className='w-full py-20 bg-white'>
        <div className='w-[90%] mx-auto'>
            {/* Albums List Section */}
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-medium text-gray-900">
                Recent Albums
              </h2>
              <Link
                href="/library"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                View All →
              </Link>
            </div>
            <AlbumsList />
          </div>
        </div>

    </div>
  )
}

export default page