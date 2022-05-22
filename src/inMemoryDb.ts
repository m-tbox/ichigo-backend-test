import { Reward, RewardsList } from "./interfaces";
import { getDateFromDateTime, getSaturdayOfWeek, getSundayOfWeek } from "./utils/date";

// Create a hash map to store data
const rewardsData: RewardsList = {}

// Check that is there any data saved (return true is there is data in the hash map)
export const hasRewardsForUser = (userId: string): boolean => {
    return rewardsData[userId] && rewardsData[userId].length > 0
}

// Get all Rewards of a single user with provided id
export const getAllRewardByUserId = (userId: string): Reward[] => {
    return rewardsData[userId]
}

// Add reward to user's data
export const pushRewardToUserById = (userId: string, reward: Reward): void => {

    rewardsData[userId].push(reward)
}

// Add record if User id not already present
export const addUserRewardFirstTime = (userId: string, reward: Reward): void => {
    rewardsData[userId] = [reward]
}

// Update data after user Redeems the reward
export const redeemRward = (userId: string, udpatedReward: Reward[]): void => {
    rewardsData[userId] = udpatedReward
}

// Get weekly reward of user for the given data
export const getWeeklyRewardByUserId = (userId: string, date: string): Reward[] => {
    const sundayOfWeek = getSundayOfWeek(date)
    const saturdayOfWeek = getSaturdayOfWeek(date)

    // Get date in the date range
    return rewardsData[userId].filter((reward: Reward) => {

        /**
         * Get date without the time passed in request so that dates can be compared.
         * This is done so that if request has different time but same date 
         * so it will pass the comparison check and returnd in response 
         * as while adding the dates in user's reward same thing is done i.e. 
         * if same date with a different time is sent in request than only first one is kept and second is not 
         * added in in memory DB to avoid duplication of dates
         */
        const startDate = getDateFromDateTime(sundayOfWeek)
        const endDate = getDateFromDateTime(saturdayOfWeek)
        const availableDate = getDateFromDateTime(reward.availableAt)
        
        return startDate.valueOf() <= availableDate.valueOf()
            && endDate.valueOf() >= availableDate.valueOf()
    })
}