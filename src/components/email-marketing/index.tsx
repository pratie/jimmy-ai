'use client'
import { useEmailMarketing } from '@/hooks/email-marketing/use-marketing'
import React from 'react'
import { CustomerTable } from './customer-table'
import { Button } from '../ui/button'
import { MailPlus, Plus } from 'lucide-react'
import Modal from '../mondal'
import { Card, CardContent, CardDescription, CardTitle } from '../ui/card'
import { Loader } from '../loader'
import FormGenerator from '../forms/form-generator'
import { cn, getMonthName } from '@/lib/utils'
import CalIcon from '@/icons/cal-icon'
import PersonIcon from '@/icons/person-icon'
import { EditEmail } from './edit-email'

type Props = {
  domains: {
    customer: {
      Domain: {
        name: string
      } | null
      id: string
      email: string | null
    }[]
  }[]
  campaign: {
    name: string
    id: string
    customers: string[]
    createdAt: Date
  }[]
  subscription: {
    plan: 'FREE' | 'STARTER' | 'PRO' | 'BUSINESS'
  } | null
}

const EmailMarketing = ({ campaign, domains, subscription }: Props) => {
  const {
    onSelectedEmails,
    isSelected,
    onCreateCampaign,
    register,
    errors,
    loading,
    onSelectCampaign,
    processing,
    onAddCustomersToCampaign,
    campaignId,
    onBulkEmail,
    onSetAnswersId,
    isId,
    registerEmail,
    emailErrors,
    onCreateEmailTemplate,
    setValue,
  } = useEmailMarketing()

  return (
    <div className="grid w-full grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
      <div className="flex flex-col gap-3 xl:col-span-2 sm:flex-row sm:items-end sm:justify-between"><div><h2 className="text-lg font-semibold text-slate-950">Lead audience</h2><p className="mt-1 text-xs text-slate-500">Select captured contacts, organize them into campaigns, and follow up.</p></div><span className="text-xs font-medium text-slate-400">{campaign?.length || 0} campaign{campaign?.length === 1 ? '' : 's'} · {subscription?.plan || 'FREE'} plan</span></div>
      <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
        <CustomerTable domains={domains} onId={onSetAnswersId} onSelect={onSelectedEmails} select={isSelected} id={isId} />
      </div>
      <div className="min-w-0">
        <div className="mb-4 flex flex-wrap gap-2 xl:justify-end">
          <Button
            disabled={isSelected.length == 0}
            onClick={onAddCustomersToCampaign}
          >
            <Plus /> Add to campaign
          </Button>
          <Modal
            title="Create a new campaign"
            description="Add your customers and create a marketing campaign"
            trigger={
              <Button variant="outline" className="h-10 rounded-xl border-slate-200 bg-white text-xs font-semibold text-slate-700 shadow-sm"><Plus className="h-4 w-4" /> Create campaign</Button>
            }
          >
            <form
              className="flex flex-col gap-4"
              onSubmit={onCreateCampaign}
            >
              <FormGenerator
                name="name"
                register={register}
                errors={errors}
                inputType="input"
                placeholder="your campaign name"
                type="text"
              />
              <Button
                className="w-full"
                disabled={loading}
                type="submit"
              >
                <Loader loading={loading}>Create Campaign</Loader>
              </Button>
            </form>
          </Modal>
        </div>
        <div className="flex flex-col gap-3">
          {!campaign?.length && <div className="rounded-2xl border border-dashed border-slate-300 bg-white px-6 py-12 text-center"><span className="mx-auto grid h-11 w-11 place-items-center rounded-xl bg-indigo-50 text-indigo-600"><MailPlus className="h-5 w-5" /></span><p className="mt-4 text-sm font-semibold text-slate-800">No campaigns yet</p><p className="mt-1 text-xs leading-5 text-slate-500">Create a campaign, then add selected leads from the audience table.</p></div>}
          {campaign &&
            campaign.map((camp, i) => (
              <Card
                key={camp.id}
                className={cn(
                  'w-full cursor-pointer rounded-2xl border-slate-200 p-5 shadow-sm transition hover:border-[#5b5ce2]/25',
                  campaignId == camp.id ? 'bg-indigo-50/50 ring-2 ring-[#5b5ce2]/15' : 'bg-white'
                )}
                onClick={() => onSelectCampaign(camp.id)}
              >
                <Loader loading={processing}>
                  <CardContent className="p-0 flex flex-col items-center gap-3">
                    <div className="flex w-full flex-col justify-between gap-3 sm:flex-row sm:items-center">
                      <div className="flex gap-2 items-center">
                        <CalIcon />
                        <CardDescription>
                          Created {getMonthName(camp.createdAt.getMonth())}{' '}
                          {camp.createdAt.getDate()}th
                        </CardDescription>
                      </div>
                      <div className="flex gap-2">
                        <PersonIcon />
                        <CardDescription>
                          {camp.customers.length} customers added
                        </CardDescription>
                      </div>
                    </div>
                    <div className="flex w-full justify-between items-center">
                      <CardTitle className="text-xl">{camp.name}</CardTitle>
                      <div className="flex gap-3">
                        <Modal
                          title="Edit Email"
                          description="This email will be sent to campaign members"
                          trigger={
                            <Card className="rounded-lg cursor-pointer bg-secondary py-2 px-5 font-semibold text-sm hover:bg-secondary/80 text-brand-primary">
                              Edit Email
                            </Card>
                          }
                        >
                          <EditEmail
                            register={registerEmail}
                            errors={emailErrors}
                            setDefault={setValue}
                            id={camp.id}
                            onCreate={onCreateEmailTemplate}
                          />
                        </Modal>
                        <Button
                          variant="default"
                          className="rounded-lg"
                          onClick={() =>
                            onBulkEmail(
                              campaign[i].customers.map((c) => c),
                              camp.id
                            )
                          }
                        >
                          Send
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Loader>
              </Card>
            ))}
        </div>
      </div>
    </div>
  )
}

export default EmailMarketing
