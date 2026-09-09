import { InfluxDB } from '@influxdata/influxdb-client'

const queryApi = new InfluxDB({url: 'http://100.82.112.35:8086', token: 'hm4BNSGOAnzErPG2Ge2ox6PKPC-wL_7doAhBPiw8qCYU6lxGVmSgKGO0z__GQX2g8fPmGR-q4QyyuBaegpHGzQ=='}).getQueryApi('upmh-tahuna')

const query = `
  from(bucket: "ipc-tahuna")
  |> range(start: -1m)
  |> filter(fn: (r) => r._measurement == "PM-DG9" or r._measurement == "PM-DG8" or r._measurement == "PM-DG7" or r._measurement == "PM-DG6" or r._measurement == "PM-DG1")
  |> filter(fn: (r) => r._field == "Frequency")
  |> last()
`
queryApi.queryRows(query, {
  next(row, tableMeta) {
    const o = tableMeta.toObject(row)
    console.log(o._measurement, o._value)
  },
  error(error) {
    console.error(error)
  },
  complete() {
    console.log('Finished')
  }
})
