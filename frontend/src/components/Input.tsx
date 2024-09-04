import React from 'react'

const Input = ({icon:Icon,...prop}) => {
  return (
    <div className='relative mb-6'>
        <div className='absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none'>
            <Icon className='h-5 w-5 text-gray-400'/>
        </div>
        <input 
        {...prop} 
        className='w-full pl-10 pr-4 py-2 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500'
        />
    </div>
  )
}

export default Input
