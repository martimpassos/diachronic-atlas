import React from 'react'

import Atlas from 'diachronic-atlas'

import style from './style.json'
import 'diachronic-atlas/dist/index.css'

const App = () => {
  return <Atlas mapStyle={style} year={1950} basemapHandler={() => {}} />
}

export default App
