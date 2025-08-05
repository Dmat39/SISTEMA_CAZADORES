import React from 'react'
import { Listbox, Transition } from '@headlessui/react'
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/20/solid'

const userTypeOptions = [
  {
    value: 'cazador',
    label: 'Cazadores',
    icon: '👮‍♂️',
    description: 'Personal especializado'
  },
  {
    value: 'operador',
    label: 'Operadores', 
    icon: '🎧',
    description: 'Personal de soporte'
  }
]

const UserTypeSelector = ({ value, onChange, className = '' }) => {
  const selectedOption = userTypeOptions.find(option => option.value === value) || userTypeOptions[0]

  return (
    <div className={`relative ${className}`}>
      <Listbox value={value} onChange={onChange}>
        {({ open }) => (
          <>
            <Listbox.Button className={`
              relative w-[190px] h-11 px-4 bg-white border border-gray-200 rounded-xl 
              text-sm font-medium text-gray-700 text-left cursor-pointer
              transition-all duration-200 ease-in-out
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500
              hover:border-gray-300 hover:shadow-sm
              ${open ? 'ring-2 ring-blue-500/20 border-blue-500 shadow-sm' : ''}
            `}>
              <span className="flex items-center">
                <span className="text-base mr-3">{selectedOption.icon}</span>
                <span className="block truncate">{selectedOption.label}</span>
              </span>
              <span className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                <ChevronDownIcon 
                  className={`h-4 w-4 text-gray-400 transition-transform duration-200 ${
                    open ? 'rotate-180' : ''
                  }`}
                  aria-hidden="true" 
                />
              </span>
              
              {/* Efecto de gradiente en hover */}
              <div className={`
                absolute inset-0 rounded-xl bg-gradient-to-r from-blue-500/5 to-purple-500/5 
                opacity-0 hover:opacity-100 transition-opacity duration-200 pointer-events-none
              `}></div>
            </Listbox.Button>

            <Transition
              show={open}
              as={React.Fragment}
              leave="transition ease-in duration-100"
              leaveFrom="opacity-100"
              leaveTo="opacity-0"
            >
              <Listbox.Options className="
                absolute z-50 mt-2 w-full bg-white shadow-lg max-h-60 rounded-xl py-1
                text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none
                border border-gray-100
              ">
                {userTypeOptions.map((option) => (
                  <Listbox.Option
                    key={option.value}
                    className={({ active, selected }) =>
                      `relative cursor-pointer select-none py-3 px-1 mx-1 rounded-lg transition-colors duration-150 ${
                        active 
                          ? 'bg-gradient-to-r from-blue-50 to-purple-50 text-blue-900' 
                          : 'text-gray-900'
                      } ${
                        selected ? 'bg-blue-50 text-blue-900' : ''
                      }`
                    }
                    value={option.value}
                  >
                    {({ selected, active }) => (
                      <>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <span className="text-base mr-3">{option.icon}</span>
                            <div className="flex flex-col">
                              <span className={`block truncate font-medium ${
                                selected ? 'font-semibold' : 'font-medium'
                              }`}>
                                {option.label}
                              </span>
                              <span className="text-xs text-gray-500 mt-0.5">
                                {option.description}
                              </span>
                            </div>
                          </div>
                          
                          {selected && (
                            <span className="flex items-center text-blue-600">
                              <CheckIcon className="h-4 w-4" aria-hidden="true" />
                            </span>
                          )}
                        </div>
                      </>
                    )}
                  </Listbox.Option>
                ))}
              </Listbox.Options>
            </Transition>
          </>
        )}
      </Listbox>
    </div>
  )
}

export default UserTypeSelector