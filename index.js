// http://dropbox.github.io/dropbox-sdk-js/Dropbox.html
// API explorer: https://dropbox.github.io/dropbox-api-v2-explorer/

import 'isomorphic-fetch'
import { Dropbox } from 'dropbox'
// import promise from 'es6-promise'
// promise.polyfill()

const dbx = new Dropbox({
  accessToken: process.env.ACCESS_TOKEN,
  fetch
})

const fileListElem = document.querySelector('.js-file-list')
const loadingElem = document.querySelector('.js-loading')

const state = {
  files: []
}

const init = async () => {
  const res = await dbx.filesListFolder({
    path: '',
    limit: 20
  })
  updateFiles(res.entries)
  if (res.has_more) {
    loadingElem.classList.remove('hidden')
    await getMoreFiles(res.cursor, more => updateFiles(more.entries))
    loadingElem.classList.add('hidden')
  } else {
    loadingElem.classList.add('hidden')
  }
}

const updateFiles = files => {
  state.files = [...state.files, ...files]
  renderFiles()
  getThumbnails(files)
}

const getMoreFiles = async (cursor, cb) => {
  const res = await dbx.filesListFolderContinue({ cursor })
  if (cb) cb(res)
  if (res.has_more) {
    await getMoreFiles(res.cursor, cb)
  }
}

const renderFiles = () => {
  fileListElem.innerHTML = state.files
    .sort((a, b) => {
      // sort alphabetically, folders first
      if ((a['.tag'] === 'folder' || b['.tag'] === 'folder') && !(a['.tag'] === b['.tag'])) {
        return a['.tag'] === 'folder' ? -1 : 1
      } else {
        return a.name.toLowerCase() < b.name.toLowerCase() ? -1 : 1
      }
    })
    .map(file => {
      const type = file['.tag']
      let thumbnail
      if (type === 'file') {
        thumbnail = file.thumbnail
          ? `data:image/jpeg;base64, ${file.thumbnail}`
          : `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZpbGUiPjxwYXRoIGQ9Ik0xMyAySDZhMiAyIDAgMCAwLTIgMnYxNmEyIDIgMCAwIDAgMiAyaDEyYTIgMiAwIDAgMCAyLTJWOXoiPjwvcGF0aD48cG9seWxpbmUgcG9pbnRzPSIxMyAyIDEzIDkgMjAgOSI+PC9wb2x5bGluZT48L3N2Zz4=`
      } else {
        thumbnail = `data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZmYiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0iZmVhdGhlciBmZWF0aGVyLWZvbGRlciI+PHBhdGggZD0iTTIyIDE5YTIgMiAwIDAgMS0yIDJINGEyIDIgMCAwIDEtMi0yVjVhMiAyIDAgMCAxIDItMmg1bDIgM2g5YTIgMiAwIDAgMSAyIDJ6Ij48L3BhdGg+PC9zdmc+`
      }
      return `
        <li class="dbx-list-item ${type}">
          <img class="dbx-thumb" src="${thumbnail}">
          ${file.name}
        </li>
      `
    })
    .join('')
}

const getThumbnails = async files => {
  const paths = files
    .filter(file => file['.tag'] === 'file')
    .map(file => ({
      path: file.path_lower,
      size: 'w32h32'
    }))
  const res = await dbx.filesGetThumbnailBatch({
    entries: paths
  })
  // make a copy of state.files
  const newStateFiles = [...state.files]
  // loop through the file objects returned from dbx
  res.entries.forEach(file => {
    // figure out the index of the file we need to update
    let indexToUpdate = state.files.findIndex(stateFile => file.metadata.path_lower === stateFile.path_lower)
    // put a .thumbnail property on the corresponding file
    newStateFiles[indexToUpdate].thumbnail = file.thumbnail
  })
  state.files = newStateFiles
  renderFiles()
}

init()
