'use client'
import { useEmailMarketing } from '@/hooks/email-marketing/use-marketing'
import React from 'react'
import { CustomerTable } from './customer-table'
import { Button } from '../ui/button'
import { Plus } from 'lucide-react'
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
    <div className="grid w-full grid-cols-1 gap-6 xl:grid-cols-[minmax(0,1fr)_minmax(380px,0.9fr)]">
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
              <Card className="flex cursor-pointer items-center gap-2 rounded-xl border-slate-200 px-3 text-xs font-bold shadow-sm">
                <Loader loading={false}>
                  <Plus /> Create Campaign
                </Loader>
              </Card>
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
          <Card className="rounded-xl border-slate-200 p-2.5 shadow-sm">
            <CardDescription className="font-bold">
              {subscription?.plan || 'FREE'} Plan
            </CardDescription>
          </Card>
        </div>
        <div className="flex flex-col gap-3">
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
