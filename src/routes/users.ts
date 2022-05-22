/**
 * Added user.ts file because there can be other user related routes here. 
 * (routes other than reawrd which are related to user can be defined here)
 * We can import rewards related routes from rewards.ts and use them in user routes.
 * In this way user.ts will remain cleaner
 */

import express from 'express'
const router = express.Router()
import rewardRoutes from './rewards'

router.use('/', rewardRoutes)

export default router;