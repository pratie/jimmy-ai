'use client'

import React from 'react'
import { Check, MoreVertical, Phone, Video } from 'lucide-react'
import Image from 'next/image'

export default function WhatsAppPreview() {
    return (
        <div className="relative w-full max-w-[320px] mx-auto h-[550px] bg-slate-50 dark:bg-slate-900 rounded-[3rem] border-8 border-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden">
            {/* Notch / Status Bar */}
            <div className="absolute top-0 inset-x-0 h-7 bg-slate-950 flex items-center justify-center z-20">
                <div className="w-20 h-4 bg-black rounded-b-xl"></div>
            </div>

            {/* WhatsApp Header (Monochrome) */}
            <div className="bg-slate-100 dark:bg-slate-800 pt-8 pb-3 px-4 flex items-center justify-between border-b border-slate-200 dark:border-white/5 z-10 relative">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                        <Image src="/images/logo.svg" alt="AI" width={20} height={20} className="opacity-80 grayscale" />
                    </div>
                    <div className="flex flex-col">
                        <span className="font-semibold text-sm text-slate-900 dark:text-white">ChatDock AI</span>
                        <span className="text-[10px] text-slate-500">Business Account</span>
                    </div>
                </div>
                <div className="flex items-center gap-4 text-slate-400">
                    <Video className="w-5 h-5" />
                    <Phone className="w-5 h-5" />
                    <MoreVertical className="w-5 h-5" />
                </div>
            </div>

            {/* Chat Area */}
            <div className="h-full bg-slate-50 dark:bg-slate-950/50 p-4 space-y-4 pt-4 pb-20 overflow-y-auto">
                {/* Date Bubble */}
                <div className="flex justify-center mb-4">
                    <span className="bg-slate-200/50 dark:bg-slate-800/50 px-2 py-1 rounded-md text-[10px] text-slate-500 font-medium">Today</span>
                </div>

                {/* AI Message */}
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm border border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            Hello! 👋 I'm your AI assistant. I can help with sales questions, support tickets, and scheduling.
                        </p>
                        <div className="text-[9px] text-slate-400 text-right mt-1">10:42 AM</div>
                    </div>
                </div>

                {/* User Message */}
                <div className="flex justify-end">
                    <div className="bg-slate-900 dark:bg-white rounded-lg rounded-tr-none p-3 max-w-[85%] shadow-sm">
                        <p className="text-xs text-white dark:text-slate-900 leading-relaxed">
                            Can you check the status of my order #9921?
                        </p>
                        <div className="text-[9px] text-slate-400 dark:text-slate-500 text-right mt-1 flex items-center justify-end gap-1">
                            10:43 AM <Check className="w-3 h-3" />
                        </div>
                    </div>
                </div>

                {/* AI Message */}
                <div className="flex justify-start">
                    <div className="bg-white dark:bg-slate-800 rounded-lg rounded-tl-none p-3 max-w-[85%] shadow-sm border border-slate-100 dark:border-white/5">
                        <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                            Checking that for you... 🔍<br /><br />
                            Order <strong>#9921</strong> is out for delivery! 🚚<br />
                            Expected arrival: Today by 6 PM.
                        </p>
                        <div className="text-[9px] text-slate-400 text-right mt-1">10:43 AM</div>
                    </div>
                </div>
            </div>

            {/* Input Area */}
            <div className="absolute bottom-0 inset-x-0 bg-slate-100 dark:bg-slate-800 p-3 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-300 dark:bg-slate-700 flex items-center justify-center text-slate-500">
                    <span className="text-xs">+</span>
                </div>
                <div className="flex-1 bg-white dark:bg-slate-900 rounded-full h-8 px-3 flex items-center border border-slate-200 dark:border-slate-700">
                    <span className="text-xs text-slate-400">Message...</span>
                </div>
                <div className="w-8 h-8 rounded-full bg-slate-900 dark:bg-white flex items-center justify-center">
                    <Check className="w-4 h-4 text-white dark:text-slate-900" />
                </div>
            </div>
        </div>
    )
}
