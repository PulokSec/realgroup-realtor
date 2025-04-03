import jwt from "jsonwebtoken"

interface DecodedToken {
  userId: string
  email: string
  role: string
  isAdmin: boolean
  isVerified: boolean
  iat: number
  exp: number
}

export const verifyJwtToken = (token: string): Promise<DecodedToken> => {
  return new Promise((resolve, reject) => {
    jwt.verify(token, process.env.JWT_SECRET!, (err, decoded) => {
      if (err) {
        return reject(err)
      }
      resolve(decoded as DecodedToken)
    })
  })
}

