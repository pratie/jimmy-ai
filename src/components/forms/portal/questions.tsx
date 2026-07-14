import React from 'react'
import { FieldErrors, FieldValues, UseFormRegister } from 'react-hook-form'
import FormGenerator from '../form-generator'
import { Button } from '@/components/ui/button'
import { Loader } from '@/components/loader'

type Props = {
  questions: {
    id: string
    question: string
    answered: string | null
  }[]
  register: UseFormRegister<FieldValues>
  error: FieldErrors<FieldValues>
  onNext(): void
}

const QuestionsForm = ({ questions, register, error, onNext }: Props) => {
  return (
    <div className="mx-auto max-w-xl">
      <h2 className="text-2xl font-semibold tracking-[-0.03em] text-slate-950">A few details first</h2>
      <p className="mt-2 text-sm leading-6 text-slate-500">Confirm the information shared in the conversation before continuing.</p>
      <div className="mt-7 space-y-5">{questions.map((question) => (
        <FormGenerator
          defaultValue={question.answered || ''}
          key={question.id}
          name={`question-${question.id}`}
          errors={error}
          register={register}
          label={question.question}
          type="text"
          inputType="input"
          placeholder={question.answered || 'Not answered'}
        />
      ))}</div>

      <Button
        className="mt-7 h-11 w-full rounded-xl text-sm font-semibold text-white hover:opacity-90"
        style={{ backgroundColor: 'var(--portal-accent)' }}
        type="button"
        onClick={onNext}
      >
        Continue
      </Button>
    </div>
  )
}

export default QuestionsForm
