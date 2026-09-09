import { InfluxDB } from '@influxdata/influxdb-client'
import fs from 'fs'

const queryApi = new InfluxDB({url: 'http://localhost:8086', token: 'r3bK4wYgZ1q5X7uH9jN2mC6pT8vF0sL4'}).getQueryApi('NusantaraPower')

const query = `
  from(bucket: "tahuna-load-monitoring")
  |> range(start: -5m)
  |> filter(fn: (r) => r._measurement == "PM-DG6" and r._field == "Frequency")
  |> last()
`
queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(o._measurement, o._field, o._value)
  },
  error(error) {
    console.error(error)
  },
  complete() {
    console.log('Finished')
  }
})
