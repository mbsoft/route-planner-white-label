'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { useInputStore } from '../../../models/input/store'
import { InputVehicleUpload } from './input-vehicle-upload'

export const InputVehiclePanel = () => {
  const store = useInputStore()
  const { vehicle } = store.inputCore

  // Always show the upload component since DataMapper is now in the main page
  return <InputVehicleUpload />
} 