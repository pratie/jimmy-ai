'use client'
import React from 'react'
import { useHelpDesk } from '@/hooks/settings/use-settings'
import FormGenerator from '../form-generator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'
import Accordion from '@/components/accordian'

type Props = {
  id: string
}

/**
 * Curated answers, inside the workspace's Behaviour section.
 *
 * It used to be a two-column shadcn card with its own title, which made sense
 * as a page and none at all inside a narrow config column. The list of existing
 * answers now sits under the composer rather than beside it, and the card
 * chrome is gone: the section it lives in already provides it.
 */
const HelpDesk = ({ id }: Props) => {
  const { register, errors, onSubmitQuestion, isQuestions, loading } = useHelpDesk(id)

  return (
    <div className="flex flex-col gap-3">
      <div className="text-[12px] font-semibold text-foreground">
        <FormGenerator
          inputType="input"
          register={register}
          errors={errors}
          form="help-desk-form"
          name="question"
          placeholder="A question visitors keep asking"
          type="text"
        />
      </div>
      <div className="text-[12px] font-semibold text-foreground">
        <FormGenerator
          inputType="textarea"
          register={register}
          errors={errors}
          name="answer"
          form="help-desk-form"
          placeholder="The answer it should always give"
          type="text"
          lines={3}
        />
      </div>
      <Button
        type="button"
        onClick={() => onSubmitQuestion()}
        className="h-8 self-start rounded-lg bg-primary px-3.5 text-[12.5px] font-semibold text-primary-foreground hover:bg-primary/90"
      >
        Add answer
      </Button>

      <Loader loading={loading}>
        {isQuestions.length ? (
          <div className="max-h-72 overflow-y-auto rounded-lg border border-border">
            {isQuestions.map((question) => (
              <Accordion key={question.id} trigger={question.question} content={question.answer} />
            ))}
          </div>
        ) : (
          <p className="text-[11.5px] text-muted-foreground">
            No curated answers yet. Everything is answered from the knowledge base.
          </p>
        )}
      </Loader>
    </div>
  )
}

export default HelpDesk
