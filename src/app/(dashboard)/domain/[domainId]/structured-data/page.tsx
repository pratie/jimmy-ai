import { PrismaClient } from '@prisma/client'
import { UploadDataForm } from '@/components/structured-data/upload-form'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format } from 'date-fns'

import { client as prisma } from '@/lib/prisma'

export default async function StructuredDataPage({
    params,
}: {
    params: { domainId: string }
}) {
    const datasets = await prisma.recordManager.findMany({
        where: {
            domainId: params.domainId,
            type: 'tabular',
        },
        orderBy: {
            createdAt: 'desc',
        },
    })

    return (
        <div className="flex flex-col gap-8 p-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold">Structured Data Manager</h1>
            </div>

            <UploadDataForm domainId={params.domainId} />

            <div className="grid gap-4">
                <h2 className="text-xl font-semibold">Uploaded Datasets</h2>
                {datasets.length === 0 ? (
                    <p className="text-gray-500">No datasets uploaded yet.</p>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {datasets.map((dataset) => (
                            <Card key={dataset.id}>
                                <CardHeader>
                                    <CardTitle className="truncate" title={dataset.title}>
                                        {dataset.title}
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-sm text-gray-500 space-y-2">
                                        <p>ID: {dataset.id}</p>
                                        <p>Uploaded: {format(dataset.createdAt, 'PPP')}</p>
                                        <div>
                                            <span className="font-medium">Schema:</span>
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {(dataset.schema as string[])?.map((field) => (
                                                    <span
                                                        key={field}
                                                        className="px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs"
                                                    >
                                                        {field}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
