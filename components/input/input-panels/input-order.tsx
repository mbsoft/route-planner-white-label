'use client'

import React from 'react'
import { Box, Typography } from '@mui/material'
import { useInputStore } from '../../../models/input/store'
import { InputJobUpload } from './input-job-upload'

export const InputOrderPanel = () => {
  const store = useInputStore()
  const { job } = store.inputCore

  // Always show the upload component since DataMapper is now in the main page
  return <InputJobUpload />
} 