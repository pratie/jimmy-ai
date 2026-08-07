import React from 'react'
import { Card } from '../ui/card'
import { CloudIcon } from 'lucide-react'
import { Separator } from '../ui/separator'
import Modal from '../mondal'
import { IntegrationModalBody } from './integration-modal-body'

type Props = {
  name: 'stripe'
  logo: string
  title: string
  descrioption: string
  connections: {
    [key in 'stripe']: boolean
  }
}

const IntegrationTrigger = ({
  name,
  logo,
  title,
  descrioption,
  connections,
}: Props) => {
  return (
    <Modal
      title={title}
      type="Integration"
      logo={logo}
      description={descrioption}
      trigger={
        <Card className="flex cursor-pointer items-center gap-2 rounded-lg border-border bg-card px-3 py-2 text-sm font-semibold text-foreground transition-colors hover:bg-muted">
          <CloudIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
          {connections[name] ? 'Connected' : 'Connect'}
        </Card>
      }
    >
      <Separator orientation="horizontal" />
      <IntegrationModalBody
        connections={connections}
        type={name}
      />
    </Modal>
  )
}

export default IntegrationTrigger
