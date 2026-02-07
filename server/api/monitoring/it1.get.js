// API endpoint for IT1 real-time monitoring data
import { queryInfluxDB, buildGenericQuery } from '~/server/lib/db/influxdb'

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig()
    // Fields based on reference: "Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"
    // Although the prompt says IT1/IT2 are battery parameters, the reference uses these fields. I'll stick to the referencefields for now to be safe, 
    // or better yet, I should check if there are specific battery fields. 
    // The prompt says: "Data it1 dan it2 adalah parameter dari baterai yang terdiri dari 2 feeder."
    // But the reference code for IT1 queries: "Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"
    // I will use the fields from the reference code as requested ("Anda bisa melihat pada folder @referensi/api").

    const fields = ["Active Power", "Reactive Power", "Voltage", "Current", "Power Factor", "Frequency"]
    const query = buildGenericQuery(config.influxBucket, 'IT1', fields)

    try {
        const result = await queryInfluxDB(config, query)
        return result
    } catch (error) {
        console.error('IT1 API error:', error)
        throw createError({
            statusCode: 500,
            message: 'Failed to fetch IT1 data'
        })
    }
})
