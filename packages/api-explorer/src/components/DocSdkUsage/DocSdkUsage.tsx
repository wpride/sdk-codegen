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
import React, { FC } from 'react'
import { TabList, Tab, TabPanels, TabPanel, useTabs } from '@looker/components'
import { ApiModel, IMethod } from '@looker/sdk-codegen'
import { getGenerators } from '@looker/run-it'

import { CollapserCard } from '../Collapser'
import { DocExamples } from './DocExamples'

interface DocExamplesProps {
  api: ApiModel
  method: IMethod
}

/**
 *  Given an SDK method, searches the examples index for its usages in various languages and renders
 *  links to the source files
 */
export const DocSdkUsage: FC<DocExamplesProps> = ({ api, method }) => {
  const tabs = useTabs()
  const generators = getGenerators(api)

  return (
    <CollapserCard heading="SDK Examples">
      <>
        <TabList {...tabs}>
          {Object.keys(generators).map((language) => (
            <Tab key={language}>{language}</Tab>
          ))}
        </TabList>
        <TabPanels {...tabs} pt="0">
          {Object.entries(generators).map(([language, _]) => (
            <TabPanel key={language}>
              <DocExamples
                language={language}
                operationId={method.operationId}
              />
            </TabPanel>
          ))}
        </TabPanels>
      </>
    </CollapserCard>
  )
}