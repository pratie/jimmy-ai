'use client'

import React from 'react'

export function AnalyticsCharts() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 w-full mt-6 font-heading">
      
      {/* Card 1: Conversations */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-glow-primary hover:border-primary/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Conversations</h3>
            <p className="text-xs text-muted-foreground mt-0.5">The number of conversations/users your assistant has had</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            ↓ 8.3%
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-6 justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Latest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Previous</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-[220px] relative">
          <svg className="w-full h-full text-border" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="orange-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="green-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dotted Grid Lines - theme aware */}
            <line x1="50" y1="20" x2="480" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="60" x2="480" y2="60" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="100" x2="480" y2="100" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="140" x2="480" y2="140" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="180" x2="480" y2="180" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />

            {/* Y Axis Labels */}
            <text x="15" y="24" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">4.00</text>
            <text x="15" y="64" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">3.00</text>
            <text x="15" y="104" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">2.00</text>
            <text x="15" y="144" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">1.00</text>
            <text x="15" y="184" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">0.00</text>

            {/* X Axis Labels & tick coordinates */}
            {/* Tick 1: Sep 11 (X=70) */}
            {/* Tick 2: Sep 12 (X=138) */}
            {/* Tick 3: Sep 13 (X=206) */}
            {/* Tick 4: Sep 14 (X=274) */}
            {/* Tick 5: Sep 15 (X=342) */}
            {/* Tick 6: Sep 16 (X=410) */}
            {/* Tick 7: Sep 17 (X=478) */}
            <text x="58" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 11</text>
            <text x="126" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 12</text>
            <text x="194" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 13</text>
            <text x="262" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 14</text>
            <text x="330" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 15</text>
            <text x="398" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 16</text>
            <text x="466" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 17</text>

            {/* Previous Curve (Green) */}
            <path
              d="M 70,140 C 100,100 120,100 138,100 C 206,100 250,100 274,100 C 310,100 330,80 342,60 C 370,20 390,20 410,60 C 430,90 450,140 478,180"
              fill="none"
              stroke="#6ee7b7"
              strokeWidth="2.5"
            />
            {/* Fill Area Previous */}
            <path
              d="M 70,140 C 100,100 120,100 138,100 C 206,100 250,100 274,100 C 310,100 330,80 342,60 C 370,20 390,20 410,60 C 430,90 450,140 478,180 L 478,180 L 70,180 Z"
              fill="url(#green-grad)"
            />

            {/* Latest Curve (Orange) */}
            <path
              d="M 70,180 C 100,140 120,60 138,60 C 170,60 190,140 206,140 C 230,140 250,100 274,100 C 300,100 320,60 342,60 C 370,60 390,120 410,120 C 430,120 450,150 478,180"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="3.5"
            />
            {/* Fill Area Latest */}
            <path
              d="M 70,180 C 100,140 120,60 138,60 C 170,60 190,140 206,140 C 230,140 250,100 274,100 C 300,100 320,60 342,60 C 370,60 390,120 410,120 C 430,120 450,150 478,180 Z"
              fill="url(#orange-grad)"
            />

            {/* Plot Circles Markers */}
            <circle cx="206" cy="140" r="4.5" fill="#f59e0b" className="stroke-card" strokeWidth="1.5" />
            <circle cx="342" cy="60" r="4.5" fill="#f59e0b" className="stroke-card" strokeWidth="1.5" />
            <circle cx="410" cy="60" r="4.5" fill="#6ee7b7" className="stroke-card" strokeWidth="1.5" />
          </svg>
        </div>
      </div>

      {/* Card 2: Incoming Messages */}
      <div className="bg-card/60 backdrop-blur-xl border border-border/60 rounded-2xl p-6 shadow-sm hover:shadow-glow-primary hover:border-primary/20 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h3 className="font-bold text-base text-foreground">Incoming Messages</h3>
            <p className="text-xs text-muted-foreground mt-0.5">The number of text messages sent by users to your assistant</p>
          </div>
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            ↑ 11.1%
          </span>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-semibold text-muted-foreground mb-6 justify-end">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-sky-500" />
            <span>Latest</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-amber-500" />
            <span>Previous</span>
          </div>
        </div>

        {/* SVG Chart */}
        <div className="w-full h-[220px] relative">
          <svg className="w-full h-full text-border" viewBox="0 0 500 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="blue-grad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#0ea5e9" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#0ea5e9" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="orange-grad-msg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Dotted Grid Lines - theme aware */}
            <line x1="50" y1="20" x2="480" y2="20" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="52" x2="480" y2="52" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="84" x2="480" y2="84" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="116" x2="480" y2="116" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="148" x2="480" y2="148" stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.5" />
            <line x1="50" y1="180" x2="480" y2="180" stroke="currentColor" strokeWidth="1" strokeOpacity="0.7" />

            {/* Y Axis Labels */}
            <text x="12" y="24" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">10.00</text>
            <text x="17" y="56" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">8.00</text>
            <text x="17" y="88" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">6.00</text>
            <text x="17" y="120" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">4.00</text>
            <text x="17" y="152" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">2.00</text>
            <text x="17" y="184" className="fill-muted-foreground/80 font-heading" fontSize="9" fontWeight="500">0.00</text>

            {/* X Axis Labels */}
            <text x="58" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 11</text>
            <text x="126" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 12</text>
            <text x="194" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 13</text>
            <text x="262" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 14</text>
            <text x="330" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 15</text>
            <text x="398" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 16</text>
            <text x="466" y="196" className="fill-muted-foreground font-medium" fontSize="9">Sep 17</text>

            {/* Previous Curve (Orange) */}
            <path
              d="M 70,180 C 100,180 120,160 138,150 C 170,140 190,130 206,120 C 230,110 250,110 274,110 C 300,110 320,120 342,120 C 370,120 390,40 410,40 C 430,40 450,110 478,180"
              fill="none"
              stroke="#f59e0b"
              strokeWidth="2.5"
              strokeOpacity="0.8"
            />
            {/* Fill Area Previous */}
            <path
              d="M 70,180 C 100,180 120,160 138,150 C 170,140 190,130 206,120 C 230,110 250,110 274,110 C 300,110 320,120 342,120 C 370,120 390,40 410,40 C 430,40 450,110 478,180 Z"
              fill="url(#orange-grad-msg)"
            />

            {/* Latest Curve (Blue) */}
            <path
              d="M 70,180 C 100,180 120,150 138,130 C 170,110 190,52 206,52 C 230,52 250,84 274,84 C 300,84 320,150 342,150 C 370,150 390,150 410,150 C 430,150 450,165 478,180"
              fill="none"
              stroke="#0ea5e9"
              strokeWidth="3.5"
            />
            {/* Fill Area Latest */}
            <path
              d="M 70,180 C 100,180 120,150 138,130 C 170,110 190,52 206,52 C 230,52 250,84 274,84 C 300,84 320,150 342,150 C 370,150 390,150 410,150 C 430,150 450,165 478,180 Z"
              fill="url(#blue-grad)"
            />

            {/* Plot Circles Markers */}
            <circle cx="206" cy="52" r="4.5" fill="#0ea5e9" className="stroke-card" strokeWidth="1.5" />
            <circle cx="274" cy="84" r="4.5" fill="#0ea5e9" className="stroke-card" strokeWidth="1.5" />
            <circle cx="410" cy="40" r="4.5" fill="#f59e0b" className="stroke-card" strokeWidth="1.5" />
          </svg>
        </div>
      </div>
      
    </div>
  )
}
