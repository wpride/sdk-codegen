/*

 MIT License

 Copyright (c) 2020 Looker Data Sciences, Inc.

 Permission is hereby granted, free of charge, to any person obtaining a copy
 of this software and associated documentation files (the "Software"), to deal
 in the Software without restriction, including without limitation the rights
 to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 copies of the Software, and to permit persons to whom the Software is
 furnished to do so, subject to the following conditions:

 The above copyright notice and this permission notice shall be included in all
 copies or substantial portions of the Software.

 THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 SOFTWARE.

 */
import React, { ReactElement } from 'react'
import {
  IRawResponse,
  ResponseMode,
  responseMode,
} from '@looker/sdk-rtl/lib/browser'
import { Paragraph } from '@looker/components'

import { CodeStructure } from '../CodeStructure'

/**
 * A handler for JSON type responses
 */
const ShowJSON = (response: IRawResponse) => (
  <CodeStructure
    code={JSON.stringify(JSON.parse(response.body), null, 2)}
    language={'json'}
  />
)

/**
 * A handler for text type responses
 */
const ShowText = (response: IRawResponse) => (
  <pre>
    {response.statusMessage !== 'OK' && response.statusMessage}
    {response.body.toString()}
  </pre>
)

/** A handler for image type responses */
const ShowImage = (response: IRawResponse) => {
  let content: string
  if (response.body instanceof Blob) {
    content = URL.createObjectURL(response.body).toString()
  } else {
    content = `data:${response.contentType};base64,${btoa(response.body)}`
  }

  return (
    <img
      src={content}
      alt={`${response.url} returned ${response.contentType}`}
    />
  )
}

/** A handler for HTTP type responses */
const ShowHTML = (response: IRawResponse) => (
  <CodeStructure language={'html'} code={response.body.toString()} />
)

/**
 * A handler for unknown response types. It renders the size of the unknown response and its type.
 */
const ShowUnknown = (response: IRawResponse) => (
  <Paragraph>
    {`Received ${
      response.body instanceof Blob
        ? response.body.size
        : response.body.toString().length
    } bytes of ${response.contentType} data.`}
  </Paragraph>
)

interface Responder {
  /** A label indicating the supported MIME type(s) */
  label: string
  /** A lambda for determining whether a given MIME type is supported */
  isRecognized: (contentType: string) => boolean
  /** A component that renders recognized MIME types */
  component: (response: IRawResponse) => ReactElement
}

/**
 * An array of response handlers, describing currently supported MIME types
 */
export const responseHandlers: Responder[] = [
  // TODO: Add support for content type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet and pdf
  {
    label: 'json',
    isRecognized: (contentType) =>
      RegExp(/application\/json/g).test(contentType),
    component: (response) => ShowJSON(response),
  },
  {
    label: 'html',
    isRecognized: (contentType) => RegExp(/text\/html/g).test(contentType),
    component: (response) => ShowHTML(response),
  },
  // SVG would normally be considered a "string" because of the xml tag, so it must be checked before text
  {
    label: 'img',
    isRecognized: (contentType) =>
      RegExp(/image\/(png|jpg|jpeg|svg\+xml)/).test(contentType),
    component: (response) => ShowImage(response),
  },
  {
    label: 'text',
    isRecognized: (contentType) =>
      responseMode(contentType) === ResponseMode.string ||
      contentType === 'text',
    component: (response) => ShowText(response),
  },
  {
    label: 'unknown',
    isRecognized: (contentType: string) => !!contentType,
    component: (response) => ShowUnknown(response),
  },
]

/** find the response handler or return the default */
export const pickResponseHandler = (response: IRawResponse) => {
  let result = responseHandlers[responseHandlers.length - 1]
  for (const handler of responseHandlers) {
    if (handler.isRecognized(response.contentType)) {
      result = handler
      break
    }
  }
  return result
}
