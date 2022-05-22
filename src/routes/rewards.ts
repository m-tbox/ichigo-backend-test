import express from 'express'
import { GET_REWARD_ERROR_MSG } from '../../constants';
import { StatusCode } from '../enums/apiEnums';
import {
    addUserRewardFirstTime,
    getAllRewardByUserId,
    getWeeklyRewardByUserId,
    hasRewardsForUser,
    pushRewardToUserById,
    redeemRward,
} from '../inMemoryDb';
import { Reward } from '../interfaces';
import {
    areDatesEqual,
    getSaturdayOfWeek,
    getSundayOfWeek,
    isDateValid
} from '../utils/date';

const router = express.Router()

// Api to get weekly Reward of user 
router.get('/:id/rewards', (req, res) => {
    const { id } = req.params;
    const at = req.query.at as string

    // Check if date passed in params is a valid date or not
    const isDateInputValid = isDateValid(new Date(at))

    if (at && isDateInputValid) {

        /**
         * Calulate the date of Sunday and Saturday of the week
         */
        const sundayOfWeek = getSundayOfWeek(at)
        const saturdayOfWeek = getSaturdayOfWeek(at)

        // Loop through the date range i.e. Sunday through Saturday
        for (let date = sundayOfWeek; date <= saturdayOfWeek; date.setDate(date.getDate() + 1)) {

            /**
             * All the rewards of user are retrieved so that we can check
             * that a reward for particular date is already present in saved data or not.
             * If the week is present then break the loop and don't add record
             */
            const usersReward = getAllRewardByUserId(id)

            // setUTCHours is used to cater for different timezones while setting time of availableAt to midnight
            const availableAt = new Date(date.setUTCHours(0, 0, 0, 0))

            /**
             * In order to calculate expiry date we need to add 24 hours in the available date.
             * availableAt.valueOf() return date in miliseconds so we added 1 day in miliseconds to get expiry date
             * 1 day = 24 hours =  ( 24 * 60 * 60 * 1000 ) ms
             */
            const expiresAt = new Date(availableAt.valueOf() + 24 * 60 * 60 * 1000)

            const reward = { availableAt, redeemedAt: null, expiresAt }

            if (hasRewardsForUser(id)) {

                // If the week is already added for user then break the loop and don't add
                if (areDatesEqual(usersReward[0].availableAt, availableAt)) {
                    console.log('Break loop')
                    break
                }

                // If date already present don't add it to avoid duplication of same date
                const found = usersReward.some((reward: Reward) => {
                    const rewardAvailableDate = new Date(reward.availableAt)

                    /**
                     * While adding date to in memory DB, check date not the time so that 
                     * duplication of same date with different time can be avoided
                     */
                    return areDatesEqual(rewardAvailableDate, availableAt)
                })

                if (!found) {
                    pushRewardToUserById(id, reward)
                }
            } else {
                // If no data present for this user than add a new one i.e user id key is not present in Reward list object
                addUserRewardFirstTime(id, reward)
            }
        }

        // Returning weekly reward
        res.status(StatusCode.OK).json({
            data: getWeeklyRewardByUserId(id, at)
        })
    }
    else {
        /**
         * Either 'at' param (i.e date) is missing in the call or it is not a valid date
         */

        res.status(StatusCode.BAD_REQUEST).json({
            error: {
                message: GET_REWARD_ERROR_MSG.inavlidData
            }
        })
    }

})

// Api to redeeem reward
router.patch("/:id/rewards/:date/redeem", (req, res) => {
    const { id, date } = req.params
    const usersReward = getAllRewardByUserId(id)
    const availableAt = new Date(date)

    // Check if date passed in params is a valid date or not
    const isDateInputValid = isDateValid(new Date(date))

    // If date is not valid than return and give the proper response
    if (!isDateInputValid) {
        return res.status(StatusCode.BAD_REQUEST).json({
            error: {
                message: GET_REWARD_ERROR_MSG.inavlidData
            }
        })
    }

    // Check if user has any reawrds in the List
    if (usersReward && usersReward.length) {

        /**
         * Get index of the reward object that has avaliableAt 
         * date greater than equal to the date passed in api request
         */
        const dateToRedeemIndex = usersReward.findIndex(((reward: Reward) => {
            const rewardAvailableDate = new Date(reward.availableAt)
            return areDatesEqual(rewardAvailableDate, availableAt)
        }));

        /**
         * If index is greater than -1 that means the date passed in params 
         * is present in user's reward array
         */

        if (dateToRedeemIndex > -1) {

            // Get date in iso time string to cater for different timezones and get datetime in utc
            
            const currDateInISOString = new Date().toISOString()
            const currentDateTime = new Date(currDateInISOString)

            const dateToRedeem = usersReward[dateToRedeemIndex]

            if (dateToRedeem.availableAt.valueOf() > currentDateTime.valueOf()) {
                /**
                 * Cannot redeem the reward as date is in future
                 */

                res.status(StatusCode.OK).json({
                    error: {
                        message: GET_REWARD_ERROR_MSG.redeemFutureDateError
                    }
                })
            } else if (dateToRedeem.expiresAt.valueOf() < currentDateTime.valueOf()) {
                /**
                 * Cannot redeem the reward as it has been expired
                 */

                res.status(StatusCode.OK).json({
                    error: {
                        message: GET_REWARD_ERROR_MSG.rewardExpired
                    }
                })
            } else if (usersReward[dateToRedeemIndex].redeemedAt) {
                res.status(StatusCode.OK).json({
                    error: {
                        message: GET_REWARD_ERROR_MSG.rewardAlreadyRedeemed
                    }
                })
            } else {

                /**
                 * Updated the redeemedAt to current date time
                 */

                const updateReward = { ...dateToRedeem, redeemedAt: currentDateTime }
                usersReward[dateToRedeemIndex] = updateReward
                redeemRward(id, usersReward)
                res.status(StatusCode.OK).json({ data: updateReward })
            }
        }
        else {
            /**
             * User's reward array does not have the date passed in params 
             */

            res.status(StatusCode.NOT_FOUND).json({
                error: {
                    message: GET_REWARD_ERROR_MSG.dateNotFoundToRedeem
                }
            })
        }
    }
    else {
        /**
         * There no record added for this user yet
         */

        res.status(StatusCode.NOT_FOUND).json({
            error: {
                message: GET_REWARD_ERROR_MSG.noRecordFounToUpdate
            }
        })
    }
})

export default router