export default async () => {
  await global.__MAILHOG__?.stop()
  await global.__POSTGRES__?.stop()
  await global.__REDIS__?.stop()
}
