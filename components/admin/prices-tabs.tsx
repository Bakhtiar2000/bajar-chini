'use client'

import { useState } from 'react'
import { ChartLine, History } from 'lucide-react'
import type { MarketDTO } from '@/lib/types'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/controls'
import { PriceEditor } from './price-editor'
import { PriceHistory } from './price-history'

export function PricesTabs({
  markets,
  now,
  initialTab,
  initialMarketId,
}: {
  markets: MarketDTO[]
  now: { year: number; month: number }
  initialTab: 'entry' | 'history'
  initialMarketId?: string
}) {
  const [tab, setTab] = useState(initialTab)
  return (
    <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)} className="space-y-4">
      <TabsList>
        <TabsTrigger value="entry">
          <ChartLine className="size-4" /> Monthly entry
        </TabsTrigger>
        <TabsTrigger value="history">
          <History className="size-4" /> History &amp; corrections
        </TabsTrigger>
      </TabsList>
      <TabsContent value="entry">
        <PriceEditor markets={markets} now={now} />
      </TabsContent>
      <TabsContent value="history">
        <PriceHistory markets={markets} initialMarketId={initialMarketId} />
      </TabsContent>
    </Tabs>
  )
}
