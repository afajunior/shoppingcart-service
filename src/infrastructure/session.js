const ttl = () => Number(process.env.CART_EXPIRATION_SECONDS)
export const getSession = (redis, id) => redis.get(`session:${id}`).then((d) => (d ? JSON.parse(d) : null))
export const setSession = (redis, id, data) => redis.set(`session:${id}`, JSON.stringify(data), { EX: ttl() })
