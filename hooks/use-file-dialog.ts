import {useState} from 'react'

type Options = {
  multiple?: boolean
  accept?: string
}

const DEFAULT_OPTIONS: Options = {
  multiple: true,
  accept: '*',
}

export const useFileDialog = (
  onSelectFile?: (files: FileList) => void,
  options?: Partial<Options>,
) => {
  const [files, setFiles] = useState<FileList | null>(null)
  const input = document.createElement('input')

  const openFileDialog = (localOptions?: Partial<Options>) => {
    const _options: Options = {
      ...DEFAULT_OPTIONS,
      ...options,
      ...localOptions,
    }
    input.type = 'file'
    input.multiple = _options.multiple || false
    input.accept = _options.accept || ''

    input.onchange = (event: Event) => {
      const {
        files,
      }: {
        files: FileList | null
      } = event.target as HTMLInputElement
      setFiles(files)
      if (onSelectFile && files) {
        onSelectFile(files)
      }
    }

    input.click()
  }

  return {files, openFileDialog}
} 